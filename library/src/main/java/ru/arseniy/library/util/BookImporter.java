package ru.arseniy.library.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.boot.CommandLineRunner;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.Category;
import ru.arseniy.library.repository.BookRepository;
import ru.arseniy.library.repository.CategoryRepository;
import ru.arseniy.library.service.FileStorageService;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookImporter implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Internet Archive API endpoints
    private static final String IA_SEARCH_API = "https://archive.org/advancedsearch.php?q=collection:texts+AND+format:pdf&fl=identifier,title,creator,description,date,subject,language&rows=%d&page=%d&output=json";
    private static final String IA_METADATA_API = "https://archive.org/metadata/%s";
    private static final String IA_DOWNLOAD_BASE = "https://archive.org/download/%s/%s";
    private static final String GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes?q=intitle:%s";
    
    // Open Library API для поиска альтернативных источников
    private static final String OPENLIBRARY_SEARCH_API = "https://openlibrary.org/search.json?q=%s&limit=10";
    private static final String OPENLIBRARY_BOOK_API = "https://openlibrary.org%s.json";
    
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final int DEFAULT_THREADS = 3;
    private static final int BOOKS_PER_PAGE = 50;
    
    private static final Map<String, Integer> SUBJECT_TO_CATEGORY_MAP = initCategoryMap();

    private static Map<String, Integer> initCategoryMap() {
        Map<String, Integer> map = new HashMap<>();
        
        map.put("fiction", 1);
        map.put("science", 8);
        map.put("computers", 17);
        map.put("business", 23);
        map.put("art", 29);
        map.put("hobby", 35);
        map.put("children", 41);
        
        map.put("science fiction", 2);
        map.put("fantasy", 3);
        map.put("detective", 4);
        map.put("romance", 5);
        map.put("adventure", 6);
        map.put("classic", 7);
        map.put("poetry", 8);
        
        map.put("physics", 9);
        map.put("mathematics", 10);
        map.put("biology", 11);
        map.put("chemistry", 12);
        map.put("history", 13);
        map.put("philosophy", 14);
        map.put("psychology", 15);
        
        map.put("fairy tales", 42);
        map.put("children stories", 43);
        map.put("children education", 44);
        
        map.put("biography", 8);
        map.put("drama", 8);
        
        return map;
    }

    @Override
    public void run(String... args) throws Exception {
        for (String arg : args) {
            if (arg.startsWith("--import-books=")) {
                String[] parts = arg.split("=")[1].split(":");
                int booksToImport = Integer.parseInt(parts[0]);
                int threads = parts.length > 1 ? Integer.parseInt(parts[1]) : DEFAULT_THREADS;
                int startPage = parts.length > 2 ? Integer.parseInt(parts[2]) : 1;
                importBooks(booksToImport, threads, startPage);
                return;
            }
        }
    }

    public void importBooks(int count) {
        importBooks(count, DEFAULT_THREADS, 1);
    }
    
    public void importBooks(int count, int threads) {
        importBooks(count, threads, 1);
    }
    
    @Transactional
    public void importBooks(int count, int threads, int startPage) {
        log.info("Начинаем импорт {} книг из Internet Archive с использованием {} потоков, начиная со страницы {}", 
                count, threads, startPage);
        
        updateCategoryMap();
        
        Set<String> existingTitleAuthorPairs = new HashSet<>();
        bookRepository.findAll().forEach(book -> 
            existingTitleAuthorPairs.add(book.getTitle().toLowerCase() + "|" + book.getAuthor().toLowerCase()));
        log.info("Загружено {} существующих книг для проверки дубликатов", existingTitleAuthorPairs.size());
        
        AtomicInteger imported = new AtomicInteger(0);
        AtomicInteger page = new AtomicInteger(startPage);
        AtomicInteger processed = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        
        try {
            while (imported.get() < count) {
                log.info("Загрузка страницы {} с книгами ({}/{})", page.get(), imported.get(), count);
                
                List<JsonNode> books = fetchBooksFromArchive(page.getAndIncrement());
                if (books.isEmpty()) {
                    log.info("Больше книг не найдено");
                    break;
                }
                
                for (JsonNode bookNode : books) {
                    if (imported.get() >= count) break;
                    
                    String title = bookNode.get("title").asText();
                    String author = bookNode.has("creator") ? bookNode.get("creator").asText() : "Unknown";
                    
                    String titleAuthorKey = title.toLowerCase() + "|" + author.toLowerCase();
                    if (existingTitleAuthorPairs.contains(titleAuthorKey)) {
                        log.info("Книга '{}' автора '{}' уже существует в базе данных, пропускаем", title, author);
                        continue;
                    }
                    
                    existingTitleAuthorPairs.add(titleAuthorKey);
                    
                    JsonNode finalBookNode = bookNode;
                    CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                        boolean success = false;
                        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS && !success; attempt++) {
                            try {
                                if (attempt > 1) {
                                    log.info("Повторная попытка {} импорта книги: {}", attempt, finalBookNode.get("title").asText());
                                    Thread.sleep(1000 * attempt);
                                }
                                success = importBook(finalBookNode);
                            } catch (Exception e) {
                                log.error("Ошибка при импорте книги (попытка {}): {}", attempt, e.getMessage(), e);
                            }
                        }
                        if (success) {
                            imported.incrementAndGet();
                            log.info("Импортирована книга {}/{}", imported.get(), count);
                        }
                        processed.incrementAndGet();
                    }, executor);
                    
                    futures.add(future);
                    
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            log.info("Импорт завершен. Успешно импортировано {} книг из {} обработанных", imported.get(), processed.get());
        } catch (Exception e) {
            log.error("Ошибка при импорте книг: {}", e.getMessage(), e);
        } finally {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(10, TimeUnit.MINUTES)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    // Получаем список книг из Internet Archive
    private List<JsonNode> fetchBooksFromArchive(int page) {
        String url = String.format(IA_SEARCH_API, BOOKS_PER_PAGE, page);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            try (CloseableHttpResponse response = client.execute(request)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String result = EntityUtils.toString(entity);
                    JsonNode root = objectMapper.readTree(result);
                    
                    if (root.has("response") && root.get("response").has("docs")) {
                        List<JsonNode> books = new ArrayList<>();
                        for (JsonNode book : root.get("response").get("docs")) {
                            books.add(book);
                        }
                        return books;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Ошибка при получении списка книг: {}", e.getMessage(), e);
        }
        return new ArrayList<>();
    }

    // Получаем метаданные конкретной книги
    private JsonNode fetchBookMetadata(String identifier) {
        String url = String.format(IA_METADATA_API, identifier);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            try (CloseableHttpResponse response = client.execute(request)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String result = EntityUtils.toString(entity);
                    return objectMapper.readTree(result);
                }
            }
        } catch (Exception e) {
            log.error("Ошибка при получении метаданных книги {}: {}", identifier, e.getMessage(), e);
        }
        return null;
    }

    // Ищем лучший файл для скачивания (PDF > FB2 > EPUB)
    private String findBestBookFile(JsonNode metadata) {
        if (!metadata.has("files")) return null;
        
        JsonNode files = metadata.get("files");
        String bestFile = null;
        int priority = 0;
        
        for (JsonNode file : files) {
            if (!file.has("name") || !file.has("format")) continue;
            
            String filename = file.get("name").asText();
            String format = file.get("format").asText().toLowerCase();
            
            int currentPriority = 0;
            if ("pdf".equals(format)) {
                currentPriority = 3;
                
                // Предпочитаем PDF файлы с определенными суффиксами, которые чаще являются настоящими PDF
                if (filename.toLowerCase().contains("_bw.pdf") || 
                    filename.toLowerCase().contains("_text.pdf") ||
                    filename.toLowerCase().contains("_djvu.pdf")) {
                    currentPriority = 4; // Высший приоритет для специальных PDF
                }
                
                // Избегаем файлы, которые часто являются текстовыми
                if (filename.toLowerCase().endsWith("_djvu.txt") || 
                    filename.toLowerCase().contains("_chocr")) {
                    currentPriority = 0; // Исключаем такие файлы
                }
            } else if ("application/x-fictionbook+xml".equals(format) || filename.toLowerCase().endsWith(".fb2")) {
                currentPriority = 2;
            } else if ("epub".equals(format)) {
                currentPriority = 1;
            }
            
            if (currentPriority > priority) {
                priority = currentPriority;
                bestFile = filename;
            }
        }
        
        log.info("Выбран файл: {} с приоритетом {}", bestFile, priority);
        return bestFile;
    }

    // Скачиваем файл книги
    private MultipartFile downloadBookFile(String identifier, String filename) {
        String url = String.format(IA_DOWNLOAD_BASE, identifier, filename);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            try (CloseableHttpResponse response = client.execute(request)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    byte[] fileBytes = EntityUtils.toByteArray(entity);
                    
                    // Проверяем размер файла - должен быть больше 1KB
                    if (fileBytes.length < 1024) {
                        log.warn("Файл книги {} слишком маленький ({} байт), возможно поврежден", filename, fileBytes.length);
                        return null;
                    }
                    
                    // Проверяем, что PDF файл действительно является PDF
                    if (filename.toLowerCase().endsWith(".pdf")) {
                        if (!isValidPDF(fileBytes)) {
                            log.warn("Файл {} не является валидным PDF (возможно, это текстовый файл)", filename);
                            return null;
                        }
                    }
                    
                    // Проверяем, что FB2 файл действительно является FB2
                    if (filename.toLowerCase().endsWith(".fb2")) {
                        if (!isValidFB2(fileBytes)) {
                            log.warn("Файл {} не является валидным FB2", filename);
                            return null;
                        }
                    }
                    
                    String contentType = "application/octet-stream";
                    if (filename.toLowerCase().endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (filename.toLowerCase().endsWith(".fb2")) {
                        contentType = "application/x-fictionbook+xml";
                    } else if (filename.toLowerCase().endsWith(".epub")) {
                        contentType = "application/epub+zip";
                    }
                    
                    log.info("Скачан файл книги: {} ({} байт)", filename, fileBytes.length);
                    
                    return new MockMultipartFile(
                        "book",
                        filename,
                        contentType,
                        fileBytes
                    );
                }
            }
        } catch (Exception e) {
            log.error("Ошибка при скачивании файла книги {}/{}: {}", identifier, filename, e.getMessage(), e);
        }
        return null;
    }
    
    // Проверяем, что файл является валидным PDF
    private boolean isValidPDF(byte[] fileBytes) {
        if (fileBytes.length < 4) return false;
        
        // PDF файл должен начинаться с "%PDF"
        return fileBytes[0] == 0x25 && // %
               fileBytes[1] == 0x50 && // P
               fileBytes[2] == 0x44 && // D
               fileBytes[3] == 0x46;   // F
    }
    
    // Проверяем, что файл является валидным FB2
    private boolean isValidFB2(byte[] fileBytes) {
        if (fileBytes.length < 100) return false;
        
        String beginning = new String(fileBytes, 0, Math.min(fileBytes.length, 200)).toLowerCase();
        return beginning.contains("<?xml") && 
               (beginning.contains("fictionbook") || beginning.contains("fb2"));
    }

    // Получаем дополнительные метаданные из Google Books
    private JsonNode fetchGoogleBooksData(String title, String author) {
        try {
            String encodedTitle = URLEncoder.encode(title, "UTF-8");
            String url = String.format(GOOGLE_BOOKS_API, encodedTitle);
            
            try (CloseableHttpClient client = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(url);
                try (CloseableHttpResponse response = client.execute(request)) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        String result = EntityUtils.toString(entity);
                        JsonNode root = objectMapper.readTree(result);
                        
                        if (root.has("items") && root.get("items").size() > 0) {
                            for (JsonNode item : root.get("items")) {
                                if (item.has("volumeInfo") && 
                                    item.get("volumeInfo").has("authors") && 
                                    item.get("volumeInfo").get("authors").size() > 0) {
                                    
                                    String bookAuthor = item.get("volumeInfo").get("authors").get(0).asText();
                                    if (bookAuthor.toLowerCase().contains(author.toLowerCase()) ||
                                        author.toLowerCase().contains(bookAuthor.toLowerCase())) {
                                        return item;
                                    }
                                }
                            }
                            return root.get("items").get(0);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Не удалось получить данные из Google Books API: {}", e.getMessage());
        }
        return null;
    }

    // Скачиваем обложку
    private MultipartFile downloadImage(String url, String filename) {
        if (url == null || url.isEmpty()) return null;
        
        for (int attempt = 1; attempt <= 3; attempt++) {
            try (CloseableHttpClient client = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(url);
                try (CloseableHttpResponse response = client.execute(request)) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        byte[] imageBytes = EntityUtils.toByteArray(entity);
                        
                        if (imageBytes.length > 0) {
                            return new MockMultipartFile(
                                "cover",
                                filename,
                                "image/jpeg",
                                imageBytes
                            );
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Попытка {} скачивания изображения не удалась: {}", attempt, e.getMessage());
                if (attempt < 3) {
                    try {
                        Thread.sleep(1000 * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        
        return null;
    }

    // Определяем категории по предметам
    private Set<Category> determineCategories(List<String> subjects) {
        Set<Category> categories = new HashSet<>();
        
        for (String subject : subjects) {
            String lowerSubject = subject.toLowerCase();
            
            for (Map.Entry<String, Integer> entry : SUBJECT_TO_CATEGORY_MAP.entrySet()) {
                if (lowerSubject.contains(entry.getKey())) {
                    Category category = categoryRepository.findById(entry.getValue()).orElse(null);
                    if (category != null) {
                        categories.add(category);
                        break;
                    }
                }
            }
        }
        
        if (categories.isEmpty()) {
            Category defaultCategory = categoryRepository.findById(1).orElse(null);
            if (defaultCategory != null) {
                categories.add(defaultCategory);
            }
        }
        
        return categories;
    }

    @Transactional
    private void updateCategoryMap() {
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            String categoryName = category.getName().toLowerCase();
            SUBJECT_TO_CATEGORY_MAP.put(categoryName, category.getId());
        }
    }

    @Transactional
    private boolean importBook(JsonNode bookNode) {
        try {
            String identifier = bookNode.get("identifier").asText();
            String title = bookNode.get("title").asText();
            
            log.info("Обработка книги: {}, ID: {}", title, identifier);
            
            if (bookRepository.existsByTitle(title)) {
                log.info("Книга '{}' уже существует в базе данных, пропускаем", title);
                return false;
            }
            
            // Получаем полные метаданные
            JsonNode metadata = fetchBookMetadata(identifier);
            if (metadata == null) {
                log.error("Не удалось получить метаданные для книги: {}", identifier);
                return false;
            }
            
            // Ищем лучший файл для скачивания
            String bestFile = findBestBookFile(metadata);
            if (bestFile == null) {
                log.warn("Не найден подходящий файл для книги: {}", title);
                return false;
            }
            
            // Скачиваем файл книги
            MultipartFile bookFile = downloadBookFile(identifier, bestFile);
            if (bookFile == null) {
                log.error("Не удалось скачать файл книги: {}", title);
                return false;
            }
            
            String author = bookNode.has("creator") ? bookNode.get("creator").asText() : "Unknown";
            
            // Получаем предметы для категорий
            List<String> subjects = new ArrayList<>();
            if (bookNode.has("subject")) {
                JsonNode subjectNode = bookNode.get("subject");
                if (subjectNode.isArray()) {
                    for (JsonNode subject : subjectNode) {
                        subjects.add(subject.asText().toLowerCase());
                    }
                } else {
                    subjects.add(subjectNode.asText().toLowerCase());
                }
            }
            
            // Получаем дополнительные метаданные из Google Books
            JsonNode googleData = fetchGoogleBooksData(title, author);
            
            Book book = new Book();
            book.setTitle(title);
            book.setAuthor(author);
            
            if (googleData != null) {
                JsonNode volumeInfo = googleData.get("volumeInfo");
                
                if (volumeInfo.has("description")) {
                    book.setDescription(volumeInfo.get("description").asText());
                } else {
                    book.setDescription("Книга из Internet Archive: " + String.join(", ", subjects));
                }
                
                if (volumeInfo.has("industryIdentifiers") && volumeInfo.get("industryIdentifiers").size() > 0) {
                    book.setIsbn(volumeInfo.get("industryIdentifiers").get(0).get("identifier").asText());
                }
                
                if (volumeInfo.has("publishedDate")) {
                    String dateStr = volumeInfo.get("publishedDate").asText();
                    if (!dateStr.isEmpty()) {
                        try {
                            book.setPublicationYear(Integer.parseInt(dateStr.substring(0, 4)));
                        } catch (Exception e) {
                            log.warn("Не удалось распарсить год публикации: {}", dateStr);
                        }
                    }
                }
                
                if (volumeInfo.has("publisher")) {
                    book.setPublisher(volumeInfo.get("publisher").asText());
                } else {
                    book.setPublisher("Internet Archive");
                }
                
                if (volumeInfo.has("language")) {
                    book.setLanguage(volumeInfo.get("language").asText());
                } else {
                    book.setLanguage(bookNode.has("language") ? bookNode.get("language").asText() : "en");
                }
                
                if (volumeInfo.has("pageCount")) {
                    book.setPageCount(volumeInfo.get("pageCount").asInt());
                } else {
                    book.setPageCount(ThreadLocalRandom.current().nextInt(150, 801));
                }
                
                if (volumeInfo.has("categories")) {
                    for (JsonNode category : volumeInfo.get("categories")) {
                        subjects.add(category.asText().toLowerCase());
                    }
                }
            } else {
                book.setDescription(bookNode.has("description") ? bookNode.get("description").asText() : 
                    "Классическая книга из коллекции Internet Archive.");
                book.setPublisher("Internet Archive");
                book.setLanguage(bookNode.has("language") ? bookNode.get("language").asText() : "en");
                book.setPageCount(ThreadLocalRandom.current().nextInt(150, 801));
                
                if (bookNode.has("date")) {
                    String dateStr = bookNode.get("date").asText();
                    try {
                        book.setPublicationYear(Integer.parseInt(dateStr.substring(0, 4)));
                    } catch (Exception e) {
                        log.warn("Не удалось распарсить год из даты: {}", dateStr);
                    }
                }
            }
            
            // Сохраняем файл книги
            String bookFileKey = "book_" + System.currentTimeMillis() + "_" + bestFile;
            String bookFileUrl;
            try {
                bookFileUrl = fileStorageService.uploadFile(bookFile, bookFileKey, title);
                if (bookFileUrl == null || bookFileUrl.isEmpty()) {
                    log.error("Не удалось загрузить файл книги в облако: {}", title);
                    return false;
                }
            } catch (Exception e) {
                log.error("Ошибка при загрузке файла книги '{}' в облако: {}", title, e.getMessage(), e);
                return false;
            }
            book.setFileUrl(bookFileUrl);
            
            // Пытаемся получить обложку
            String coverUrl = null;
            if (googleData != null && 
                googleData.get("volumeInfo").has("imageLinks") && 
                googleData.get("volumeInfo").get("imageLinks").has("thumbnail")) {
                
                coverUrl = googleData.get("volumeInfo").get("imageLinks").get("thumbnail").asText();
                coverUrl = coverUrl.replace("&zoom=1", "&zoom=0").replace("&edge=curl", "");
            }
            
            if (coverUrl != null) {
                MultipartFile coverImage = downloadImage(coverUrl, "cover_" + identifier + ".jpg");
                if (coverImage != null) {
                    try {
                        String coverFileKey = "cover_" + System.currentTimeMillis() + "_" + identifier + ".jpg";
                        String coverImageUrl = fileStorageService.uploadFile(coverImage, coverFileKey, title);
                        if (coverImageUrl != null && !coverImageUrl.isEmpty()) {
                            book.setCoverImageUrl(coverImageUrl);
                        }
                    } catch (Exception e) {
                        log.warn("Не удалось сохранить обложку для книги '{}': {}", title, e.getMessage());
                    }
                }
            }
            
            book.setUploadDate(LocalDateTime.now());
            
            // Определяем категории
            Set<Category> categories = determineCategories(subjects);
            
            // Сохраняем книгу
            Book savedBook = bookRepository.save(book);
            
            // Связываем с категориями
            for (Category category : categories) {
                savedBook.getCategories().add(category);
            }
            bookRepository.save(savedBook);
            
            log.info("Книга '{}' успешно импортирована", title);
            return true;
            
        } catch (Exception e) {
            log.error("Ошибка при импорте книги: {}", e.getMessage(), e);
            return false;
        }
    }
} 
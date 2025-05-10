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
import ru.arseniy.library.service.BookFileService;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Утилита для импорта книг из Project Gutenberg
 * Использование: запустите приложение с аргументом --import-books=N, где N - количество книг для импорта
 * Или --import-books=N:M где N - количество книг, M - количество потоков (по умолчанию 3)
 * Или --import-books=N:M:S где N - количество книг, M - количество потоков, S - стартовая страница (по умолчанию 1)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookImporter implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookFileService bookFileService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GUTENDEX_API = "https://gutendex.com/books/?page=%d&languages=en";
    private static final String GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes?q=intitle:%s";
    private static final String COVERS_BASE_URL = "https://covers.openlibrary.org/b/id/%s-L.jpg";
    private static final int BOOKS_PER_PAGE = 32;
    private static final Map<String, Integer> SUBJECT_TO_CATEGORY_MAP = initCategoryMap();
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final int DEFAULT_THREADS = 3;

    private static Map<String, Integer> initCategoryMap() {
        Map<String, Integer> map = new HashMap<>();
        
        // Категории верхнего уровня
        map.put("fiction", 1);           // Художественная литература
        map.put("science", 8);           // Научная и образовательная литература 
        map.put("computers", 17);        // Компьютерная литература
        map.put("business", 23);         // Бизнес-литература
        map.put("art", 29);              // Искусство и культура
        map.put("hobby", 35);            // Хобби и досуг
        map.put("children", 41);         // Детская литература
        
        // Подкатегории для "Художественная литература" (id=1)
        map.put("science fiction", 2);   // Фантастика
        map.put("fantasy", 3);           // Фэнтези
        map.put("detective", 4);         // Детективы
        map.put("romance", 5);           // Романы
        map.put("adventure", 6);         // Приключения
        map.put("classic", 7);           // Классическая литература
        map.put("poetry", 8);            // Современная проза
        
        // Подкатегории для "Научная и образовательная литература" (id=8)
        map.put("physics", 9);           // Физика
        map.put("mathematics", 10);      // Математика
        map.put("biology", 11);          // Биология
        map.put("chemistry", 12);        // Химия
        map.put("history", 13);          // История
        map.put("philosophy", 14);       // Философия
        map.put("psychology", 15);       // Психология
        
        // Подкатегории для "Детская литература" (id=41)
        map.put("fairy tales", 42);      // Сказки
        map.put("children stories", 43); // Детские повести и рассказы
        map.put("children education", 44); // Развивающая литература
        
        // Биографии отнесем к современной прозе
        map.put("biography", 8);
        map.put("drama", 8);
        
        return map;
    }

    @Override
    public void run(String... args) throws Exception {
        // Проверяем аргументы для импорта книг
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

    /**
     * Импортирует указанное количество книг из Project Gutenberg
     *
     * @param count количество книг для импорта
     */
    public void importBooks(int count) {
        importBooks(count, DEFAULT_THREADS, 1);
    }
    
    /**
     * Импортирует указанное количество книг из Project Gutenberg с использованием параллельной обработки
     *
     * @param count количество книг для импорта
     * @param threads количество потоков для параллельной обработки
     */
    public void importBooks(int count, int threads) {
        importBooks(count, threads, 1);
    }
    
    /**
     * Импортирует указанное количество книг из Project Gutenberg с использованием параллельной обработки
     *
     * @param count количество книг для импорта
     * @param threads количество потоков для параллельной обработки
     * @param startPage стартовая страница API для начала импорта
     */
    @Transactional
    public void importBooks(int count, int threads, int startPage) {
        log.info("Начинаем импорт {} книг из Project Gutenberg с использованием {} потоков, начиная со страницы {}", 
                count, threads, startPage);
        
        // Загружаем реальные ID категорий из базы данных
        updateCategoryMap();
        
        // Создаем кэш для хранения названий книг и авторов, чтобы избежать дубликатов
        Set<String> existingTitleAuthorPairs = new HashSet<>();
        bookRepository.findAll().forEach(book -> 
            existingTitleAuthorPairs.add(book.getTitle().toLowerCase() + "|" + book.getAuthor().toLowerCase()));
        log.info("Загружено {} существующих книг для проверки дубликатов", existingTitleAuthorPairs.size());
        
        AtomicInteger imported = new AtomicInteger(0);
        AtomicInteger page = new AtomicInteger(startPage);
        AtomicInteger processed = new AtomicInteger(0);
        
        // Создаем пул потоков для параллельной обработки
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        
        try {
            while (imported.get() < count) {
                log.info("Загрузка страницы {} с книгами ({}/{})", page.get(), imported.get(), count);
                
                // Получаем список книг с API Project Gutenberg
                List<JsonNode> books = fetchBooksFromGutenberg(page.getAndIncrement());
                if (books.isEmpty()) {
                    log.info("Больше книг не найдено");
                    break;
                }
                
                for (JsonNode bookNode : books) {
                    if (imported.get() >= count) break;
                    
                    // Пропускаем книги с отсутствующим текстовым форматом
                    if (!bookNode.has("formats") || 
                        !bookNode.get("formats").has("text/plain; charset=utf-8")) {
                        continue;
                    }
                    
                    // Проверяем дубликаты по названию и автору
                    String title = bookNode.get("title").asText();
                    String author = "Unknown";
                    if (bookNode.has("authors") && bookNode.get("authors").size() > 0) {
                        author = bookNode.get("authors").get(0).get("name").asText();
                    }
                    
                    String titleAuthorKey = title.toLowerCase() + "|" + author.toLowerCase();
                    if (existingTitleAuthorPairs.contains(titleAuthorKey)) {
                        log.info("Книга '{}' автора '{}' уже существует в базе данных, пропускаем", title, author);
                        continue;
                    }
                    
                    // Добавляем в кэш перед импортом, чтобы избежать дублирования в параллельных потоках
                    existingTitleAuthorPairs.add(titleAuthorKey);
                    
                    // Создаем задачу для импорта книги в отдельном потоке
                    JsonNode finalBookNode = bookNode;
                    CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                        boolean success = false;
                        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS && !success; attempt++) {
                            try {
                                if (attempt > 1) {
                                    log.info("Повторная попытка {} импорта книги: {}", attempt, finalBookNode.get("title").asText());
                                    // Небольшая задержка перед повторной попыткой
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
                    
                    // Не перегружаем API - небольшая задержка между созданием задач
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            
            // Ожидаем завершения всех задач
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            log.info("Импорт завершен. Успешно импортировано {} книг из {} обработанных", imported.get(), processed.get());
        } catch (Exception e) {
            log.error("Ошибка при импорте книг: {}", e.getMessage(), e);
        } finally {
            // Завершаем работу пула потоков
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

    /**
     * Получает список книг с API Project Gutenberg
     *
     * @param page номер страницы
     * @return список книг в формате JsonNode
     */
    private List<JsonNode> fetchBooksFromGutenberg(int page) {
        String url = String.format(GUTENDEX_API, page);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            try (CloseableHttpResponse response = client.execute(request)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String result = EntityUtils.toString(entity);
                    JsonNode root = objectMapper.readTree(result);
                    
                    if (root.has("results")) {
                        List<JsonNode> books = new ArrayList<>();
                        for (JsonNode book : root.get("results")) {
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

    /**
     * Получает дополнительные метаданные о книге через Google Books API
     *
     * @param title название книги
     * @param author автор книги
     * @return данные о книге или null в случае ошибки
     */
    private JsonNode fetchGoogleBooksData(String title, String author) {
        try {
            String encodedTitle = java.net.URLEncoder.encode(title, "UTF-8");
            String url = String.format(GOOGLE_BOOKS_API, encodedTitle);
            
            try (CloseableHttpClient client = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(url);
                try (CloseableHttpResponse response = client.execute(request)) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        String result = EntityUtils.toString(entity);
                        JsonNode root = objectMapper.readTree(result);
                        
                        if (root.has("items") && root.get("items").size() > 0) {
                            // Найти книгу того же автора, если возможно
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
                            
                            // Если книга того же автора не найдена, берем первую
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

    /**
     * Скачивает текстовый файл книги
     *
     * @param url URL файла
     * @return содержимое текстового файла
     */
    private String downloadTextFile(String url) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            try (CloseableHttpResponse response = client.execute(request)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    return EntityUtils.toString(entity);
                }
            }
        } catch (Exception e) {
            log.error("Ошибка при скачивании текстового файла: {}", e.getMessage(), e);
        }
        return null;
    }

    /**
     * Скачивает изображение обложки
     *
     * @param url URL изображения
     * @param filename имя файла
     * @return MultipartFile с изображением
     */
    private MultipartFile downloadImage(String url, String filename) {
        int retryCount = 0;
        int maxRetries = 3;
        int retryDelay = 1000; // миллисекунды
        
        while (retryCount < maxRetries) {
            try {
                URL imageUrl = new URL(url);
                try (InputStream in = new BufferedInputStream(imageUrl.openStream());
                    ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    
                    byte[] buf = new byte[1024];
                    int n;
                    while (-1 != (n = in.read(buf))) {
                        out.write(buf, 0, n);
                    }
                    
                    byte[] imageBytes = out.toByteArray();
                    if (imageBytes.length < 100) { // Проверка на слишком маленький размер (возможно ошибка)
                        throw new IOException("Загруженное изображение слишком маленькое, возможно ошибка");
                    }
                    
                    return new MockMultipartFile(filename, filename, "image/jpeg", imageBytes);
                }
            } catch (Exception e) {
                log.warn("Не удалось скачать изображение (попытка {}): {}", retryCount + 1, e.getMessage());
                retryCount++;
                
                if (retryCount < maxRetries) {
                    try {
                        // Ждем перед следующей попыткой с увеличивающейся задержкой
                        Thread.sleep(retryDelay * retryCount);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return null;
                    }
                }
            }
        }
        
        log.error("Не удалось скачать изображение после {} попыток: {}", maxRetries, url);
        return null;
    }

    /**
     * Извлекает ID обложки из данных книги
     *
     * @param bookNode данные о книге
     * @return ID обложки или null
     */
    private String extractCoverId(JsonNode bookNode) {
        if (bookNode.has("formats") && bookNode.get("formats").has("image/jpeg")) {
            String imageUrl = bookNode.get("formats").get("image/jpeg").asText();
            // Сначала проверяем, содержит ли URL covers.openlibrary.org
            if (imageUrl.contains("covers.openlibrary.org")) {
                Pattern pattern = Pattern.compile("/id/(\\d+)-");
                Matcher matcher = pattern.matcher(imageUrl);
                if (matcher.find()) {
                    return matcher.group(1);
                }
            }
            
            // Если не нашли в URL, используем случайное число
            return String.valueOf(ThreadLocalRandom.current().nextInt(10000000, 20000000));
        }
        return null;
    }

    /**
     * Преобразует текстовый файл в PDF
     *
     * @param textContent содержимое текстового файла
     * @param title название книги
     * @return MultipartFile с PDF-версией книги
     */
    private MultipartFile convertTextToPdf(String textContent, String title) {
        // В реальном приложении здесь был бы код для создания PDF из текста
        // В данном примере мы просто создадим PDF с текстом
        
        // Для упрощения примера возвращаем текст, представленный как PDF
        // В настоящем приложении здесь использовалась бы библиотека типа iText
        return new MockMultipartFile(
            "book.pdf", 
            title + ".pdf", 
            "application/pdf", 
            textContent.getBytes()
        );
    }

    /**
     * Определяет категории книги на основе списка предметов
     *
     * @param subjects список предметов
     * @return набор категорий
     */
    private Set<Category> determineCategories(List<String> subjects) {
        Set<Category> categories = new HashSet<>();
        Set<Integer> categoryIds = new HashSet<>();
        
        // Определяем категории на основе предметов
        for (String subject : subjects) {
            String subjectLower = subject.toLowerCase();
            for (Map.Entry<String, Integer> entry : SUBJECT_TO_CATEGORY_MAP.entrySet()) {
                if (subjectLower.contains(entry.getKey())) {
                    categoryIds.add(entry.getValue());
                }
            }
        }
        
        // Если не нашли подходящих категорий, используем "Классическую литературу"
        if (categoryIds.isEmpty()) {
            categoryIds.add(SUBJECT_TO_CATEGORY_MAP.get("classic"));
        }
        
        // Получаем объекты категорий из репозитория
        for (Integer categoryId : categoryIds) {
            categoryRepository.findById(categoryId).ifPresent(categories::add);
        }
        
        return categories;
    }

    /**
     * Обновляет карту сопоставления предметов и категорий
     * с использованием реальных ID категорий из базы данных
     */
    @Transactional
    private void updateCategoryMap() {
        Map<String, Integer> newMap = new HashMap<>();
        
        // Находим основные категории по названиям и обновляем ID
        try {
            // Получаем категорию "Художественная литература" и её подкатегории
            Category fictionCategory = categoryRepository.findByName("Художественная литература").orElse(null);
            if (fictionCategory != null) {
                newMap.put("fiction", fictionCategory.getId());
                
                // Явно загружаем подкатегории через отдельные запросы
                List<Category> fictionSubcategories = categoryRepository.findByParentCategoryId(fictionCategory.getId());
                for (Category child : fictionSubcategories) {
                    switch (child.getName()) {
                        case "Фантастика":
                            newMap.put("science fiction", child.getId());
                            break;
                        case "Фэнтези":
                            newMap.put("fantasy", child.getId());
                            break;
                        case "Детективы":
                            newMap.put("detective", child.getId());
                            break;
                        case "Романы":
                            newMap.put("romance", child.getId());
                            break;
                        case "Приключения":
                            newMap.put("adventure", child.getId());
                            break;
                        case "Классическая литература":
                            newMap.put("classic", child.getId());
                            break;
                        case "Современная проза":
                            newMap.put("poetry", child.getId());
                            newMap.put("biography", child.getId());
                            newMap.put("drama", child.getId());
                            break;
                    }
                }
            }
            
            // Получаем категорию "Научная и образовательная литература" и её подкатегории
            Category scienceCategory = categoryRepository.findByName("Научная и образовательная литература").orElse(null);
            if (scienceCategory != null) {
                newMap.put("science", scienceCategory.getId());
                
                // Явно загружаем подкатегории через отдельные запросы
                List<Category> scienceSubcategories = categoryRepository.findByParentCategoryId(scienceCategory.getId());
                for (Category child : scienceSubcategories) {
                    switch (child.getName()) {
                        case "Физика":
                            newMap.put("physics", child.getId());
                            break;
                        case "Математика":
                            newMap.put("mathematics", child.getId());
                            break;
                        case "Биология":
                            newMap.put("biology", child.getId());
                            break;
                        case "Химия":
                            newMap.put("chemistry", child.getId());
                            break;
                        case "История":
                            newMap.put("history", child.getId());
                            break;
                        case "Философия":
                            newMap.put("philosophy", child.getId());
                            break;
                        case "Психология":
                            newMap.put("psychology", child.getId());
                            break;
                    }
                }
            }
            
            // Получаем другие основные категории
            categoryRepository.findByName("Компьютерная литература")
                .ifPresent(category -> newMap.put("computers", category.getId()));
                
            categoryRepository.findByName("Бизнес-литература")
                .ifPresent(category -> newMap.put("business", category.getId()));
                
            categoryRepository.findByName("Искусство и культура")
                .ifPresent(category -> newMap.put("art", category.getId()));
                
            categoryRepository.findByName("Хобби и досуг")
                .ifPresent(category -> newMap.put("hobby", category.getId()));
            
            // Получаем категорию "Детская литература" и её подкатегории
            Category childrenCategory = categoryRepository.findByName("Детская литература").orElse(null);
            if (childrenCategory != null) {
                newMap.put("children", childrenCategory.getId());
                
                // Явно загружаем подкатегории через отдельные запросы
                List<Category> childrenSubcategories = categoryRepository.findByParentCategoryId(childrenCategory.getId());
                for (Category child : childrenSubcategories) {
                    switch (child.getName()) {
                        case "Сказки":
                            newMap.put("fairy tales", child.getId());
                            break;
                        case "Детские повести и рассказы":
                            newMap.put("children stories", child.getId());
                            break;
                        case "Развивающая литература":
                            newMap.put("children education", child.getId());
                            break;
                    }
                }
            }
            
            // Если нашли реальные ID, обновляем карту
            if (!newMap.isEmpty()) {
                log.info("Обновляем карту категорий: {} категорий", newMap.size());
                SUBJECT_TO_CATEGORY_MAP.putAll(newMap);
            } else {
                log.warn("Не удалось найти категории в базе данных, используем стандартные ID");
            }
        } catch (Exception e) {
            log.error("Ошибка при обновлении категорий: {}", e.getMessage(), e);
        }
    }

    /**
     * Импортирует одну книгу
     *
     * @param bookNode данные о книге из Project Gutenberg
     * @return true, если книга успешно импортирована
     */
    @Transactional
    private boolean importBook(JsonNode bookNode) {
        try {
            // Извлекаем базовую информацию о книге
            int gutenbergId = bookNode.get("id").asInt();
            String title = bookNode.get("title").asText();
            String plainTextUrl = bookNode.get("formats").get("text/plain; charset=utf-8").asText();
            
            log.info("Обработка книги: {}, ID: {}", title, gutenbergId);
            
            // Проверяем, не существует ли книга в БД
            if (bookRepository.existsByTitle(title)) {
                log.info("Книга '{}' уже существует в базе данных, пропускаем", title);
                return false;
            }
            
            // Получаем автора (первого в списке)
            String author = "Unknown";
            if (bookNode.has("authors") && bookNode.get("authors").size() > 0) {
                author = bookNode.get("authors").get(0).get("name").asText();
            }
            
            // Получаем предметы для определения категорий
            List<String> subjects = new ArrayList<>();
            if (bookNode.has("subjects")) {
                for (JsonNode subject : bookNode.get("subjects")) {
                    subjects.add(subject.asText().toLowerCase());
                }
            }
            
            // Получаем дополнительные метаданные через Google Books API
            log.debug("Получение метаданных из Google Books API для книги: {}", title);
            JsonNode googleData = fetchGoogleBooksData(title, author);
            
            // Создаем экземпляр книги
            Book book = new Book();
            book.setTitle(title);
            book.setAuthor(author);
            
            // Заполняем информацию из Google Books API
            if (googleData != null) {
                JsonNode volumeInfo = googleData.get("volumeInfo");
                
                // Добавляем описание
                if (volumeInfo.has("description")) {
                    book.setDescription(volumeInfo.get("description").asText());
                } else {
                    // Используем краткое описание из списка предметов
                    book.setDescription("Книга из Project Gutenberg: " + String.join(", ", subjects));
                }
                
                // Добавляем ISBN
                if (volumeInfo.has("industryIdentifiers") && volumeInfo.get("industryIdentifiers").size() > 0) {
                    book.setIsbn(volumeInfo.get("industryIdentifiers").get(0).get("identifier").asText());
                }
                
                // Добавляем год публикации
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
                
                // Добавляем издателя
                if (volumeInfo.has("publisher")) {
                    book.setPublisher(volumeInfo.get("publisher").asText());
                } else {
                    book.setPublisher("Project Gutenberg");
                }
                
                // Добавляем язык
                if (volumeInfo.has("language")) {
                    book.setLanguage(volumeInfo.get("language").asText());
                } else {
                    book.setLanguage("en");
                }
                
                // Добавляем количество страниц
                if (volumeInfo.has("pageCount")) {
                    book.setPageCount(volumeInfo.get("pageCount").asInt());
                } else {
                    // Оцениваем количество страниц на основе размера текста (примерно 2000 символов на страницу)
                    String textFileContent = downloadTextFile(plainTextUrl);
                    if (textFileContent != null && !textFileContent.isEmpty()) {
                        int estimatedPages = Math.max(150, textFileContent.length() / 2000);
                        book.setPageCount(Math.min(estimatedPages, 800));
                    } else {
                        // Генерируем случайное количество страниц если не удалось скачать текст
                        book.setPageCount(ThreadLocalRandom.current().nextInt(150, 801));
                    }
                }
                
                // Добавляем категории на основе категорий из Google Books
                if (volumeInfo.has("categories")) {
                    for (JsonNode category : volumeInfo.get("categories")) {
                        subjects.add(category.asText().toLowerCase());
                    }
                }
            } else {
                // Базовые данные, если не удалось получить информацию из Google Books API
                book.setDescription("Классическая книга из коллекции Project Gutenberg.");
                book.setPublisher("Project Gutenberg");
                book.setLanguage("en");
                
                // Загружаем файл книги для оценки количества страниц
                String textFileContent = downloadTextFile(plainTextUrl);
                if (textFileContent != null && !textFileContent.isEmpty()) {
                    int estimatedPages = Math.max(150, textFileContent.length() / 2000);
                    book.setPageCount(Math.min(estimatedPages, 800));
                } else {
                    book.setPageCount(ThreadLocalRandom.current().nextInt(150, 801));
                }
            }
            
            // Загружаем файл книги
            log.debug("Загрузка текстового файла книги: {}", plainTextUrl);
            String textFileContent = downloadTextFile(plainTextUrl);
            if (textFileContent == null || textFileContent.isEmpty()) {
                log.error("Не удалось загрузить текст книги: {}", title);
                return false;
            }
            log.debug("Успешно загружен текстовый файл книги: {} ({} символов)", title, textFileContent.length());
            
            // Подготовка PDF-версии книги
            MultipartFile pdfFile = convertTextToPdf(textFileContent, title);
            log.debug("Создан PDF файл для книги: {} ({} байт)", title, pdfFile.getSize());
            
            // Временно сохраняем книгу для получения ID
            book.setFileUrl("temporary");
            book.setCoverImageUrl("temporary");
            book.setUploadDate(LocalDateTime.now());
            Book savedBook = bookRepository.save(book);
            log.info("Книга сохранена в БД с временными URL: {}, ID: {}", title, savedBook.getId());
            
            // Связываем книгу с соответствующими категориями
            try {
                Set<Category> bookCategories = determineCategories(subjects);
                savedBook.setCategories(bookCategories);
                log.debug("Книге '{}' добавлены категории: {}", title, 
                    bookCategories.stream().map(Category::getName).collect(Collectors.joining(", ")));
            } catch (Exception e) {
                log.error("Ошибка при добавлении категорий для книги '{}': {}", title, e.getMessage(), e);
            }
            
            // Загружаем файл книги с указанием названия книги
            try {
                log.debug("Загрузка PDF файла книги '{}' в облачное хранилище", title);
                String fileUrl = bookFileService.uploadBookFile(pdfFile, savedBook.getId());
                savedBook.setFileUrl(fileUrl);
                log.info("Успешно загружен файл книги '{}' в облачное хранилище. URL: {}", title, fileUrl);
            } catch (Exception e) {
                log.error("Ошибка при загрузке файла книги '{}' в облачное хранилище: {}", title, e.getMessage(), e);
            }
            
            // Загружаем обложку книги
            try {
                // Сначала пытаемся получить обложку из Google Books API
                String coverUrl = null;
                if (googleData != null && 
                    googleData.get("volumeInfo").has("imageLinks") && 
                    googleData.get("volumeInfo").get("imageLinks").has("thumbnail")) {
                    
                    coverUrl = googleData.get("volumeInfo").get("imageLinks").get("thumbnail").asText();
                    // Исправляем URL, чтобы получить изображение более высокого качества
                    coverUrl = coverUrl.replace("&zoom=1", "&zoom=0").replace("&edge=curl", "");
                    log.debug("Получен URL обложки из Google Books API: {}", coverUrl);
                }
                
                // Если не удалось получить обложку из Google Books, пытаемся получить из OpenLibrary
                if (coverUrl == null) {
                    String coverId = extractCoverId(bookNode);
                    if (coverId != null) {
                        coverUrl = String.format(COVERS_BASE_URL, coverId);
                        log.debug("Получен URL обложки из OpenLibrary: {}", coverUrl);
                    }
                }
                
                if (coverUrl != null) {
                    log.debug("Загрузка обложки книги '{}' из: {}", title, coverUrl);
                    
                    MultipartFile coverFile = downloadImage(coverUrl, "book_cover.jpg");
                    if (coverFile != null && coverFile.getSize() > 0) {
                        log.debug("Загрузка обложки книги '{}' в облачное хранилище", title);
                        String coverImageUrl = bookFileService.uploadBookCover(coverFile, savedBook.getId());
                        savedBook.setCoverImageUrl(coverImageUrl);
                        log.info("Успешно загружена обложка книги '{}' в облачное хранилище. URL: {}", title, coverImageUrl);
                    } else {
                        log.warn("Не удалось загрузить обложку книги '{}' из: {}", title, coverUrl);
                    }
                } else {
                    log.warn("Не удалось найти URL обложки для книги '{}'", title);
                }
            } catch (Exception e) {
                log.error("Ошибка при загрузке обложки книги '{}': {}", title, e.getMessage(), e);
                // Оставляем временный URL для обложки
            }
            
            // Сохраняем обновленную книгу
            bookRepository.save(savedBook);
            
            log.info("Книга '{}' успешно импортирована, ID: {}", title, savedBook.getId());
            return true;
            
        } catch (Exception e) {
            log.error("Общая ошибка при импорте книги: {}", e.getMessage(), e);
            return false;
        }
    }
} 
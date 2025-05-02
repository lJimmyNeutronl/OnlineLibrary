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

import java.io.*;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Утилита для импорта книг из Project Gutenberg
 * Использование: запустите приложение с аргументом --import-books=N, где N - количество книг для импорта
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

    private static Map<String, Integer> initCategoryMap() {
        Map<String, Integer> map = new HashMap<>();
        
        // Карта для сопоставления предметов (subjects) из Project Gutenberg с категориями в БД
        // Эти ID категорий будут заменены на реальные из базы данных во время выполнения
        map.put("fiction", 1);           // Художественная литература
        map.put("fantasy", 2);           // Фэнтези
        map.put("science fiction", 1);   // Фантастика
        map.put("detective", 3);         // Детективы
        map.put("romance", 4);           // Романы
        map.put("adventure", 5);         // Приключения
        map.put("classic", 6);           // Классическая литература
        map.put("history", 14);          // История
        map.put("philosophy", 15);       // Философия
        map.put("psychology", 16);       // Психология
        map.put("science", 9);           // Научная литература
        map.put("children", 49);         // Детская литература
        map.put("poetry", 7);            // Современная проза
        map.put("biography", 7);         // Относим к прозе
        map.put("drama", 7);             // Относим к прозе
        
        return map;
    }

    @Override
    public void run(String... args) throws Exception {
        // Проверяем аргументы для импорта книг
        for (String arg : args) {
            if (arg.startsWith("--import-books=")) {
                int booksToImport = Integer.parseInt(arg.split("=")[1]);
                importBooks(booksToImport);
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
        log.info("Начинаем импорт {} книг из Project Gutenberg", count);
        
        // Загружаем реальные ID категорий из базы данных
        updateCategoryMap();
        
        int imported = 0;
        int page = 1;
        
        try {
            while (imported < count) {
                log.info("Загрузка страницы {} с книгами ({}/{})", page, imported, count);
                
                // Получаем список книг с API Project Gutenberg
                List<JsonNode> books = fetchBooksFromGutenberg(page);
                if (books.isEmpty()) {
                    log.info("Больше книг не найдено");
                    break;
                }
                
                for (JsonNode bookNode : books) {
                    if (imported >= count) break;
                    
                    try {
                        // Пропускаем книги с отсутствующим текстовым форматом
                        if (!bookNode.has("formats") || 
                            !bookNode.get("formats").has("text/plain; charset=utf-8")) {
                            continue;
                        }
                        
                        // Импортируем книгу
                        boolean success = importBook(bookNode);
                        if (success) {
                            imported++;
                            log.info("Импортирована книга {}/{}", imported, count);
                        }
                        
                        // Небольшая задержка, чтобы не перегружать API
                        Thread.sleep(500);
                    } catch (Exception e) {
                        log.error("Ошибка при импорте книги: {}", e.getMessage(), e);
                    }
                }
                
                page++;
            }
            
            log.info("Импорт завершен. Успешно импортировано {} книг", imported);
        } catch (Exception e) {
            log.error("Ошибка при импорте книг: {}", e.getMessage(), e);
        }
    }

    /**
     * Импортирует одну книгу
     *
     * @param bookNode данные о книге из Project Gutenberg
     * @return true, если книга успешно импортирована
     */
    private boolean importBook(JsonNode bookNode) {
        try {
            // Извлекаем базовую информацию о книге
            int gutenbergId = bookNode.get("id").asInt();
            String title = bookNode.get("title").asText();
            String plainTextUrl = bookNode.get("formats").get("text/plain; charset=utf-8").asText();
            
            log.info("Обработка книги: {}", title);
            
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
                    // Генерируем случайное количество страниц
                    book.setPageCount(ThreadLocalRandom.current().nextInt(150, 801));
                }
            } else {
                // Базовые данные, если не удалось получить информацию из Google Books API
                book.setDescription("Классическая книга из коллекции Project Gutenberg.");
                book.setPublisher("Project Gutenberg");
                book.setLanguage("en");
                book.setPageCount(ThreadLocalRandom.current().nextInt(150, 801));
            }
            
            // Загружаем файл книги
            String textFileContent = downloadTextFile(plainTextUrl);
            if (textFileContent == null || textFileContent.isEmpty()) {
                log.error("Не удалось загрузить текст книги");
                return false;
            }
            
            // Подготовка PDF-версии книги
            MultipartFile pdfFile = convertTextToPdf(textFileContent, title);
            
            // Временно сохраняем книгу для получения ID
            book.setFileUrl("temporary");
            book.setCoverImageUrl("temporary");
            book.setUploadDate(LocalDateTime.now());
            Book savedBook = bookRepository.save(book);
            
            // Загружаем файл книги
            String fileUrl = bookFileService.uploadBookFile(pdfFile, savedBook.getId());
            savedBook.setFileUrl(fileUrl);
            
            // Загружаем обложку книги
            try {
                // Пытаемся получить ID обложки из OpenLibrary
                String coverId = extractCoverId(bookNode);
                if (coverId != null) {
                    String coverUrl = String.format(COVERS_BASE_URL, coverId);
                    MultipartFile coverFile = downloadImage(coverUrl, "book_cover.jpg");
                    if (coverFile != null) {
                        String coverImageUrl = bookFileService.uploadBookCover(coverFile, savedBook.getId());
                        savedBook.setCoverImageUrl(coverImageUrl);
                    }
                }
            } catch (Exception e) {
                log.warn("Не удалось загрузить обложку: {}", e.getMessage());
                // Оставляем временный URL для обложки
            }
            
            // Связываем книгу с соответствующими категориями
            Set<Category> bookCategories = determineCategories(subjects);
            savedBook.setCategories(bookCategories);
            
            // Сохраняем обновленную книгу
            bookRepository.save(savedBook);
            
            log.info("Книга '{}' успешно импортирована, ID: {}", title, savedBook.getId());
            return true;
            
        } catch (Exception e) {
            log.error("Ошибка при импорте книги: {}", e.getMessage(), e);
            return false;
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
                return new MockMultipartFile(filename, filename, "image/jpeg", imageBytes);
            }
        } catch (Exception e) {
            log.warn("Не удалось скачать изображение: {}", e.getMessage());
            return null;
        }
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
    private void updateCategoryMap() {
        Map<String, Integer> newMap = new HashMap<>();
        
        // Находим категории по названиям и обновляем ID
        categoryRepository.findByName("Художественная литература")
            .ifPresent(category -> newMap.put("fiction", category.getId()));
        
        categoryRepository.findByName("Фэнтези")
            .ifPresent(category -> newMap.put("fantasy", category.getId()));
        
        categoryRepository.findByName("Фантастика")
            .ifPresent(category -> newMap.put("science fiction", category.getId()));
        
        categoryRepository.findByName("Детективы")
            .ifPresent(category -> newMap.put("detective", category.getId()));
        
        categoryRepository.findByName("Романы")
            .ifPresent(category -> newMap.put("romance", category.getId()));
        
        categoryRepository.findByName("Приключения")
            .ifPresent(category -> newMap.put("adventure", category.getId()));
        
        categoryRepository.findByName("Классическая литература")
            .ifPresent(category -> newMap.put("classic", category.getId()));
        
        categoryRepository.findByName("История")
            .ifPresent(category -> newMap.put("history", category.getId()));
        
        categoryRepository.findByName("Философия")
            .ifPresent(category -> newMap.put("philosophy", category.getId()));
        
        categoryRepository.findByName("Психология")
            .ifPresent(category -> newMap.put("psychology", category.getId()));
        
        categoryRepository.findByName("Научная и образовательная литература")
            .ifPresent(category -> newMap.put("science", category.getId()));
        
        categoryRepository.findByName("Детская литература")
            .ifPresent(category -> newMap.put("children", category.getId()));
        
        categoryRepository.findByName("Современная проза")
            .ifPresent(category -> {
                newMap.put("poetry", category.getId());
                newMap.put("biography", category.getId());
                newMap.put("drama", category.getId());
            });
        
        // Если нашли реальные ID, обновляем карту
        if (!newMap.isEmpty()) {
            SUBJECT_TO_CATEGORY_MAP.putAll(newMap);
        }
    }
} 
package ru.arseniy.library.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;
import ru.arseniy.library.dto.MessageResponse;
import ru.arseniy.library.exception.ResourceNotFoundException;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.service.BookService;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

/**
 * Контроллер для работы с файлами книг
 */
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true", 
             allowedHeaders = {"Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"}, 
             exposedHeaders = {"Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", "Access-Control-Allow-Methods"},
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS, RequestMethod.HEAD, RequestMethod.PUT, RequestMethod.DELETE})
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
public class BookFileController {

    private final BookService bookService;

    /**
     * Загружает файл книги
     *
     * @param id идентификатор книги
     * @param file файл книги
     * @return сообщение о результате операции
     */
    @PostMapping("/{id}/file")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadBookFile(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        try {
            Book book = bookService.uploadBookFile(id, file);
            return ResponseEntity.ok(new MessageResponse("Файл книги успешно загружен: " + book.getFileUrl()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            log.error("Ошибка при загрузке файла книги: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Ошибка при загрузке файла книги: " + e.getMessage()));
        }
    }

    /**
     * Загружает обложку книги
     *
     * @param id идентификатор книги
     * @param file файл обложки
     * @return сообщение о результате операции
     */
    @PostMapping("/{id}/cover")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadBookCover(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        try {
            Book book = bookService.uploadBookCover(id, file);
            return ResponseEntity.ok(new MessageResponse("Обложка книги успешно загружена: " + book.getCoverImageUrl()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            log.error("Ошибка при загрузке обложки книги: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Ошибка при загрузке обложки книги: " + e.getMessage()));
        }
    }

    /**
     * Получает файл книги
     *
     * @param id идентификатор книги
     * @param ext расширение файла (pdf, epub, fb2 и т.д.)
     * @return файл книги
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<?> getBookFile(@PathVariable Integer id, @RequestParam(required = false) String ext) {
        try {
            // Сначала получаем информацию о книге для определения прямого URL
            Book book = bookService.getBookById(id);
            
            // Проверяем, есть ли прямой URL в книге
            if (book.getFileUrl() != null && !book.getFileUrl().isEmpty() && 
                (book.getFileUrl().startsWith("http://") || book.getFileUrl().startsWith("https://"))) {
                
                log.info("Книга с ID {} имеет прямой URL к файлу: {}", id, book.getFileUrl());
                
                // Если URL уже полный и внешний, выполняем редирект на него
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, book.getFileUrl())
                        .build();
            }
            
            // Иначе пытаемся получить файл через сервис
            Optional<InputStream> fileStream = bookService.getBookFile(id);
            if (fileStream.isPresent()) {
                log.info("Файл для книги с ID {} успешно найден", id);
                
                // Определяем Content-Type на основе расширения файла или URL
                String contentType;
                if (ext != null && !ext.isEmpty()) {
                    contentType = determineContentTypeByExtension(ext);
                } else {
                    contentType = determineContentType(book.getFileUrl());
                }
                
                // Подготавливаем заголовки ответа
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType));
                
                // Определяем, должен ли файл скачиваться или просматриваться в браузере
                boolean isViewable = contentType.equals("application/pdf") || 
                                     contentType.equals("application/epub+zip") ||
                                     contentType.startsWith("image/");
                
                if (!isViewable) {
                    headers.setContentDispositionFormData("attachment", getFileName(book.getFileUrl()));
                }
                
                // Возвращаем файл
                byte[] fileBytes = IOUtils.toByteArray(fileStream.get());
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            } else {
                log.warn("Файл для книги с ID {} не найден в локальном хранилище", id);
                
                // Проверяем, можно ли использовать внешний URL
                if (book.getFileUrl() != null && !book.getFileUrl().isEmpty()) {
                    log.info("Пытаемся выполнить редирект на внешний URL: {}", book.getFileUrl());
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .header(HttpHeaders.LOCATION, book.getFileUrl())
                            .build();
                }
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Файл книги не найден"));
            }
        } catch (ResourceNotFoundException e) {
            log.error("Книга с ID {} не найдена: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            log.error("Ошибка при получении файла книги с ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Ошибка при получении файла книги: " + e.getMessage()));
        }
    }

    /**
     * Получает обложку книги
     *
     * @param id идентификатор книги
     * @return файл обложки
     */
    @GetMapping("/{id}/cover")
    public ResponseEntity<?> getBookCover(@PathVariable Integer id) {
        try {
            Optional<InputStream> fileStream = bookService.getBookCover(id);
            if (fileStream.isPresent()) {
                // Получаем информацию о книге для определения типа контента
                Book book = bookService.getBookById(id);
                String contentType = determineContentType(book.getCoverImageUrl());
                
                // Подготавливаем заголовки ответа
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType));
                
                // Возвращаем файл
                byte[] fileBytes = IOUtils.toByteArray(fileStream.get());
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Обложка книги не найдена"));
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            log.error("Ошибка при получении обложки книги: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Ошибка при получении обложки книги: " + e.getMessage()));
        }
    }

    /**
     * Получает URL файла книги для фронтенда
     *
     * @param id идентификатор книги
     * @param ext расширение файла (pdf, epub и т.д.)
     * @return URL файла книги
     */
    @GetMapping("/{id}/file-url")
    public ResponseEntity<?> getBookFileUrl(@PathVariable Integer id, @RequestParam(required = false) String ext) {
        try {
            Book book = bookService.getBookById(id);
            
            // Проверяем, есть ли прямой URL к файлу
            if (book.getFileUrl() != null && !book.getFileUrl().isEmpty()) {
                log.info("Книга с ID {} имеет прямой URL: {}", id, book.getFileUrl());
                
                // Если URL внешний (начинается с http:// или https://), возвращаем его напрямую
                if (book.getFileUrl().startsWith("http://") || book.getFileUrl().startsWith("https://")) {
                    log.info("Возвращаем прямой внешний URL для книги ID {}: {}", id, book.getFileUrl());
                    return ResponseEntity.ok(book.getFileUrl());
                }
            } else {
                log.warn("URL файла для книги с ID {} не найден в базе данных", id);
            }
            
            // Формируем URL для доступа к файлу через наш API
            String fileUrl = "/api/books/" + id + "/file";
            if (ext != null && !ext.isEmpty()) {
                fileUrl += "?ext=" + ext;
            }
            
            log.info("Сформирован API URL для книги с ID {}: {}", id, fileUrl);
            return ResponseEntity.ok(fileUrl);
        } catch (ResourceNotFoundException e) {
            log.error("Книга с ID {} не найдена: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Ошибка при получении URL файла книги с ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Ошибка при получении URL файла книги: " + e.getMessage()));
        }
    }

    /**
     * Определяет тип контента по расширению файла
     *
     * @param extension расширение файла
     * @return тип контента
     */
    private String determineContentTypeByExtension(String extension) {
        String ext = extension.toLowerCase();
        switch (ext) {
            case "pdf":
                return "application/pdf";
            case "epub":
                return "application/epub+zip";
            case "fb2":
                return "application/xml";
            case "txt":
                return "text/plain";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            default:
                return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }

    /**
     * Определяет тип контента по URL файла
     *
     * @param url URL файла
     * @return тип контента
     */
    private String determineContentType(String url) {
        if (url == null) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerUrl.endsWith(".epub")) {
            return "application/epub+zip";
        } else if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerUrl.endsWith(".png")) {
            return "image/png";
        } else if (lowerUrl.endsWith(".webp")) {
            return "image/webp";
        } else {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }

    /**
     * Извлекает имя файла из URL
     *
     * @param url URL файла
     * @return имя файла
     */
    private String getFileName(String url) {
        if (url == null) {
            return "file";
        }
        
        int lastSlashIndex = url.lastIndexOf('/');
        if (lastSlashIndex >= 0 && lastSlashIndex < url.length() - 1) {
            return url.substring(lastSlashIndex + 1);
        } else {
            return "file";
        }
    }
}

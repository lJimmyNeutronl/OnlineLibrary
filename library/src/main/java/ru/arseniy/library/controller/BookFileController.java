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
     * @return файл книги
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<?> getBookFile(@PathVariable Integer id) {
        try {
            Optional<InputStream> fileStream = bookService.getBookFile(id);
            if (fileStream.isPresent()) {
                // Получаем информацию о книге для определения типа контента
                Book book = bookService.getBookById(id);
                String contentType = determineContentType(book.getFileUrl());
                
                // Подготавливаем заголовки ответа
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType));
                headers.setContentDispositionFormData("attachment", getFileName(book.getFileUrl()));
                
                // Возвращаем файл
                byte[] fileBytes = IOUtils.toByteArray(fileStream.get());
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Файл книги не найден"));
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            log.error("Ошибка при получении файла книги: {}", e.getMessage(), e);
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

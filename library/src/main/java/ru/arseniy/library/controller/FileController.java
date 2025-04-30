package ru.arseniy.library.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.arseniy.library.service.FileStorageService;

import java.io.InputStream;
import java.util.Optional;

/**
 * Контроллер для доступа к локально сохраненным файлам
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * Получает файл по ключу
     *
     * @param key ключ файла
     * @return файл, если найден
     */
    @GetMapping("/{key:.+}")
    public ResponseEntity<?> getFile(@PathVariable String key) {
        log.info("Запрос на получение файла с ключом: {}", key);
        
        try {
            Optional<InputStream> fileStream = fileStorageService.getFile(key);
            
            if (fileStream.isEmpty()) {
                log.warn("Файл не найден: {}", key);
                return ResponseEntity.notFound().build();
            }
            
            // Определяем тип контента
            String contentType = determineContentType(key);
            
            // Подготавливаем заголовки ответа
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            
            // Считываем файл в ресурс
            InputStreamResource resource = new InputStreamResource(fileStream.get());
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
            
        } catch (Exception e) {
            log.error("Ошибка при получении файла: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при получении файла: " + e.getMessage());
        }
    }
    
    /**
     * Определяет тип контента по расширению файла
     *
     * @param filename имя файла
     * @return тип контента
     */
    private String determineContentType(String filename) {
        String lowerFilename = filename.toLowerCase();
        
        if (lowerFilename.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerFilename.endsWith(".epub")) {
            return "application/epub+zip";
        } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFilename.endsWith(".png")) {
            return "image/png";
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        } else {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }
} 
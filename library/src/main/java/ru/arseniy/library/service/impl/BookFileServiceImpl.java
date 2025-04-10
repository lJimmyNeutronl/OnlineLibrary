package ru.arseniy.library.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.arseniy.library.service.BookFileService;
import ru.arseniy.library.service.FileStorageService;
import ru.arseniy.library.util.FileConstants;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Optional;

/**
 * Реализация сервиса для работы с файлами книг
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookFileServiceImpl implements BookFileService {

    private final FileStorageService fileStorageService;

    @Override
    public String uploadBookFile(MultipartFile file, Integer bookId) throws IOException, IllegalArgumentException {
        // Проверяем тип файла
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedBookContentType(contentType)) {
            throw new IllegalArgumentException("Неподдерживаемый тип файла. Разрешены только: " + 
                    String.join(", ", FileConstants.ALLOWED_BOOK_CONTENT_TYPES));
        }

        // Проверяем размер файла
        if (file.getSize() > FileConstants.MAX_BOOK_FILE_SIZE) {
            throw new IllegalArgumentException("Размер файла превышает максимально допустимый (" + 
                    FileConstants.MAX_BOOK_FILE_SIZE / (1024 * 1024) + " МБ)");
        }

        // Генерируем ключ для файла
        String key = generateBookFileKey(bookId, contentType);

        // Загружаем файл
        return fileStorageService.uploadFile(file, key);
    }

    @Override
    public String uploadBookCover(MultipartFile file, Integer bookId) throws IOException, IllegalArgumentException {
        // Проверяем тип файла
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedCoverContentType(contentType)) {
            throw new IllegalArgumentException("Неподдерживаемый тип файла. Разрешены только: " + 
                    String.join(", ", FileConstants.ALLOWED_COVER_CONTENT_TYPES));
        }

        // Проверяем размер файла
        if (file.getSize() > FileConstants.MAX_COVER_FILE_SIZE) {
            throw new IllegalArgumentException("Размер файла превышает максимально допустимый (" + 
                    FileConstants.MAX_COVER_FILE_SIZE / (1024 * 1024) + " МБ)");
        }

        // Генерируем ключ для файла
        String key = generateBookCoverKey(bookId, contentType);

        // Загружаем файл
        return fileStorageService.uploadFile(file, key);
    }

    @Override
    public Optional<InputStream> getBookFile(Integer bookId) {
        // Пытаемся найти файл с разными расширениями
        for (String contentType : FileConstants.ALLOWED_BOOK_CONTENT_TYPES) {
            String key = generateBookFileKey(bookId, contentType);
            Optional<InputStream> file = fileStorageService.getFile(key);
            if (file.isPresent()) {
                return file;
            }
        }
        return Optional.empty();
    }

    @Override
    public Optional<InputStream> getBookCover(Integer bookId) {
        // Пытаемся найти файл с разными расширениями
        for (String contentType : FileConstants.ALLOWED_COVER_CONTENT_TYPES) {
            String key = generateBookCoverKey(bookId, contentType);
            Optional<InputStream> file = fileStorageService.getFile(key);
            if (file.isPresent()) {
                return file;
            }
        }
        return Optional.empty();
    }

    @Override
    public boolean deleteBookFile(Integer bookId) {
        boolean deleted = false;
        // Пытаемся удалить файл с разными расширениями
        for (String contentType : FileConstants.ALLOWED_BOOK_CONTENT_TYPES) {
            String key = generateBookFileKey(bookId, contentType);
            if (fileStorageService.deleteFile(key)) {
                deleted = true;
            }
        }
        return deleted;
    }

    @Override
    public boolean deleteBookCover(Integer bookId) {
        boolean deleted = false;
        // Пытаемся удалить файл с разными расширениями
        for (String contentType : FileConstants.ALLOWED_COVER_CONTENT_TYPES) {
            String key = generateBookCoverKey(bookId, contentType);
            if (fileStorageService.deleteFile(key)) {
                deleted = true;
            }
        }
        return deleted;
    }

    /**
     * Проверяет, является ли тип файла допустимым для книги
     *
     * @param contentType тип файла
     * @return true, если тип файла допустим
     */
    private boolean isAllowedBookContentType(String contentType) {
        return Arrays.asList(FileConstants.ALLOWED_BOOK_CONTENT_TYPES).contains(contentType);
    }

    /**
     * Проверяет, является ли тип файла допустимым для обложки
     *
     * @param contentType тип файла
     * @return true, если тип файла допустим
     */
    private boolean isAllowedCoverContentType(String contentType) {
        return Arrays.asList(FileConstants.ALLOWED_COVER_CONTENT_TYPES).contains(contentType);
    }

    /**
     * Генерирует ключ для файла книги
     *
     * @param bookId идентификатор книги
     * @param contentType тип файла
     * @return ключ для файла
     */
    private String generateBookFileKey(Integer bookId, String contentType) {
        String extension = getExtensionFromContentType(contentType);
        return FileConstants.BOOKS_PREFIX + bookId + "." + extension;
    }

    /**
     * Генерирует ключ для обложки книги
     *
     * @param bookId идентификатор книги
     * @param contentType тип файла
     * @return ключ для файла
     */
    private String generateBookCoverKey(Integer bookId, String contentType) {
        String extension = getExtensionFromContentType(contentType);
        return FileConstants.COVERS_PREFIX + bookId + "." + extension;
    }

    /**
     * Получает расширение файла из типа содержимого
     *
     * @param contentType тип содержимого
     * @return расширение файла
     */
    private String getExtensionFromContentType(String contentType) {
        switch (contentType) {
            case "application/pdf":
                return "pdf";
            case "application/epub+zip":
                return "epub";
            case "image/jpeg":
                return "jpg";
            case "image/png":
                return "png";
            case "image/webp":
                return "webp";
            default:
                return "bin";
        }
    }
}

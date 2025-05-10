package ru.arseniy.library.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

/**
 * Интерфейс для сервиса хранения файлов
 */
public interface FileStorageService {

    /**
     * Загружает файл в хранилище
     *
     * @param file файл для загрузки
     * @param key ключ (путь) для сохранения файла
     * @return URL загруженного файла
     * @throws IOException если произошла ошибка при загрузке
     */
    String uploadFile(MultipartFile file, String key) throws IOException;
    
    /**
     * Загружает файл в хранилище с указанием названия книги
     *
     * @param file файл для загрузки
     * @param key ключ (путь) для сохранения файла
     * @param bookTitle название книги для создания папки
     * @return URL загруженного файла
     * @throws IOException если произошла ошибка при загрузке
     */
    String uploadFile(MultipartFile file, String key, String bookTitle) throws IOException;

    /**
     * Загружает данные в хранилище
     *
     * @param inputStream поток данных
     * @param key ключ (путь) для сохранения файла
     * @param contentType тип содержимого (MIME-тип)
     * @param contentLength размер содержимого в байтах
     * @return URL загруженного файла
     * @throws IOException если произошла ошибка при загрузке
     */
    String uploadFile(InputStream inputStream, String key, String contentType, long contentLength) throws IOException;
    
    /**
     * Загружает данные в хранилище с указанием названия книги
     *
     * @param inputStream поток данных
     * @param key ключ (путь) для сохранения файла
     * @param contentType тип содержимого (MIME-тип)
     * @param contentLength размер содержимого в байтах
     * @param bookTitle название книги для создания папки
     * @return URL загруженного файла
     * @throws IOException если произошла ошибка при загрузке
     */
    String uploadFile(InputStream inputStream, String key, String contentType, long contentLength, String bookTitle) throws IOException;

    /**
     * Получает файл из хранилища
     *
     * @param key ключ (путь) файла
     * @return поток данных файла, если файл найден
     */
    Optional<InputStream> getFile(String key);

    /**
     * Удаляет файл из хранилища
     *
     * @param key ключ (путь) файла
     * @return true, если файл успешно удален
     */
    boolean deleteFile(String key);

    /**
     * Генерирует URL для доступа к файлу
     *
     * @param key ключ (путь) файла
     * @return URL для доступа к файлу
     */
    String getFileUrl(String key);
}

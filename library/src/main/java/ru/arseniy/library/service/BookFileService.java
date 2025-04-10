package ru.arseniy.library.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

/**
 * Интерфейс для сервиса работы с файлами книг
 */
public interface BookFileService {

    /**
     * Загружает файл книги в хранилище
     *
     * @param file файл книги
     * @param bookId идентификатор книги
     * @return URL загруженного файла
     * @throws IOException если произошла ошибка при загрузке
     * @throws IllegalArgumentException если тип файла не поддерживается
     */
    String uploadBookFile(MultipartFile file, Integer bookId) throws IOException, IllegalArgumentException;

    /**
     * Загружает обложку книги в хранилище
     *
     * @param file файл обложки
     * @param bookId идентификатор книги
     * @return URL загруженной обложки
     * @throws IOException если произошла ошибка при загрузке
     * @throws IllegalArgumentException если тип файла не поддерживается
     */
    String uploadBookCover(MultipartFile file, Integer bookId) throws IOException, IllegalArgumentException;

    /**
     * Получает файл книги из хранилища
     *
     * @param bookId идентификатор книги
     * @return поток данных файла книги, если файл найден
     */
    Optional<InputStream> getBookFile(Integer bookId);

    /**
     * Получает обложку книги из хранилища
     *
     * @param bookId идентификатор книги
     * @return поток данных обложки книги, если файл найден
     */
    Optional<InputStream> getBookCover(Integer bookId);

    /**
     * Удаляет файл книги из хранилища
     *
     * @param bookId идентификатор книги
     * @return true, если файл успешно удален
     */
    boolean deleteBookFile(Integer bookId);

    /**
     * Удаляет обложку книги из хранилища
     *
     * @param bookId идентификатор книги
     * @return true, если файл успешно удален
     */
    boolean deleteBookCover(Integer bookId);
}

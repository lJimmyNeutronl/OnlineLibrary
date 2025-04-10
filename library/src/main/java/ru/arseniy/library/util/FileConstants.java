package ru.arseniy.library.util;

/**
 * Константы для работы с файлами
 */
public class FileConstants {
    
    /**
     * Префикс для хранения файлов книг
     */
    public static final String BOOKS_PREFIX = "book_";
    
    /**
     * Префикс для хранения обложек книг
     */
    public static final String COVERS_PREFIX = "cover_";
    
    /**
     * Допустимые типы файлов для книг
     */
    public static final String[] ALLOWED_BOOK_CONTENT_TYPES = {
            "application/pdf",
            "application/epub+zip"
    };
    
    /**
     * Допустимые типы файлов для обложек
     */
    public static final String[] ALLOWED_COVER_CONTENT_TYPES = {
            "image/jpeg",
            "image/png",
            "image/webp"
    };
    
    /**
     * Максимальный размер файла книги (50 МБ)
     */
    public static final long MAX_BOOK_FILE_SIZE = 50 * 1024 * 1024;
    
    /**
     * Максимальный размер файла обложки (5 МБ)
     */
    public static final long MAX_COVER_FILE_SIZE = 5 * 1024 * 1024;
}

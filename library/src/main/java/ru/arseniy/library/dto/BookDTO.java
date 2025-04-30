package ru.arseniy.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.arseniy.library.model.Book;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * DTO для модели Book, исключающее циклические ссылки
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
    private Integer id;
    private String title;
    private String author;
    private String description;
    private String isbn;
    private Integer publicationYear;
    private String publisher;
    private String language;
    private Integer pageCount;
    private String fileUrl;
    private String coverImageUrl;
    private LocalDateTime uploadDate;
    private Set<CategoryDTO> categories = new HashSet<>();
    
    /**
     * Конвертирует модель Book в BookDTO
     *
     * @param book модель книги
     * @return DTO книги
     */
    public static BookDTO fromEntity(Book book) {
        if (book == null) {
            return null;
        }
        
        BookDTO bookDTO = new BookDTO();
        bookDTO.setId(book.getId());
        bookDTO.setTitle(book.getTitle());
        bookDTO.setAuthor(book.getAuthor());
        bookDTO.setDescription(book.getDescription());
        bookDTO.setIsbn(book.getIsbn());
        bookDTO.setPublicationYear(book.getPublicationYear());
        bookDTO.setPublisher(book.getPublisher());
        bookDTO.setLanguage(book.getLanguage());
        bookDTO.setPageCount(book.getPageCount());
        bookDTO.setFileUrl(book.getFileUrl());
        bookDTO.setCoverImageUrl(book.getCoverImageUrl());
        bookDTO.setUploadDate(book.getUploadDate());
        
        // Преобразуем категории, избегая циклических ссылок
        if (book.getCategories() != null) {
            bookDTO.setCategories(book.getCategories().stream()
                    .map(CategoryDTO::fromEntity)
                    .collect(Collectors.toSet()));
        }
        
        return bookDTO;
    }
    
    /**
     * Конвертирует BookDTO в модель Book
     *
     * @param bookDTO DTO книги
     * @return модель книги
     */
    public static Book toEntity(BookDTO bookDTO) {
        if (bookDTO == null) {
            return null;
        }
        
        Book book = new Book();
        book.setId(bookDTO.getId());
        book.setTitle(bookDTO.getTitle());
        book.setAuthor(bookDTO.getAuthor());
        book.setDescription(bookDTO.getDescription());
        book.setIsbn(bookDTO.getIsbn());
        book.setPublicationYear(bookDTO.getPublicationYear());
        book.setPublisher(bookDTO.getPublisher());
        book.setLanguage(bookDTO.getLanguage());
        book.setPageCount(bookDTO.getPageCount());
        book.setFileUrl(bookDTO.getFileUrl());
        book.setCoverImageUrl(bookDTO.getCoverImageUrl());
        book.setUploadDate(bookDTO.getUploadDate());
        
        return book;
    }
} 
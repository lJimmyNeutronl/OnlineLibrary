package ru.arseniy.library.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.arseniy.library.model.Book;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {
    
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);
    
    /**
     * Находит книги из указанной категории и всех её подкатегорий первого уровня
     */
    @Query("SELECT DISTINCT b FROM Book b JOIN b.categories c " +
           "WHERE c.id = :categoryId OR " +
           "EXISTS (SELECT sub FROM Category sub WHERE sub.parentCategory.id = :categoryId AND c.id = sub.id)")
    Page<Book> findByCategoryId(@Param("categoryId") Integer categoryId, Pageable pageable);
    
    /**
     * Находит книги, принадлежащие к любой из указанных категорий
     * Используется для поддержки глубокой иерархии категорий
     */
    @Query("SELECT DISTINCT b FROM Book b JOIN b.categories c WHERE c.id IN :categoryIds")
    Page<Book> findByCategoryIdIn(@Param("categoryIds") List<Integer> categoryIds, Pageable pageable);
    
    /**
     * Находит книги только из указанной категории, без подкатегорий
     */
    @Query("SELECT DISTINCT b FROM Book b JOIN b.categories c WHERE c.id = :categoryId")
    Page<Book> findByExactCategoryId(@Param("categoryId") Integer categoryId, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Book> searchBooks(@Param("query") String query, Pageable pageable);
    
    boolean existsByTitle(String title);
}

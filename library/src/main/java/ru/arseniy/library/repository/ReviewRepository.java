package ru.arseniy.library.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.arseniy.library.model.Review;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    /**
     * Находит все отзывы для конкретной книги с пагинацией
     */
    Page<Review> findByBookId(Integer bookId, Pageable pageable);
    
    /**
     * Находит все отзывы конкретного пользователя с пагинацией
     */
    Page<Review> findByUserId(Integer userId, Pageable pageable);
    
    /**
     * Находит отзыв конкретного пользователя на конкретную книгу
     */
    Optional<Review> findByUserIdAndBookId(Integer userId, Integer bookId);
    
    /**
     * Проверяет, существует ли отзыв от конкретного пользователя на конкретную книгу
     */
    boolean existsByUserIdAndBookId(Integer userId, Integer bookId);
    
    /**
     * Подсчитывает количество отзывов для конкретной книги
     */
    long countByBookId(Integer bookId);
    
    /**
     * Удаляет отзыв по ID пользователя и ID книги
     */
    void deleteByUserIdAndBookId(Integer userId, Integer bookId);
    
    /**
     * Подсчитывает количество отзывов от конкретного пользователя для конкретной книги
     */
    long countByUserIdAndBookId(Integer userId, Integer bookId);
    
    /**
     * Находит все отзывы конкретного пользователя для конкретной книги
     */
    List<Review> findAllByUserIdAndBookId(Integer userId, Integer bookId);
} 
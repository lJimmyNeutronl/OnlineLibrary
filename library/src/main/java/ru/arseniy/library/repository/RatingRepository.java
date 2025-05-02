package ru.arseniy.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.arseniy.library.model.Rating;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    
    List<Rating> findAllByBookId(Integer bookId);
    
    /**
     * Находит рейтинг конкретного пользователя для конкретной книги
     */
    Optional<Rating> findByUserIdAndBookId(Integer userId, Integer bookId);
    
    /**
     * Проверяет, существует ли рейтинг от конкретного пользователя для конкретной книги
     */
    boolean existsByUserIdAndBookId(Integer userId, Integer bookId);
    
    /**
     * Подсчитывает количество рейтингов для конкретной книги
     */
    long countByBookId(Integer bookId);
    
    /**
     * Вычисляет средний рейтинг книги
     */
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.book.id = :bookId")
    Double getAverageRatingByBookId(@Param("bookId") Integer bookId);
    
    /**
     * Удаляет рейтинг по ID пользователя и ID книги
     */
    void deleteByUserIdAndBookId(Integer userId, Integer bookId);
    
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.book.id = :bookId")
    Long countRatingsByBookId(@Param("bookId") Integer bookId);
} 
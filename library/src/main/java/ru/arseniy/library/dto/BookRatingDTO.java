package ru.arseniy.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для передачи агрегированной информации о рейтингах книги
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookRatingDTO {
    
    private Integer bookId;
    private Double averageRating;
    private Long ratingCount;
    private Integer userRating; // Может быть null, если пользователь не ставил рейтинг
    
    public BookRatingDTO(Integer bookId, Double averageRating, Long ratingCount) {
        this.bookId = bookId;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
    }
} 
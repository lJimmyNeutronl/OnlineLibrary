package ru.arseniy.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.arseniy.library.model.Rating;

import java.time.LocalDateTime;

/**
 * DTO для передачи данных о рейтингах
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {
    
    private Integer id;
    private Integer userId;
    private Integer bookId;
    private Integer rating;
    private LocalDateTime date;
    
    /**
     * Конвертирует сущность Rating в RatingDTO
     */
    public static RatingDTO fromEntity(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setId(rating.getId());
        dto.setUserId(rating.getUser().getId());
        dto.setBookId(rating.getBook().getId());
        dto.setRating(rating.getRating());
        dto.setDate(rating.getDate());
        return dto;
    }
} 
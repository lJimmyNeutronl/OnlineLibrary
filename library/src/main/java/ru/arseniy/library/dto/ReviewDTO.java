package ru.arseniy.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.arseniy.library.model.Review;

import java.time.LocalDateTime;

/**
 * DTO для передачи данных об отзывах
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    
    private Integer id;
    private Integer userId;
    private String userFirstName;
    private String userLastName;
    private Integer bookId;
    private String content;
    private LocalDateTime creationDate;
    private LocalDateTime editedDate;
    
    /**
     * Конвертирует сущность Review в ReviewDTO
     */
    public static ReviewDTO fromEntity(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setUserId(review.getUser().getId());
        dto.setUserFirstName(review.getUser().getFirstName());
        dto.setUserLastName(review.getUser().getLastName());
        dto.setBookId(review.getBook().getId());
        dto.setContent(review.getContent());
        dto.setCreationDate(review.getCreationDate());
        dto.setEditedDate(review.getEditedDate());
        return dto;
    }
} 
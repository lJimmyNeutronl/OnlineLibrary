package ru.arseniy.library.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.arseniy.library.dto.ReviewDTO;
import ru.arseniy.library.model.User;
import ru.arseniy.library.service.ReviewService;
import ru.arseniy.library.service.UserService;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Map;

/**
 * Контроллер для работы с отзывами к книгам
 */
@RestController
@RequestMapping("/api/reviews")
@Validated
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    /**
     * Получить все отзывы для книги
     */
    @GetMapping("/{bookId}/reviews")
    public ResponseEntity<List<ReviewDTO>> getBookReviews(@PathVariable Integer bookId) {
        return ResponseEntity.ok(reviewService.getBookReviews(bookId));
    }

    /**
     * Получить отзыв пользователя для книги
     */
    @GetMapping("/{bookId}/user-review")
    public ResponseEntity<?> getUserReview(
            @PathVariable Integer bookId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        return reviewService.getUserReviewForBook(user.getId(), bookId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Добавить или обновить отзыв к книге
     */
    @PostMapping("/{bookId}/review")
    public ResponseEntity<ReviewDTO> addOrUpdateReview(
            @PathVariable Integer bookId,
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        // Получаем текст отзыва из тела запроса
        String content = (String) payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Получаем ID отзыва для обновления (если он есть)
        Integer reviewId = null;
        if (payload.containsKey("reviewId")) {
            try {
                reviewId = Integer.valueOf(payload.get("reviewId").toString());
            } catch (NumberFormatException | NullPointerException e) {
                // Игнорируем ошибки конвертации, reviewId останется null
            }
        }
        
        try {
            // Добавляем или обновляем отзыв
            ReviewDTO reviewDTO = reviewService.addOrUpdateReview(
                    user.getId(), bookId, content, reviewId);
                
            return ResponseEntity.ok(reviewDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(null);
        }
    }

    /**
     * Удалить отзыв пользователя к книге
     */
    @DeleteMapping("/{bookId}/review")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Integer bookId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        // Удаляем отзыв
        reviewService.deleteReview(user.getId(), bookId);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Проверить, оставил ли пользователь отзыв для книги
     */
    @GetMapping("/{bookId}/has-review")
    public ResponseEntity<Map<String, Boolean>> hasUserReviewedBook(
            @PathVariable Integer bookId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        boolean hasReview = reviewService.hasUserReviewedBook(user.getId(), bookId);
        
        return ResponseEntity.ok(Map.of("hasReview", hasReview));
    }

    /**
     * Получить все отзывы пользователя для книги
     */
    @GetMapping("/{bookId}/user-reviews")
    public ResponseEntity<List<ReviewDTO>> getUserReviewsForBook(
            @PathVariable Integer bookId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        // Получаем все отзывы пользователя для данной книги
        List<ReviewDTO> userReviews = reviewService.getUserReviewsForBook(user.getId(), bookId);
        
        return ResponseEntity.ok(userReviews);
    }
} 
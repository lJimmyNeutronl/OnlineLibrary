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

import java.util.List;
import java.util.Map;

/**
 * Контроллер для работы с отзывами к книгам
 */
@RestController
@RequestMapping("/api/books")
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
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        // Получаем текст отзыва из тела запроса
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Добавляем или обновляем отзыв
        ReviewDTO reviewDTO = reviewService.addOrUpdateReview(
                user.getId(), bookId, content);
                
        return ResponseEntity.ok(reviewDTO);
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
} 
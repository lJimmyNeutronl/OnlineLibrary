package ru.arseniy.library.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.arseniy.library.dto.BookRatingDTO;
import ru.arseniy.library.dto.RatingDTO;
import ru.arseniy.library.model.User;
import ru.arseniy.library.service.RatingService;
import ru.arseniy.library.service.UserService;

import java.util.List;
import java.util.Map;

/**
 * Контроллер для работы с рейтингами книг
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final UserService userService;

    /**
     * Получить все рейтинги книги
     */
    @GetMapping("/{bookId}/ratings")
    public ResponseEntity<List<RatingDTO>> getBookRatings(@PathVariable Integer bookId) {
        return ResponseEntity.ok(ratingService.getBookRatings(bookId));
    }

    /**
     * Получить агрегированную информацию о рейтингах книги
     */
    @GetMapping("/{bookId}/rating")
    public ResponseEntity<BookRatingDTO> getBookRating(
            @PathVariable Integer bookId,
            Authentication authentication) {
        
        if (authentication != null && authentication.isAuthenticated()) {
            // Если пользователь аутентифицирован, получаем его ID
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            User user = userService.getUserByEmail(username);
            return ResponseEntity.ok(ratingService.getBookRatingInfoForUser(bookId, user.getId().intValue()));
        } else {
            // Если пользователь не аутентифицирован, возвращаем общую информацию о рейтинге
            return ResponseEntity.ok(ratingService.getBookRatingInfo(bookId));
        }
    }

    /**
     * Добавить или обновить рейтинг книги
     */
    @PostMapping("/{bookId}/rating")
    public ResponseEntity<RatingDTO> addOrUpdateRating(
            @PathVariable Integer bookId,
            @RequestBody Map<String, Integer> payload,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        // Получаем значение рейтинга из тела запроса
        Integer rating = payload.get("rating");
        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().build();
        }
        
        // Добавляем или обновляем рейтинг
        RatingDTO ratingDTO = ratingService.addOrUpdateRating(
                user.getId().intValue(), bookId, rating);
                
        return ResponseEntity.ok(ratingDTO);
    }

    /**
     * Удалить рейтинг книги
     */
    @DeleteMapping("/{bookId}/rating")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Integer bookId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Получаем текущего пользователя
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        User user = userService.getUserByEmail(username);
        
        // Удаляем рейтинг
        ratingService.deleteRating(user.getId().intValue(), bookId);
        
        return ResponseEntity.noContent().build();
    }
} 
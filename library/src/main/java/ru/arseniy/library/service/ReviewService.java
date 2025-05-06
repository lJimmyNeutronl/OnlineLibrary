package ru.arseniy.library.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.arseniy.library.dto.ReviewDTO;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.Review;
import ru.arseniy.library.model.User;
import ru.arseniy.library.repository.BookRepository;
import ru.arseniy.library.repository.ReviewRepository;
import ru.arseniy.library.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Сервис для работы с отзывами к книгам
 */
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    /**
     * Получить все отзывы для указанной книги
     */
    public List<ReviewDTO> getBookReviews(Integer bookId) {
        return reviewRepository.findByBookId(bookId, Pageable.unpaged())
                .stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Получить отзыв пользователя для книги
     */
    public Optional<ReviewDTO> getUserReviewForBook(Integer userId, Integer bookId) {
        return reviewRepository.findByUserIdAndBookId(userId, bookId)
                .map(ReviewDTO::fromEntity);
    }

    /**
     * Добавить новый отзыв к книге или обновить существующий (если указан ID отзыва)
     */
    @Transactional
    public ReviewDTO addOrUpdateReview(Integer userId, Integer bookId, String content, Integer reviewId) {
        // Проверяем, что книга существует
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Книга с ID " + bookId + " не найдена"));
                
        // Проверяем, что пользователь существует
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь с ID " + userId + " не найден"));
        
        // Проверка на лимит отзывов (3 отзыва на книгу от одного пользователя)
        if (reviewId == null) {
            // Считаем количество отзывов пользователя на данную книгу
            long userReviewCount = reviewRepository.countByUserIdAndBookId(userId, bookId);
            if (userReviewCount >= 3) {
                throw new IllegalStateException("Достигнут лимит отзывов (максимум 3) для данной книги от одного пользователя");
            }
        }
        
        Review review;
        if (reviewId != null) {
            // Если указан ID отзыва, обновляем существующий отзыв
            review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new IllegalArgumentException("Отзыв с ID " + reviewId + " не найден"));
            
            // Проверяем, принадлежит ли отзыв данному пользователю и для данной книги
            if (!review.getUser().getId().equals(userId) || !review.getBook().getId().equals(bookId)) {
                throw new IllegalArgumentException("Отзыв принадлежит другому пользователю или относится к другой книге");
            }
            
            review.setContent(content);
            // Дата редактирования обновится автоматически через @PreUpdate
        } else {
            // Создаем новый отзыв
            review = new Review();
            review.setUser(user);
            review.setBook(book);
            review.setContent(content);
            review.setCreationDate(LocalDateTime.now());
        }
        
        // Сохраняем отзыв
        Review savedReview = reviewRepository.save(review);
        
        return ReviewDTO.fromEntity(savedReview);
    }

    /**
     * Добавить новый отзыв к книге без указания ID (для совместимости со старыми вызовами)
     */
    @Transactional
    public ReviewDTO addOrUpdateReview(Integer userId, Integer bookId, String content) {
        return addOrUpdateReview(userId, bookId, content, null);
    }

    /**
     * Удалить отзыв пользователя для книги
     */
    @Transactional
    public void deleteReview(Integer userId, Integer bookId) {
        reviewRepository.deleteByUserIdAndBookId(userId, bookId);
    }

    /**
     * Подсчитать количество отзывов для книги
     */
    public long countReviewsByBookId(Integer bookId) {
        return reviewRepository.countByBookId(bookId);
    }

    /**
     * Проверить, существует ли отзыв от пользователя для книги
     */
    public boolean hasUserReviewedBook(Integer userId, Integer bookId) {
        return reviewRepository.existsByUserIdAndBookId(userId, bookId);
    }

    /**
     * Получить все отзывы пользователя для конкретной книги
     */
    public List<ReviewDTO> getUserReviewsForBook(Integer userId, Integer bookId) {
        List<Review> reviews = reviewRepository.findAllByUserIdAndBookId(userId, bookId);
        return reviews.stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }
} 
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
     * Добавить или обновить отзыв к книге
     */
    @Transactional
    public ReviewDTO addOrUpdateReview(Integer userId, Integer bookId, String content) {
        // Проверяем, что книга существует
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Книга с ID " + bookId + " не найдена"));
                
        // Проверяем, что пользователь существует
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь с ID " + userId + " не найден"));
        
        // Проверяем, существует ли уже отзыв от этого пользователя для этой книги
        Optional<Review> existingReview = reviewRepository.findByUserIdAndBookId(userId, bookId);
        
        Review review;
        if (existingReview.isPresent()) {
            // Обновляем существующий отзыв
            review = existingReview.get();
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
} 
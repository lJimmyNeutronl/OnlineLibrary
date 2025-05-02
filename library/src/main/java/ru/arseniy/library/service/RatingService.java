package ru.arseniy.library.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.arseniy.library.dto.BookRatingDTO;
import ru.arseniy.library.dto.RatingDTO;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.Rating;
import ru.arseniy.library.model.User;
import ru.arseniy.library.repository.BookRepository;
import ru.arseniy.library.repository.RatingRepository;
import ru.arseniy.library.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Сервис для работы с рейтингами книг
 */
@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    /**
     * Получить все рейтинги для указанной книги
     */
    public List<RatingDTO> getBookRatings(Integer bookId) {
        return ratingRepository.findAllByBookId(bookId)
                .stream()
                .map(RatingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Получить агрегированную информацию о рейтингах книги
     * (среднее значение и количество оценок)
     */
    public BookRatingDTO getBookRatingInfo(Integer bookId) {
        Double averageRating = ratingRepository.getAverageRatingByBookId(bookId);
        Long ratingCount = ratingRepository.countRatingsByBookId(bookId);
        
        // Если нет рейтингов, устанавливаем средний рейтинг 0
        if (averageRating == null) {
            averageRating = 0.0;
        }
        
        return new BookRatingDTO(bookId, averageRating, ratingCount);
    }

    /**
     * Получить рейтинг пользователя для книги
     */
    public Optional<RatingDTO> getUserRatingForBook(Integer userId, Integer bookId) {
        return ratingRepository.findByUserIdAndBookId(userId, bookId)
                .map(RatingDTO::fromEntity);
    }

    /**
     * Добавить или обновить рейтинг книги
     */
    @Transactional
    public RatingDTO addOrUpdateRating(Integer userId, Integer bookId, Integer ratingValue) {
        // Проверяем, что книга существует
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Книга с ID " + bookId + " не найдена"));
                
        // Проверяем, что пользователь существует
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь с ID " + userId + " не найден"));
        
        // Проверяем, существует ли уже рейтинг от этого пользователя для этой книги
        Optional<Rating> existingRating = ratingRepository.findByUserIdAndBookId(userId, bookId);
        
        Rating rating;
        if (existingRating.isPresent()) {
            // Обновляем существующий рейтинг
            rating = existingRating.get();
            rating.setRating(ratingValue);
            rating.setDate(LocalDateTime.now());
        } else {
            // Создаем новый рейтинг
            rating = new Rating();
            rating.setUser(user);
            rating.setBook(book);
            rating.setRating(ratingValue);
            rating.setDate(LocalDateTime.now());
        }
        
        // Сохраняем рейтинг
        Rating savedRating = ratingRepository.save(rating);
        
        return RatingDTO.fromEntity(savedRating);
    }

    /**
     * Удалить рейтинг пользователя для книги
     */
    @Transactional
    public void deleteRating(Integer userId, Integer bookId) {
        ratingRepository.deleteByUserIdAndBookId(userId, bookId);
    }

    /**
     * Получить агрегированную информацию о рейтингах книги для конкретного пользователя
     * (включая рейтинг пользователя, если есть)
     */
    public BookRatingDTO getBookRatingInfoForUser(Integer bookId, Integer userId) {
        BookRatingDTO ratingInfo = getBookRatingInfo(bookId);
        
        // Добавляем рейтинг пользователя, если он есть
        if (userId != null) {
            getUserRatingForBook(userId, bookId)
                    .ifPresent(userRating -> ratingInfo.setUserRating(userRating.getRating()));
        }
        
        return ratingInfo;
    }
} 
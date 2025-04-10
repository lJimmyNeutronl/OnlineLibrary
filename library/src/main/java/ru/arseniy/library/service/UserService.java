package ru.arseniy.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.ReadingHistory;
import ru.arseniy.library.model.User;
import ru.arseniy.library.repository.BookRepository;
import ru.arseniy.library.repository.ReadingHistoryRepository;
import ru.arseniy.library.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private ReadingHistoryRepository readingHistoryRepository;
    
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + id + " не найден"));
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь с email " + email + " не найден"));
    }
    
    @Transactional
    public void addBookToFavorites(Integer userId, Integer bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Книга с ID " + bookId + " не найдена"));
        
        Set<Book> favorites = user.getFavorites();
        if (favorites == null) {
            favorites = new HashSet<>();
        }
        
        favorites.add(book);
        user.setFavorites(favorites);
        
        userRepository.save(user);
    }
    
    @Transactional
    public void removeBookFromFavorites(Integer userId, Integer bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Книга с ID " + bookId + " не найдена"));
        
        Set<Book> favorites = user.getFavorites();
        if (favorites != null) {
            favorites.remove(book);
            user.setFavorites(favorites);
            userRepository.save(user);
        }
    }
    
    public Set<Book> getUserFavorites(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));
        
        return user.getFavorites();
    }
    
    @Transactional
    public ReadingHistory updateReadingHistory(Integer userId, Integer bookId, Boolean isCompleted) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Книга с ID " + bookId + " не найдена"));
        
        ReadingHistory readingHistory = readingHistoryRepository.findByUserIdAndBookId(userId, bookId)
                .orElse(new ReadingHistory());
        
        readingHistory.setUser(user);
        readingHistory.setBook(book);
        readingHistory.setLastReadDate(LocalDateTime.now());
        readingHistory.setIsCompleted(isCompleted);
        
        return readingHistoryRepository.save(readingHistory);
    }
    
    public Page<ReadingHistory> getUserReadingHistory(Integer userId, Pageable pageable) {
        return readingHistoryRepository.findByUserId(userId, pageable);
    }
}

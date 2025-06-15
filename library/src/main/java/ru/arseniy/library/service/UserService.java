package ru.arseniy.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.arseniy.library.dto.ChangePasswordRequest;
import ru.arseniy.library.dto.MessageResponse;
import ru.arseniy.library.dto.UpdateProfileRequest;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.ReadingHistory;
import ru.arseniy.library.model.Role;
import ru.arseniy.library.model.RoleType;
import ru.arseniy.library.model.User;
import ru.arseniy.library.repository.BookRepository;
import ru.arseniy.library.repository.ReadingHistoryRepository;
import ru.arseniy.library.repository.RoleRepository;
import ru.arseniy.library.repository.UserRepository;
import ru.arseniy.library.exception.ResourceNotFoundException;
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
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Изменяет пароль пользователя
     * 
     * @param userId ID пользователя
     * @param request запрос на изменение пароля
     * @return сообщение о результате операции
     */
    @Transactional
    public MessageResponse changePassword(Integer userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));
        
        // Проверяем текущий пароль
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return new MessageResponse("Текущий пароль указан неверно");
        }
        
        // Устанавливаем новый пароль
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return new MessageResponse("Пароль успешно изменен");
    }
    
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
    public ReadingHistory updateReadingHistory(Integer userId, Integer bookId, Boolean isCompleted, Integer lastReadPage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Книга с ID " + bookId + " не найдена"));
        
        ReadingHistory readingHistory = readingHistoryRepository.findByUserIdAndBookId(userId, bookId)
                .orElse(new ReadingHistory());
        
        readingHistory.setUser(user);
        readingHistory.setBook(book);
        readingHistory.setLastReadDate(LocalDateTime.now());
        
        if (isCompleted != null) {
        readingHistory.setIsCompleted(isCompleted);
        } else if (readingHistory.getId() == null) {
            readingHistory.setIsCompleted(false);
        }
        // Устанавливаем номер последней прочитанной страницы
        if (lastReadPage != null) {
            readingHistory.setLastReadPage(lastReadPage);
        }
        
        return readingHistoryRepository.save(readingHistory);
    }
    
    public Page<ReadingHistory> getUserReadingHistory(Integer userId, Pageable pageable) {
        return readingHistoryRepository.findByUserId(userId, pageable);
    }

    /**
     * Очищает всю историю чтения пользователя
     * @param userId ID пользователя
     */
    @Transactional
    public void clearUserReadingHistory(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));
        
        readingHistoryRepository.deleteByUserId(userId);
    }

    /**
     * Обновляет профиль пользователя
     * @param userId ID пользователя
     * @param updateProfileRequest запрос на обновление профиля
     * @return обновленный пользователь
     */
    public User updateProfile(Integer userId, UpdateProfileRequest updateProfileRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден: " + userId));
        
        // Обновляем поля пользователя
        user.setFirstName(updateProfileRequest.getFirstName());
        user.setLastName(updateProfileRequest.getLastName());
        
        // Сохраняем обновленного пользователя
        return userRepository.save(user);
    }

    /**
     * Получает список всех пользователей (только для администраторов)
     */
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Назначает роль ADMIN пользователю (только для SUPERADMIN)
     * @param userId ID пользователя
     * @return сообщение о результате операции
     */
    @Transactional
    public MessageResponse assignAdminRole(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        // Проверяем, что пользователь не является суперадмином
        if (isSuperAdmin(user)) {
            throw new RuntimeException("Нельзя изменить роль суперадмина");
        }

        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN.getName())
                .orElseThrow(() -> new RuntimeException("Роль ADMIN не найдена"));

        // Проверяем, нет ли уже роли админа
        if (user.getRoles().contains(adminRole)) {
            return new MessageResponse("Пользователь уже имеет роль администратора");
        }

        user.getRoles().add(adminRole);
        userRepository.save(user);

        return new MessageResponse("Роль администратора успешно назначена пользователю " + user.getEmail());
    }

    /**
     * Удаляет роль ADMIN у пользователя (только для SUPERADMIN)
     * @param userId ID пользователя
     * @return сообщение о результате операции
     */
    @Transactional
    public MessageResponse removeAdminRole(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        // Проверяем, что пользователь не является суперадмином
        if (isSuperAdmin(user)) {
            throw new RuntimeException("Нельзя изменить роль суперадмина");
        }

        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN.getName())
                .orElseThrow(() -> new RuntimeException("Роль ADMIN не найдена"));

        if (!user.getRoles().contains(adminRole)) {
            return new MessageResponse("Пользователь не имеет роли администратора");
        }

        user.getRoles().remove(adminRole);
        userRepository.save(user);

        return new MessageResponse("Роль администратора удалена у пользователя " + user.getEmail());
    }

    /**
     * Блокирует/разблокирует пользователя (только для SUPERADMIN)
     */
    @Transactional
    public MessageResponse toggleUserBlock(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        // Проверяем, что пользователь не является суперадмином
        if (isSuperAdmin(user)) {
            throw new RuntimeException("Нельзя заблокировать суперадмина");
        }

        // Переключаем статус блокировки
        boolean newEnabledStatus = !user.getEnabled();
        user.setEnabled(newEnabledStatus);
        userRepository.save(user);

        String action = newEnabledStatus ? "разблокирован" : "заблокирован";
        return new MessageResponse("Пользователь " + user.getEmail() + " " + action);
    }

    /**
     * Удаляет пользователя (только для SUPERADMIN)
     * Выполняет каскадное удаление всех связанных данных
     */
    @Transactional
    public MessageResponse deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь с ID " + userId + " не найден"));

        // Проверяем, что пользователь не является суперадмином
        if (isSuperAdmin(user)) {
            throw new RuntimeException("Нельзя удалить суперадмина");
        }

        String userEmail = user.getEmail();
        
        // Каскадное удаление происходит автоматически благодаря настройкам в модели User:
        // - readingHistory (cascade = CascadeType.ALL, orphanRemoval = true)
        // - reviews (cascade = CascadeType.ALL, orphanRemoval = true)
        // - ratings (cascade = CascadeType.ALL, orphanRemoval = true)
        // - favorites (связь many-to-many, удаляется автоматически)
        
        userRepository.delete(user);
        
        return new MessageResponse("Пользователь " + userEmail + " успешно удален");
    }

    /**
     * Проверяет, является ли пользователь суперадмином
     */
    public boolean isSuperAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> RoleType.ROLE_SUPERADMIN.getName().equals(role.getName()));
    }

    /**
     * Проверяет, является ли пользователь администратором (включая суперадмина)
     */
    public boolean isAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> RoleType.ROLE_ADMIN.getName().equals(role.getName()) ||
                                RoleType.ROLE_SUPERADMIN.getName().equals(role.getName()));
    }

    /**
     * Получает количество пользователей для статистики
     */
    public long getUserCount() {
        return userRepository.count();
    }

    /**
     * Получает количество администраторов для статистики
     */
    public long getAdminCount() {
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN.getName())
                .orElse(null);
        Role superAdminRole = roleRepository.findByName(RoleType.ROLE_SUPERADMIN.getName())
                .orElse(null);

        if (adminRole == null && superAdminRole == null) {
            return 0;
        }

        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(adminRole) || user.getRoles().contains(superAdminRole))
                .count();
    }
}

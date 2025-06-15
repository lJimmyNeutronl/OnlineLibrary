package ru.arseniy.library.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.arseniy.library.dto.ChangePasswordRequest;
import ru.arseniy.library.dto.MessageResponse;
import ru.arseniy.library.dto.UpdateProfileRequest;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.ReadingHistory;
import ru.arseniy.library.model.User;
import ru.arseniy.library.security.services.UserDetailsImpl;
import ru.arseniy.library.service.UserService;

import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.getUserById(userDetails.getId());
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/update")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<User> updateProfile(@Valid @RequestBody UpdateProfileRequest updateProfileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User updatedUser = userService.updateProfile(userDetails.getId(), updateProfileRequest);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PostMapping("/change-password")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        MessageResponse response = userService.changePassword(userDetails.getId(), changePasswordRequest);
        
        if (response.getMessage().contains("неверно")) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/favorites")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<Set<Book>> getCurrentUserFavorites() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Set<Book> favorites = userService.getUserFavorites(userDetails.getId());
        return ResponseEntity.ok(favorites);
    }
    
    @PostMapping("/favorites/{bookId}")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<?> addBookToFavorites(@PathVariable Integer bookId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        userService.addBookToFavorites(userDetails.getId(), bookId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/favorites/{bookId}")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<?> removeBookFromFavorites(@PathVariable Integer bookId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        userService.removeBookFromFavorites(userDetails.getId(), bookId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/reading-history/{bookId}")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<ReadingHistory> updateReadingHistory(
            @PathVariable Integer bookId,
            @RequestParam(required = false) Boolean isCompleted,
            @RequestParam(required = false) Integer lastReadPage) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ReadingHistory readingHistory = userService.updateReadingHistory(userDetails.getId(), bookId, isCompleted, lastReadPage);
        return ResponseEntity.ok(readingHistory);
    }
    
    @GetMapping("/reading-history")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<Page<ReadingHistory>> getUserReadingHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastReadDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<ReadingHistory> readingHistory = userService.getUserReadingHistory(userDetails.getId(), pageable);
        return ResponseEntity.ok(readingHistory);
    }

    @DeleteMapping("/reading-history")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<MessageResponse> clearReadingHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        userService.clearUserReadingHistory(userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("История чтения успешно очищена"));
    }

    // =================== АДМИНИСТРАТИВНЫЕ МЕТОДЫ ===================

    /**
     * Получение списка всех пользователей (для администраторов)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "registrationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Назначение роли ADMIN пользователю (только для SUPERADMIN)
     */
    @PostMapping("/admin/assign-admin/{userId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<MessageResponse> assignAdminRole(@PathVariable Integer userId) {
        try {
            MessageResponse response = userService.assignAdminRole(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Удаление роли ADMIN у пользователя (только для SUPERADMIN)
     */
    @DeleteMapping("/admin/remove-admin/{userId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<MessageResponse> removeAdminRole(@PathVariable Integer userId) {
        try {
            MessageResponse response = userService.removeAdminRole(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Блокировка/разблокировка пользователя (только для SUPERADMIN)
     */
    @PutMapping("/admin/toggle-block/{userId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<MessageResponse> toggleUserBlock(@PathVariable Integer userId) {
        try {
            MessageResponse response = userService.toggleUserBlock(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Удаление пользователя (только для SUPERADMIN)
     */
    @DeleteMapping("/admin/delete/{userId}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Integer userId) {
        try {
            MessageResponse response = userService.deleteUser(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Получение статистики пользователей (для администраторов)
     */
    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<?> getUserStatistics() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userService.getUserById(userDetails.getId());
        
        long totalUsers = userService.getUserCount();
        
        // Информация об администраторах доступна только суперадмину
        if (userService.isSuperAdmin(currentUser)) {
            long adminCount = userService.getAdminCount();
            return ResponseEntity.ok(new AdminStatistics(totalUsers, adminCount));
        } else {
            return ResponseEntity.ok(new UserStatistics(totalUsers));
        }
    }

    // DTO классы для статистики
    public static class UserStatistics {
        public final long totalUsers;

        public UserStatistics(long totalUsers) {
            this.totalUsers = totalUsers;
        }
    }

    public static class AdminStatistics extends UserStatistics {
        public final long adminCount;

        public AdminStatistics(long totalUsers, long adminCount) {
            super(totalUsers);
            this.adminCount = adminCount;
        }
    }
}

package ru.arseniy.library.controller;

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
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.ReadingHistory;
import ru.arseniy.library.model.User;
import ru.arseniy.library.security.services.UserDetailsImpl;
import ru.arseniy.library.service.UserService;

import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.getUserById(userDetails.getId());
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/favorites")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Set<Book>> getCurrentUserFavorites() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Set<Book> favorites = userService.getUserFavorites(userDetails.getId());
        return ResponseEntity.ok(favorites);
    }
    
    @PostMapping("/favorites/{bookId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addBookToFavorites(@PathVariable Integer bookId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        userService.addBookToFavorites(userDetails.getId(), bookId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/favorites/{bookId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> removeBookFromFavorites(@PathVariable Integer bookId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        userService.removeBookFromFavorites(userDetails.getId(), bookId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/reading-history/{bookId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ReadingHistory> updateReadingHistory(
            @PathVariable Integer bookId,
            @RequestParam(defaultValue = "false") Boolean isCompleted) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ReadingHistory readingHistory = userService.updateReadingHistory(userDetails.getId(), bookId, isCompleted);
        return ResponseEntity.ok(readingHistory);
    }
    
    @GetMapping("/reading-history")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
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
}

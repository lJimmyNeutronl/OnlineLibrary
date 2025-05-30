package ru.arseniy.library.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.arseniy.library.dto.BookDTO;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.service.BookService;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/books")
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    @GetMapping
    public ResponseEntity<Page<BookDTO>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<Book> books = bookService.getAllBooks(pageable);
        
        // Преобразуем Page<Book> в Page<BookDTO>
        List<BookDTO> bookDTOs = books.getContent().stream()
                .map(BookDTO::fromEntity)
                .collect(Collectors.toList());
        
        Page<BookDTO> bookDTOPage = new PageImpl<>(
                bookDTOs, 
                pageable, 
                books.getTotalElements()
        );
        
        return ResponseEntity.ok(bookDTOPage);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Integer id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(BookDTO.fromEntity(book));
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<BookDTO>> getPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        List<Book> popularBooks = bookService.getPopularBooks(limit);
        List<BookDTO> bookDTOs = popularBooks.stream()
                .map(BookDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookDTOs);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<BookDTO>> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Page<Book> books;
        Pageable pageable;
        
        // Если сортировка по рейтингу, обрабатываем отдельно
        if ("rating".equals(sortBy)) {
            books = bookService.searchBooksWithRatingSort(query, page, size, direction);
            pageable = PageRequest.of(page, size);
        } else {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            books = bookService.searchBooks(query, pageable);
        }
        
        // Преобразуем Page<Book> в Page<BookDTO>
        List<BookDTO> bookDTOs = books.getContent().stream()
                .map(BookDTO::fromEntity)
                .collect(Collectors.toList());
        
        Page<BookDTO> bookDTOPage = new PageImpl<>(
                bookDTOs, 
                pageable, 
                books.getTotalElements()
        );
        
        return ResponseEntity.ok(bookDTOPage);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<BookDTO>> getBooksByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "true") boolean includeSubcategories) {
        
        Page<Book> books;
        Pageable pageable;
        
        // Если сортировка по рейтингу, обрабатываем отдельно
        if ("rating".equals(sortBy)) {
            books = bookService.getBooksByCategoryWithRatingSort(categoryId, page, size, direction, includeSubcategories);
            pageable = PageRequest.of(page, size);
        } else {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        if (includeSubcategories) {
            // Получаем книги с учетом всей иерархии категорий
            books = bookService.getBooksByCategoryWithHierarchy(categoryId, pageable);
        } else {
            // Получаем книги только из указанной категории без подкатегорий
            books = bookService.getBooksByCategory(categoryId, pageable);
            }
        }
        
        // Преобразуем Page<Book> в Page<BookDTO>
        List<BookDTO> bookDTOs = books.getContent().stream()
                .map(BookDTO::fromEntity)
                .collect(Collectors.toList());
        
        Page<BookDTO> bookDTOPage = new PageImpl<>(
                bookDTOs, 
                pageable, 
                books.getTotalElements()
        );
        
        return ResponseEntity.ok(bookDTOPage);
    }
    
    @GetMapping("/categories")
    public ResponseEntity<Page<BookDTO>> getBooksByMultipleCategories(
            @RequestParam List<Integer> categoryIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "false") boolean includeSubcategories) {
        
        Page<Book> books;
        Pageable pageable;
        
        // Если сортировка по рейтингу, обрабатываем отдельно
        if ("rating".equals(sortBy)) {
            books = bookService.getBooksByMultipleCategoriesWithRatingSort(categoryIds, page, size, direction, includeSubcategories);
            pageable = PageRequest.of(page, size);
        } else {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            books = bookService.getBooksByMultipleCategories(categoryIds, pageable, includeSubcategories);
        }
        
        // Преобразуем Page<Book> в Page<BookDTO>
        List<BookDTO> bookDTOs = books.getContent().stream()
                .map(BookDTO::fromEntity)
                .collect(Collectors.toList());
        
        Page<BookDTO> bookDTOPage = new PageImpl<>(
                bookDTOs, 
                pageable, 
                books.getTotalElements()
        );
        
        return ResponseEntity.ok(bookDTOPage);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDTO> createBook(
            @RequestBody BookDTO bookDTO,
            @RequestParam(required = false) List<Integer> categoryIds) {
        
        Book book = BookDTO.toEntity(bookDTO);
        Book createdBook = bookService.createBook(book, categoryIds);
        return ResponseEntity.ok(BookDTO.fromEntity(createdBook));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Integer id,
            @RequestBody BookDTO bookDTO,
            @RequestParam(required = false) List<Integer> categoryIds) {
        
        Book book = BookDTO.toEntity(bookDTO);
        Book updatedBook = bookService.updateBook(id, book, categoryIds);
        return ResponseEntity.ok(BookDTO.fromEntity(updatedBook));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBook(@PathVariable Integer id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}

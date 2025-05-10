package ru.arseniy.library.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.arseniy.library.exception.ResourceNotFoundException;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.Category;
import ru.arseniy.library.repository.BookRepository;
import ru.arseniy.library.repository.CategoryRepository;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BookService {
    
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookFileService bookFileService;
    
    public Page<Book> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }
    
    public Book getBookById(Integer id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Книга с ID " + id + " не найдена"));
    }
    
    public Page<Book> searchBooks(String query, Pageable pageable) {
        return bookRepository.searchBooks(query, pageable);
    }
    
    /**
     * Получает книги только из указанной категории (без подкатегорий)
     *
     * @param categoryId ID категории
     * @param pageable объект пагинации
     * @return страницу книг
     */
    public Page<Book> getBooksByCategory(Integer categoryId, Pageable pageable) {
        return bookRepository.findByExactCategoryId(categoryId, pageable);
    }
    
    /**
     * Получает книги по категории с учетом всей иерархии подкатегорий (для глубокой иерархии)
     * Примечание: Использует рекурсию для получения всех подкатегорий любой глубины
     *
     * @param categoryId ID категории
     * @param pageable объект пагинации
     * @return страницу книг
     */
    public Page<Book> getBooksByCategoryWithHierarchy(Integer categoryId, Pageable pageable) {
        // Получаем категорию
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Категория с ID " + categoryId + " не найдена"));
        
        // Получаем все ID категорий (включая саму категорию и все подкатегории любой глубины)
        Set<Integer> allCategoryIds = new HashSet<>();
        allCategoryIds.add(categoryId);
        getAllSubcategoryIds(category, allCategoryIds);
        
        // Используем специальный запрос, который исключает дубликаты на уровне SQL
        return bookRepository.findDistinctByCategoryIdIn(new ArrayList<>(allCategoryIds), pageable);
    }
    
    /**
     * Рекурсивно собирает ID всех подкатегорий
     *
     * @param category родительская категория
     * @param result множество для накопления ID категорий
     */
    private void getAllSubcategoryIds(Category category, Set<Integer> result) {
        // Загружаем подкатегории текущей категории
        List<Category> subcategories = categoryRepository.findByParentCategoryId(category.getId());
        
        for (Category subcategory : subcategories) {
            result.add(subcategory.getId());
            getAllSubcategoryIds(subcategory, result);
        }
    }
    
    @Transactional
    public Book createBook(Book book, List<Integer> categoryIds) {
        book.setUploadDate(LocalDateTime.now());
        
        if (categoryIds != null && !categoryIds.isEmpty()) {
            Set<Category> categories = new HashSet<>();
            categoryIds.forEach(categoryId -> {
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException("Категория с ID " + categoryId + " не найдена"));
                categories.add(category);
            });
            book.setCategories(categories);
        }
        
        return bookRepository.save(book);
    }
    
    @Transactional
    public Book updateBook(Integer id, Book bookDetails, List<Integer> categoryIds) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Книга с ID " + id + " не найдена"));
        
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setDescription(bookDetails.getDescription());
        book.setIsbn(bookDetails.getIsbn());
        book.setPublicationYear(bookDetails.getPublicationYear());
        book.setPublisher(bookDetails.getPublisher());
        book.setLanguage(bookDetails.getLanguage());
        book.setPageCount(bookDetails.getPageCount());
        book.setFileUrl(bookDetails.getFileUrl());
        book.setCoverImageUrl(bookDetails.getCoverImageUrl());
        
        if (categoryIds != null && !categoryIds.isEmpty()) {
            Set<Category> categories = new HashSet<>();
            categoryIds.forEach(categoryId -> {
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException("Категория с ID " + categoryId + " не найдена"));
                categories.add(category);
            });
            book.setCategories(categories);
        }
        
        return bookRepository.save(book);
    }
    
    @Transactional
    public void deleteBook(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Книга с ID " + id + " не найдена"));
        
        // Удаляем файлы книги из хранилища
        bookFileService.deleteBookFile(id);
        bookFileService.deleteBookCover(id);
        
        bookRepository.delete(book);
    }
    
    /**
     * Загружает файл книги и обновляет URL в базе данных
     *
     * @param id идентификатор книги
     * @param file файл книги
     * @return обновленная книга
     * @throws IOException если произошла ошибка при загрузке файла
     */
    @Transactional
    public Book uploadBookFile(Integer id, MultipartFile file) throws IOException {
        Book book = getBookById(id);
        
        String fileUrl = bookFileService.uploadBookFile(file, id);
        book.setFileUrl(fileUrl);
        
        return bookRepository.save(book);
    }
    
    /**
     * Загружает обложку книги и обновляет URL в базе данных
     *
     * @param id идентификатор книги
     * @param file файл обложки
     * @return обновленная книга
     * @throws IOException если произошла ошибка при загрузке файла
     */
    @Transactional
    public Book uploadBookCover(Integer id, MultipartFile file) throws IOException {
        Book book = getBookById(id);
        
        String coverUrl = bookFileService.uploadBookCover(file, id);
        book.setCoverImageUrl(coverUrl);
        
        return bookRepository.save(book);
    }
    
    /**
     * Получает файл книги из хранилища
     *
     * @param id идентификатор книги
     * @return поток данных файла книги, если файл найден
     */
    public Optional<InputStream> getBookFile(Integer id) {
        // Проверяем, существует ли книга
        getBookById(id);
        
        return bookFileService.getBookFile(id);
    }
    
    /**
     * Получает обложку книги из хранилища
     *
     * @param id идентификатор книги
     * @return поток данных обложки книги, если файл найден
     */
    public Optional<InputStream> getBookCover(Integer id) {
        // Проверяем, существует ли книга
        getBookById(id);
        
        return bookFileService.getBookCover(id);
    }
}

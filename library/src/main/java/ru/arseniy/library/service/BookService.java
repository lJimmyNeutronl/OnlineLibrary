package ru.arseniy.library.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.arseniy.library.exception.ResourceNotFoundException;
import ru.arseniy.library.model.Book;
import ru.arseniy.library.model.Category;
import ru.arseniy.library.repository.BookRepository;
import ru.arseniy.library.repository.CategoryRepository;
import ru.arseniy.library.repository.RatingRepository;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class BookService {
    
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookFileService bookFileService;
    private final RatingRepository ratingRepository;
    
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
     * Получает популярные книги, отсортированные по рейтингу
     *
     * @param limit максимальное количество книг для возврата
     * @return список популярных книг
     */
    public List<Book> getPopularBooks(int limit) {
        // Получаем все книги
        List<Book> allBooks = bookRepository.findAll();
        
        // Обогащаем книги информацией о рейтинге
        for (Book book : allBooks) {
            Double averageRating = ratingRepository.getAverageRatingByBookId(book.getId());
            Long ratingCount = ratingRepository.countRatingsByBookId(book.getId());
            
            if (averageRating != null) {
                book.setRating(averageRating);
            } else {
                book.setRating(0.0);
            }
            
            if (ratingCount != null) {
                book.setRatingsCount(ratingCount.intValue());
            } else {
                book.setRatingsCount(0);
            }
        }
        
        // Сортируем книги по рейтингу (от высокого к низкому)
        List<Book> sortedBooks = allBooks.stream()
                .sorted(Comparator.comparing(Book::getRating, Comparator.reverseOrder())
                        .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0, Comparator.reverseOrder()))
                .limit(limit)
                .collect(Collectors.toList());
        
        return sortedBooks;
    }
    
    /**
     * Получает книги только из указанной категории (без подкатегорий)
     *
     * @param categoryId ID категории
     * @param pageable объект пагинации
     * @return страницу книг
     */
    public Page<Book> getBooksByCategory(Integer categoryId, Pageable pageable) {
        Page<Book> page = bookRepository.findByExactCategoryId(categoryId, pageable);
        enrichBooksWithRatings(page.getContent());
        return page;
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
        Page<Book> page = bookRepository.findDistinctByCategoryIdIn(new ArrayList<>(allCategoryIds), pageable);
        enrichBooksWithRatings(page.getContent());
        return page;
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
    
    /**
     * Получает книги по категории с сортировкой по рейтингу
     *
     * @param categoryId ID категории
     * @param page номер страницы
     * @param size размер страницы
     * @param direction направление сортировки (asc/desc)
     * @param includeSubcategories включать ли подкатегории
     * @return страницу книг, отсортированных по рейтингу
     */
    public Page<Book> getBooksByCategoryWithRatingSort(Integer categoryId, int page, int size, String direction, boolean includeSubcategories) {
        List<Book> allBooks;
        
        if (includeSubcategories) {
            // Получаем все книги категории с подкатегориями без пагинации
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Категория с ID " + categoryId + " не найдена"));
            
            Set<Integer> allCategoryIds = new HashSet<>();
            allCategoryIds.add(categoryId);
            getAllSubcategoryIds(category, allCategoryIds);
            
            allBooks = bookRepository.findByCategoryIdInAsList(new ArrayList<>(allCategoryIds));
        } else {
            // Получаем книги только из указанной категории
            allBooks = bookRepository.findByExactCategoryIdAsList(categoryId);
        }
        
        // Обогащаем книги информацией о рейтинге
        enrichBooksWithRatings(allBooks);
        
        // Сортируем книги по рейтингу
        Comparator<Book> ratingComparator;
        if ("desc".equalsIgnoreCase(direction)) {
            // Сортировка по убыванию: высокие рейтинги первыми
            ratingComparator = Comparator.comparing(Book::getRating, Comparator.reverseOrder())
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0, Comparator.reverseOrder());
        } else {
            // Сортировка по возрастанию: низкие рейтинги первыми
            ratingComparator = Comparator.comparing(Book::getRating)
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0);
        }
        
        List<Book> sortedBooks = allBooks.stream()
                .sorted(ratingComparator)
                .collect(Collectors.toList());
        
        // Применяем пагинацию вручную
        int totalElements = sortedBooks.size();
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalElements);
        
        List<Book> paginatedBooks = sortedBooks.subList(startIndex, endIndex);
        
        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(paginatedBooks, pageable, totalElements);
    }
    
    /**
     * Обогащает книги информацией о рейтингах
     *
     * @param books список книг для обогащения
     */
    private void enrichBooksWithRatings(List<Book> books) {
        for (Book book : books) {
            Double averageRating = ratingRepository.getAverageRatingByBookId(book.getId());
            Long ratingCount = ratingRepository.countRatingsByBookId(book.getId());
            
            if (averageRating != null) {
                book.setRating(averageRating);
            } else {
                book.setRating(0.0);
            }
            
            if (ratingCount != null) {
                book.setRatingsCount(ratingCount.intValue());
            } else {
                book.setRatingsCount(0);
            }
        }
    }
    
    /**
     * Поиск книг с сортировкой по рейтингу
     *
     * @param query поисковый запрос
     * @param page номер страницы
     * @param size размер страницы
     * @param direction направление сортировки
     * @return страница книг, отсортированных по рейтингу
     */
    public Page<Book> searchBooksWithRatingSort(String query, int page, int size, String direction) {
        // Получаем все книги по поисковому запросу без пагинации
        List<Book> allBooks = bookRepository.searchBooksAsList(query);
        
        // Обогащаем книги информацией о рейтинге
        enrichBooksWithRatings(allBooks);
        
        // Сортируем книги по рейтингу
        Comparator<Book> ratingComparator;
        if ("desc".equalsIgnoreCase(direction)) {
            // Сортировка по убыванию: высокие рейтинги первыми
            ratingComparator = Comparator.comparing(Book::getRating, Comparator.reverseOrder())
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0, Comparator.reverseOrder());
        } else {
            // Сортировка по возрастанию: низкие рейтинги первыми
            ratingComparator = Comparator.comparing(Book::getRating)
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0);
        }
        
        List<Book> sortedBooks = allBooks.stream()
                .sorted(ratingComparator)
                .collect(Collectors.toList());
        
        // Применяем пагинацию вручную
        int totalElements = sortedBooks.size();
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalElements);
        
        List<Book> paginatedBooks = sortedBooks.subList(startIndex, endIndex);
        
        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(paginatedBooks, pageable, totalElements);
    }
}

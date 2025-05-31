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
    
    /**
     * Получает все ID категории включая подкатегории
     *
     * @param categoryId ID родительской категории
     * @return список всех ID (родительская + все подкатегории)
     */
    private List<Integer> getAllCategoryIds(Integer categoryId) {
        List<Integer> allIds = new ArrayList<>();
        allIds.add(categoryId);
        
        // Получаем все подкатегории рекурсивно
        collectSubcategoryIds(categoryId, allIds);
        
        return allIds;
    }
    
    /**
     * Рекурсивно собирает ID всех подкатегорий
     *
     * @param parentCategoryId ID родительской категории
     * @param allIds список для накопления ID
     */
    private void collectSubcategoryIds(Integer parentCategoryId, List<Integer> allIds) {
        List<Category> subcategories = categoryRepository.findByParentCategoryId(parentCategoryId);
        
        for (Category subcategory : subcategories) {
            allIds.add(subcategory.getId());
            // Рекурсивно обрабатываем вложенные подкатегории
            collectSubcategoryIds(subcategory.getId(), allIds);
        }
    }
    
    /**
     * Получает книги по нескольким родительским категориям
     *
     * @param categoryIds список ID родительских категорий
     * @param pageable параметры пагинации
     * @param includeSubcategories включать ли подкатегории
     * @return страница книг
     */
    public Page<Book> getBooksByMultipleCategories(List<Integer> categoryIds, Pageable pageable, boolean includeSubcategories) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Page.empty(pageable);
        }
        
        List<Integer> allCategoryIds = new ArrayList<>();
        
        if (includeSubcategories) {
            // Для каждой родительской категории получаем все подкатегории
            for (Integer categoryId : categoryIds) {
                allCategoryIds.addAll(getAllCategoryIds(categoryId));
            }
        } else {
            // Используем только родительские категории
            allCategoryIds = categoryIds;
        }
        
        Page<Book> result = bookRepository.findBooksByMultipleCategories(allCategoryIds, pageable);
        
        return result;
    }
    
    /**
     * Получает книги по нескольким родительским категориям с сортировкой по рейтингу
     *
     * @param categoryIds список ID родительских категорий  
     * @param page номер страницы
     * @param size размер страницы
     * @param direction направление сортировки
     * @param includeSubcategories включать ли подкатегории
     * @return страница книг
     */
    public Page<Book> getBooksByMultipleCategoriesWithRatingSort(List<Integer> categoryIds, int page, int size, String direction, boolean includeSubcategories) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Page.empty(PageRequest.of(page, size));
        }
        
        List<Integer> allCategoryIds = new ArrayList<>();
        
        if (includeSubcategories) {
            // Для каждой родительской категории получаем все подкатегории
            for (Integer categoryId : categoryIds) {
                allCategoryIds.addAll(getAllCategoryIds(categoryId));
            }
        } else {
            // Используем только родительские категории
            allCategoryIds = categoryIds;
        }
        
        // Получаем все книги по категориям без пагинации
        List<Book> allBooks = bookRepository.findBooksByMultipleCategoriesAsList(allCategoryIds);
        
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
     * Применяет фильтры к списку книг
     */
    private List<Book> applyFilters(List<Book> books, Integer yearFrom, Integer yearTo, String language, double minRating) {
        return books.stream()
                .filter(book -> {
                    // Фильтр по году издания
                    if (yearFrom != null && book.getPublicationYear() != null && book.getPublicationYear() < yearFrom) {
                        return false;
                    }
                    if (yearTo != null && book.getPublicationYear() != null && book.getPublicationYear() > yearTo) {
                        return false;
                    }
                    
                    // Фильтр по языку
                    if (language != null && !language.trim().isEmpty()) {
                        String bookLanguage = book.getLanguage();
                        if (bookLanguage == null) {
                            return false;
                        }
                        if (!bookLanguage.equalsIgnoreCase(language.trim())) {
                            return false;
                        }
                    }
                    
                    // Фильтр по минимальному рейтингу
                    if (minRating > 0) {
                        Double bookRating = book.getRating();
                        if (bookRating == null || bookRating < minRating) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Получает все книги с фильтрами
     */
    public Page<Book> getAllBooksWithFilters(Pageable pageable, Integer yearFrom, Integer yearTo, String language, double minRating) {
        // Если нет активных фильтров, используем стандартный метод
        if (yearFrom == null && yearTo == null && (language == null || language.trim().isEmpty()) && minRating <= 0) {
            Page<Book> page = bookRepository.findAll(pageable);
            enrichBooksWithRatings(page.getContent());
            return page;
        }
        
        // Получаем все книги и применяем фильтры
        List<Book> allBooks = bookRepository.findAll();
        enrichBooksWithRatings(allBooks);
        
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Применяем пагинацию вручную
        int totalElements = filteredBooks.size();
        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), totalElements);
        
        List<Book> paginatedBooks = filteredBooks.subList(startIndex, endIndex);
        
        return new PageImpl<>(paginatedBooks, pageable, totalElements);
    }
    
    /**
     * Поиск книг с фильтрами
     */
    public Page<Book> searchBooksWithFilters(String query, Pageable pageable, Integer yearFrom, Integer yearTo, String language, double minRating) {
        // Если нет активных фильтров, используем стандартный метод
        if (yearFrom == null && yearTo == null && (language == null || language.trim().isEmpty()) && minRating <= 0) {
            return searchBooks(query, pageable);
        }
        
        // Получаем все результаты поиска и применяем фильтры
        List<Book> allBooks = bookRepository.searchBooksAsList(query);
        enrichBooksWithRatings(allBooks);
        
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Применяем пагинацию вручную
        int totalElements = filteredBooks.size();
        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), totalElements);
        
        List<Book> paginatedBooks = filteredBooks.subList(startIndex, endIndex);
        
        return new PageImpl<>(paginatedBooks, pageable, totalElements);
    }
    
    /**
     * Поиск книг с сортировкой по рейтингу и фильтрами
     */
    public Page<Book> searchBooksWithRatingSortAndFilters(String query, int page, int size, String direction, Integer yearFrom, Integer yearTo, String language, double minRating) {
        // Получаем все книги по поисковому запросу без пагинации
        List<Book> allBooks = bookRepository.searchBooksAsList(query);
        
        // Обогащаем книги информацией о рейтинге
        enrichBooksWithRatings(allBooks);
        
        // Применяем фильтры
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Сортируем книги по рейтингу
        Comparator<Book> ratingComparator;
        if ("desc".equalsIgnoreCase(direction)) {
            ratingComparator = Comparator.comparing(Book::getRating, Comparator.reverseOrder())
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0, Comparator.reverseOrder());
        } else {
            ratingComparator = Comparator.comparing(Book::getRating)
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0);
        }
        
        List<Book> sortedBooks = filteredBooks.stream()
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
     * Получает книги по категории с фильтрами
     */
    public Page<Book> getBooksByCategoryWithFilters(Integer categoryId, Pageable pageable, Integer yearFrom, Integer yearTo, String language, double minRating) {
        // Если нет активных фильтров, используем стандартный метод
        if (yearFrom == null && yearTo == null && (language == null || language.trim().isEmpty()) && minRating <= 0) {
            return getBooksByCategory(categoryId, pageable);
        }
        
        // Получаем все книги категории и применяем фильтры
        List<Book> allBooks = bookRepository.findByExactCategoryIdAsList(categoryId);
        enrichBooksWithRatings(allBooks);
        
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Применяем пагинацию вручную
        int totalElements = filteredBooks.size();
        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), totalElements);
        
        List<Book> paginatedBooks = filteredBooks.subList(startIndex, endIndex);
        
        return new PageImpl<>(paginatedBooks, pageable, totalElements);
    }
    
    /**
     * Получает книги по категории с иерархией и фильтрами
     */
    public Page<Book> getBooksByCategoryWithHierarchyAndFilters(Integer categoryId, Pageable pageable, Integer yearFrom, Integer yearTo, String language, double minRating) {
        // Если нет активных фильтров, используем стандартный метод
        if (yearFrom == null && yearTo == null && (language == null || language.trim().isEmpty()) && minRating <= 0) {
            return getBooksByCategoryWithHierarchy(categoryId, pageable);
        }
        
        // Получаем все ID категорий (включая подкатегории)
        List<Integer> allCategoryIds = getAllCategoryIds(categoryId);
        
        // Получаем все книги и применяем фильтры
        List<Book> allBooks = bookRepository.findByCategoryIdInAsList(allCategoryIds);
        enrichBooksWithRatings(allBooks);
        
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Применяем пагинацию вручную
        int totalElements = filteredBooks.size();
        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), totalElements);
        
        List<Book> paginatedBooks = filteredBooks.subList(startIndex, endIndex);
        
        return new PageImpl<>(paginatedBooks, pageable, totalElements);
    }
    
    /**
     * Получает книги по категории с сортировкой по рейтингу и фильтрами
     */
    public Page<Book> getBooksByCategoryWithRatingSortAndFilters(Integer categoryId, int page, int size, String direction, boolean includeSubcategories, Integer yearFrom, Integer yearTo, String language, double minRating) {
        List<Book> allBooks;
        
        if (includeSubcategories) {
            List<Integer> allCategoryIds = getAllCategoryIds(categoryId);
            allBooks = bookRepository.findByCategoryIdInAsList(allCategoryIds);
        } else {
            allBooks = bookRepository.findByExactCategoryIdAsList(categoryId);
        }
        
        // Обогащаем книги информацией о рейтинге
        enrichBooksWithRatings(allBooks);
        
        // Применяем фильтры
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Сортируем книги по рейтингу
        Comparator<Book> ratingComparator;
        if ("desc".equalsIgnoreCase(direction)) {
            ratingComparator = Comparator.comparing(Book::getRating, Comparator.reverseOrder())
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0, Comparator.reverseOrder());
        } else {
            ratingComparator = Comparator.comparing(Book::getRating)
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0);
        }
        
        List<Book> sortedBooks = filteredBooks.stream()
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
     * Получает книги по нескольким категориям с фильтрами
     */
    public Page<Book> getBooksByMultipleCategoriesWithFilters(List<Integer> categoryIds, Pageable pageable, boolean includeSubcategories, Integer yearFrom, Integer yearTo, String language, double minRating) {
        // Если нет активных фильтров, используем стандартный метод
        if (yearFrom == null && yearTo == null && (language == null || language.trim().isEmpty()) && minRating <= 0) {
            return getBooksByMultipleCategories(categoryIds, pageable, includeSubcategories);
        }
        
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Page.empty(pageable);
        }
        
        List<Integer> allCategoryIds = new ArrayList<>();
        
        if (includeSubcategories) {
            // Для каждой родительской категории получаем все подкатегории
            for (Integer categoryId : categoryIds) {
                allCategoryIds.addAll(getAllCategoryIds(categoryId));
            }
        } else {
            // Используем только родительские категории
            allCategoryIds = categoryIds;
        }
        
        // Получаем все книги и применяем фильтры
        List<Book> allBooks = bookRepository.findBooksByMultipleCategoriesAsList(allCategoryIds);
        enrichBooksWithRatings(allBooks);
        
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Применяем пагинацию вручную
        int totalElements = filteredBooks.size();
        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), totalElements);
        
        List<Book> paginatedBooks = filteredBooks.subList(startIndex, endIndex);
        
        return new PageImpl<>(paginatedBooks, pageable, totalElements);
    }
    
    /**
     * Получает книги по нескольким категориям с сортировкой по рейтингу и фильтрами
     */
    public Page<Book> getBooksByMultipleCategoriesWithRatingSortAndFilters(List<Integer> categoryIds, int page, int size, String direction, boolean includeSubcategories, Integer yearFrom, Integer yearTo, String language, double minRating) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Page.empty(PageRequest.of(page, size));
        }
        
        List<Integer> allCategoryIds = new ArrayList<>();
        
        if (includeSubcategories) {
            // Для каждой родительской категории получаем все подкатегории
            for (Integer categoryId : categoryIds) {
                allCategoryIds.addAll(getAllCategoryIds(categoryId));
            }
        } else {
            // Используем только родительские категории
            allCategoryIds = categoryIds;
        }
        
        // Получаем все книги без пагинации
        List<Book> allBooks = bookRepository.findBooksByMultipleCategoriesAsList(allCategoryIds);
        
        // Обогащаем книги информацией о рейтинге
        enrichBooksWithRatings(allBooks);
        
        // Применяем фильтры
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Сортируем книги по рейтингу
        Comparator<Book> ratingComparator;
        if ("desc".equalsIgnoreCase(direction)) {
            ratingComparator = Comparator.comparing(Book::getRating, Comparator.reverseOrder())
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0, Comparator.reverseOrder());
        } else {
            ratingComparator = Comparator.comparing(Book::getRating)
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0);
        }
        
        List<Book> sortedBooks = filteredBooks.stream()
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
     * Получает все книги с сортировкой по рейтингу и фильтрами
     */
    public Page<Book> getAllBooksWithRatingSortAndFilters(int page, int size, String direction, Integer yearFrom, Integer yearTo, String language, double minRating) {
        // Получаем все книги без пагинации
        List<Book> allBooks = bookRepository.findAll();
        
        // Обогащаем книги информацией о рейтинге
        enrichBooksWithRatings(allBooks);
        
        // Применяем фильтры
        List<Book> filteredBooks = applyFilters(allBooks, yearFrom, yearTo, language, minRating);
        
        // Сортируем книги по рейтингу
        Comparator<Book> ratingComparator;
        if ("desc".equalsIgnoreCase(direction)) {
            ratingComparator = Comparator.comparing(Book::getRating, Comparator.reverseOrder())
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0, Comparator.reverseOrder());
        } else {
            ratingComparator = Comparator.comparing(Book::getRating)
                    .thenComparing(book -> book.getRatingsCount() != null ? book.getRatingsCount() : 0);
        }
        
        List<Book> sortedBooks = filteredBooks.stream()
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

import API from './api';
import { mockBooks, getBooksByCategory, searchBooksByQuery, createPagedResponse } from '../mocks/booksData';
import { BookFormat, ReadingProgress } from '../types';

// Интерфейсы
export interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  isbn?: string;
  publicationYear?: number;
  publisher?: string;
  language?: string;
  pageCount?: number;
  fileUrl?: string;
  coverImageUrl?: string;
  uploadDate?: string;
  categories: Category[];
  reviewsCount?: number;
  rating?: number;
  ratingsCount?: number;
}

export interface Review {
  id: number;
  content: string;
  rating: number | null;
  creationDate: string;
  editedDate?: string;
  userId: number;
  userFirstName?: string;
  userLastName?: string;
  userAvatarUrl?: string;
  bookId: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Параметры для запросов
export interface BookSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  query?: string;
  includeSubcategories?: boolean;
}

// Интерфейс для кэшированных рейтингов
interface RatingCacheItem {
  averageRating: number;
  ratingCount: number;
  userRating: number | null;
  timestamp: number;
}

// Кэш для книг
let popularBooksCache: Book[] | null = null;
let popularBooksTimestamp = 0;

// Кэш для рейтингов книг
const ratingsCache: Map<number, RatingCacheItem> = new Map();

// Время жизни кэша в миллисекундах (5 минут)
const CACHE_TTL = 5 * 60 * 1000;
// Время жизни кэша рейтингов (10 минут)
const RATINGS_CACHE_TTL = 10 * 60 * 1000;

// Функция для проверки актуальности кэша
const isValidCache = (timestamp: number, ttl: number = CACHE_TTL): boolean => {
  return Date.now() - timestamp < ttl;
};

// Функция для получения рейтинга из localStorage
const getRatingFromLocalStorage = (bookId: number): { rating: number, timestamp: number } | null => {
  try {
    const ratingKey = `book_${bookId}_rating`;
    const savedRatingData = localStorage.getItem(ratingKey);
    
    if (savedRatingData) {
      const data = JSON.parse(savedRatingData);
      // Проверяем, что данные имеют нужный формат
      if (data && typeof data.rating === 'number' && typeof data.timestamp === 'number') {
        return {
          rating: data.rating,
          timestamp: data.timestamp
        };
      }
    }
  } catch (e) {
    console.error('Ошибка при чтении рейтинга из localStorage:', e);
  }
  return null;
};

// Функция для сохранения рейтинга в localStorage
const saveRatingToLocalStorage = (bookId: number, rating: number): void => {
  try {
    const ratingKey = `book_${bookId}_rating`;
    const data = {
      rating,
      timestamp: Date.now()
    };
    localStorage.setItem(ratingKey, JSON.stringify(data));
  } catch (e) {
    console.error('Ошибка при сохранении рейтинга в localStorage:', e);
  }
};

const bookService = {
  // Проверка актуальности кэша
  isValidCache(timestamp: number): boolean {
    return isValidCache(timestamp);
  },
  
  // Очистка кэша
  clearCache() {
    popularBooksCache = null;
    popularBooksTimestamp = 0;
    ratingsCache.clear();
  },
  
  // Получение всех книг с пагинацией и сортировкой
  async getBooks(params: BookSearchParams = {}): Promise<PagedResponse<Book>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Добавляем параметры пагинации и сортировки
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);
      if (params.query) queryParams.append('query', params.query);
      
      const response = await API.get<PagedResponse<Book>>(`/books?${queryParams.toString()}`);
      
      // Обновляем рейтинги книг в кэше
      this.updateBooksRatingsCache(response.data.content);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении книг, используем мок данные:', error);
      // Возвращаем мок данные при ошибке API
      return createPagedResponse(
        mockBooks,
        params.page || 0,
        params.size || 10
      );
    }
  },
  
  // Поиск книг
  async searchBooks(query: string, params: BookSearchParams = {}): Promise<PagedResponse<Book>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Добавляем параметры пагинации и сортировки
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);
      
      // Добавляем параметр поиска
      queryParams.append('query', query);
      
      const response = await API.get<PagedResponse<Book>>(`/books/search?${queryParams.toString()}`);
      
      // Обновляем рейтинги книг в кэше
      this.updateBooksRatingsCache(response.data.content);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при поиске книг, используем мок данные:', error);
      // Возвращаем фильтрованные мок данные при ошибке API
      const filteredBooks = searchBooksByQuery(query);
      return createPagedResponse(
        filteredBooks,
        params.page || 0,
        params.size || 10
      );
    }
  },
  
  // Получение книги по ID
  async getBookById(id: number): Promise<Book> {
    try {
      const response = await API.get<Book>(`/books/${id}`);
      
      // Обновляем рейтинг книги в кэше
      if (response.data.rating !== undefined) {
        this.updateBookRatingCache(id, {
          averageRating: response.data.rating,
          ratingCount: response.data.ratingsCount || 0,
          userRating: null,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении книги с ID ${id}, используем мок данные:`, error);
      // Ищем книгу в мок данных
      const book = mockBooks.find(book => book.id === id);
      if (book) {
        return book;
      }
      throw new Error(`Книга с ID ${id} не найдена`);
    }
  },
  
  // Получение книг по категории
  async getBooksByCategory(categoryId: number, params: BookSearchParams = {}): Promise<PagedResponse<Book>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Добавляем параметры пагинации и сортировки
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);
      
      // По умолчанию включаем книги из подкатегорий, если не указано иное
      const includeSubcategories = params.includeSubcategories !== undefined ? params.includeSubcategories : true;
      queryParams.append('includeSubcategories', includeSubcategories.toString());
      
      const response = await API.get<PagedResponse<Book>>(`/books/category/${categoryId}?${queryParams.toString()}`);
      
      // Обновляем рейтинги книг в кэше
      this.updateBooksRatingsCache(response.data.content);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении книг для категории ${categoryId}, используем мок данные:`, error);
      // Фильтруем мок данные по категории
      const filteredBooks = getBooksByCategory(categoryId);
      return createPagedResponse(
        filteredBooks,
        params.page || 0,
        params.size || 10
      );
    }
  },
  
  // Получение книг по нескольким категориям
  async getBooksByMultipleCategories(categoryIds: number[], params: BookSearchParams = {}): Promise<PagedResponse<Book>> {
    try {
      if (!categoryIds || categoryIds.length === 0) {
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: params.size || 10,
          number: params.page || 0
        };
      }

      const queryParams = new URLSearchParams();
      
      // Добавляем параметры пагинации и сортировки
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);
      
      // Добавляем ID категорий как отдельные параметры
      categoryIds.forEach(id => queryParams.append('categoryIds', id.toString()));
      
      // По умолчанию включаем подкатегории для мультифильтра
      const includeSubcategories = params.includeSubcategories !== undefined ? params.includeSubcategories : true;
      queryParams.append('includeSubcategories', includeSubcategories.toString());
      
      const url = `/books/categories?${queryParams.toString()}`;
      
      const response = await API.get<PagedResponse<Book>>(url);
      
      // Обновляем рейтинги книг в кэше
      this.updateBooksRatingsCache(response.data.content);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении книг для категорий ${categoryIds.join(', ')}, используем мок данные:`, error);
      // Возвращаем пустой результат при ошибке с мультикатегориями
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: params.size || 10,
        number: params.page || 0
      };
    }
  },
  
  // Получение популярных книг
  async getPopularBooks(limit: number = 10): Promise<Book[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      if (popularBooksCache && this.isValidCache(popularBooksTimestamp)) {
        console.log('Используем кэшированные данные для популярных книг');
        return popularBooksCache.slice(0, limit);
      }
      
      const response = await API.get<Book[]>(`/books/popular?limit=${limit}`);
      
      // Обновляем кэш и временную метку
      popularBooksCache = response.data;
      popularBooksTimestamp = Date.now();
      
      // Обновляем рейтинги книг в кэше
      this.updateBooksRatingsCache(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении популярных книг:', error);
      throw error;
    }
  },
  
  // Получение последних добавленных книг
  async getLatestBooks(limit: number = 6): Promise<Book[]> {
    try {
      const params = new URLSearchParams();
      params.append('page', '0');
      params.append('size', limit.toString());
      params.append('sortBy', 'uploadDate');
      params.append('direction', 'desc');
      
      const response = await API.get<PagedResponse<Book>>(`/books?${params.toString()}`);
      
      // Обновляем рейтинги книг в кэше
      this.updateBooksRatingsCache(response.data.content);
      
      return response.data.content;
    } catch (error) {
      console.error('Ошибка при получении новых поступлений:', error);
      // Возвращаем мок-данные при ошибке
      return mockBooks.slice(0, limit);
    }
  },
  
  // Получение случайных книг для рекомендаций
  async getRandomBooks(limit: number = 5): Promise<Book[]> {
    const response = await API.get<Book[]>(`/books/random?limit=${limit}`);
    
    // Обновляем рейтинги книг в кэше
    this.updateBooksRatingsCache(response.data);
    
    return response.data;
  },
  
  // Создание новой книги (только для администраторов)
  async createBook(bookData: Partial<Book>, categoryIds?: number[]): Promise<Book> {
    let url = '/books';
    
    // Если переданы ID категорий, добавляем их в параметры запроса
    if (categoryIds && categoryIds.length > 0) {
      const categoryParams = categoryIds.map(id => `categoryIds=${id}`).join('&');
      url += `?${categoryParams}`;
    }
    
    const response = await API.post<Book>(url, bookData);
    return response.data;
  },
  
  // Обновление книги (только для администраторов)
  async updateBook(id: number, bookData: Partial<Book>, categoryIds?: number[]): Promise<Book> {
    let url = `/books/${id}`;
    
    // Если переданы ID категорий, добавляем их в параметры запроса
    if (categoryIds && categoryIds.length > 0) {
      const categoryParams = categoryIds.map(id => `categoryIds=${id}`).join('&');
      url += `?${categoryParams}`;
    }
    
    const response = await API.put<Book>(url, bookData);
    return response.data;
  },
  
  // Удаление книги (только для администраторов)
  async deleteBook(id: number): Promise<void> {
    await API.delete(`/books/${id}`);
  },
  
  // Загрузка файла книги (только для администраторов)
  async uploadBookFile(bookId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await API.post<{fileUrl: string}>(`/books/${bookId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.fileUrl;
  },
  
  // Загрузка обложки книги (только для администраторов)
  async uploadBookCover(bookId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await API.post<{coverUrl: string}>(`/books/${bookId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.coverUrl;
  },
  
  // Получение отзывов книги
  async getBookReviews(bookId: number): Promise<Review[]> {
    try {
      const response = await API.get<Review[]>(`/books/${bookId}/reviews`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении отзывов для книги ${bookId}:`, error);
      return [];
    }
  },
  
  // Добавление нового отзыва или обновление существующего
  async addReview(bookId: number, content: string, rating: number | null = null, reviewId?: number): Promise<Review> {
    const response = await API.post<Review>(`/books/${bookId}/review`, {
      content,
      rating,
      reviewId
    });
    
    // Если рейтинг был изменен, инвалидируем кэш рейтинга для этой книги
    if (rating !== null) {
      ratingsCache.delete(bookId);
    }
    
    return response.data;
  },
  
  // Получение всех отзывов текущего пользователя для книги
  async getUserReviewsForBook(bookId: number): Promise<Review[]> {
    try {
      const response = await API.get<Review[]>(`/books/${bookId}/user-reviews`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении отзывов пользователя для книги ${bookId}:`, error);
      return [];
    }
  },
  
  // Обновление существующего отзыва
  async updateReview(reviewId: number, content: string, rating: number | null = null): Promise<Review> {
    const response = await API.put<Review>(`/reviews/${reviewId}`, {
      content,
      rating
    });
    
    // Если рейтинг был изменен, инвалидируем кэш рейтинга для этой книги
    if (rating !== null && response.data.bookId) {
      ratingsCache.delete(response.data.bookId);
    }
    
    return response.data;
  },
  
  // Удаление отзыва
  async deleteReview(reviewId: number): Promise<void> {
    await API.delete(`/reviews/${reviewId}`);
  },
  
  // Оценка книги (без отзыва)
  async rateBook(bookId: number, rating: number): Promise<{ averageRating: number, ratingCount: number }> {
    try {
      const response = await API.post<{ averageRating: number, ratingCount: number }>(`/books/${bookId}/rating`, {
        rating
      });
      
      // Сохраняем рейтинг в localStorage независимо от кэширования
      saveRatingToLocalStorage(bookId, rating);
      
      // Обновляем кэш рейтинга для этой книги
      this.updateBookRatingCache(bookId, {
        averageRating: response.data.averageRating,
        ratingCount: response.data.ratingCount,
        userRating: rating,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      // Если API не доступен, все равно сохраняем рейтинг пользователя локально
      console.error('Ошибка при оценке книги:', error);
      saveRatingToLocalStorage(bookId, rating);
      throw error;
    }
  },
  
  // Получение рейтинга книги
  async getBookRating(bookId: number, refresh: boolean = false): Promise<{ 
    averageRating: number, 
    ratingCount: number,
    userRating: number | null
  }> {
    // Получаем сохраненный пользовательский рейтинг из localStorage
    const localRating = getRatingFromLocalStorage(bookId);
    const hasLocalRating = localRating !== null;
    
    // Проверяем кэш рейтингов в памяти, если не требуется обновление
    if (!refresh) {
      const cachedRating = ratingsCache.get(bookId);
      if (cachedRating && isValidCache(cachedRating.timestamp, RATINGS_CACHE_TTL)) {
        // Если у нас есть рейтинг в localStorage, и он отличается от кэшированного
        if (hasLocalRating && cachedRating.userRating !== localRating.rating) {
          console.log('Используем рейтинг из localStorage вместо кэша:', localRating.rating);
          return {
            averageRating: cachedRating.averageRating,
            ratingCount: cachedRating.ratingCount,
            userRating: localRating.rating
          };
        }
        
        return {
          averageRating: cachedRating.averageRating,
          ratingCount: cachedRating.ratingCount,
          userRating: cachedRating.userRating
        };
      }
    }
    
    try {
      // Формируем URL с учетом необходимости принудительного обновления
      const url = refresh ? 
        `/books/${bookId}/rating?refresh=true` : 
        `/books/${bookId}/rating`;
        
      const response = await API.get<{ 
        averageRating: number, 
        ratingCount: number,
        userRating: number | null
      }>(url);
      
      const responseData = response.data;
      
      // Если данные некорректны, пробуем запросить с refresh=true
      if (!refresh && responseData.averageRating === 0 && responseData.ratingCount > 0) {
        console.log('Обнаружено несоответствие данных. Запрашиваем с refresh=true');
        return this.getBookRating(bookId, true);
      }
      
      // Если есть сохраненный рейтинг в localStorage и он отличается от серверного,
      // приоритет отдаем локальному, так как он был задан пользователем последним
      if (hasLocalRating && responseData.userRating !== localRating.rating) {
        console.log(`Используем рейтинг из localStorage (${localRating.rating}) вместо API (${responseData.userRating})`);
        
        // Асинхронно обновляем рейтинг на сервере, чтобы синхронизировать данные
        this.syncRatingWithServer(bookId, localRating.rating);
        
        // Обновляем данные ответа локальным рейтингом
        responseData.userRating = localRating.rating;
      }
      
      // Сохраняем рейтинг в кэш
      this.updateBookRatingCache(bookId, {
        averageRating: responseData.averageRating,
        ratingCount: responseData.ratingCount,
        userRating: responseData.userRating,
        timestamp: Date.now()
      });
      
      return responseData;
    } catch (error) {
      console.error(`Ошибка при получении рейтинга для книги ${bookId}:`, error);
      
      // Если у нас есть локально сохраненный рейтинг, используем его
      if (hasLocalRating) {
        console.log('При ошибке API используем рейтинг из localStorage:', localRating.rating);
        return {
          averageRating: 0,
          ratingCount: 0,
          userRating: localRating.rating
        };
      }
      
      // Если нет ни кэша, ни локального рейтинга, возвращаем нули
      return {
        averageRating: 0,
        ratingCount: 0,
        userRating: null
      };
    }
  },
  
  // Метод для асинхронной синхронизации рейтинга с сервером
  async syncRatingWithServer(bookId: number, rating: number): Promise<void> {
    try {
      await API.post(`/books/${bookId}/rating`, { rating });
      console.log('Рейтинг успешно синхронизирован с сервером');
    } catch (error) {
      console.error('Ошибка при синхронизации рейтинга с сервером:', error);
    }
  },
  
  // Получение рейтинга книги из кэша (без запроса к API)
  getBookRatingFromCache(bookId: number): { 
    averageRating: number, 
    ratingCount: number,
    userRating: number | null
  } | null {
    // Проверяем кэш рейтингов
    const cachedRating = ratingsCache.get(bookId);
    if (cachedRating && isValidCache(cachedRating.timestamp, RATINGS_CACHE_TTL)) {
      return {
        averageRating: cachedRating.averageRating,
        ratingCount: cachedRating.ratingCount,
        userRating: cachedRating.userRating
      };
    }
    
    // Проверяем localStorage
    const localRating = getRatingFromLocalStorage(bookId);
    if (localRating && isValidCache(localRating.timestamp)) {
      return {
        averageRating: 0, // Не знаем средний рейтинг
        ratingCount: 0,   // Не знаем количество оценок
        userRating: localRating.rating
      };
    }
    
    return null;
  },
  
  // Обновление кэша рейтинга для одной книги
  updateBookRatingCache(bookId: number, ratingData: RatingCacheItem, skipEvent: boolean = false): void {
    ratingsCache.set(bookId, ratingData);
    
    // Отправляем событие об обновлении рейтинга, независимо от флага skipEvent
    // Это обеспечит обновление всех компонентов, отображающих рейтинг
      const ratingUpdateEvent = new CustomEvent('book-rating-updated', {
        detail: {
          bookId,
          rating: ratingData.averageRating,
          userRating: ratingData.userRating,
          ratingCount: ratingData.ratingCount
        },
        bubbles: true
      });
      document.dispatchEvent(ratingUpdateEvent);
  },
  
  // Обновление кэша рейтингов для списка книг
  updateBooksRatingsCache(books: Book[]): void {
    books.forEach(book => {
      if (book.rating !== undefined) {
        // Проверяем, есть ли уже этот рейтинг в кэше
        const existingRating = ratingsCache.get(book.id);
        if (!existingRating || !isValidCache(existingRating.timestamp, RATINGS_CACHE_TTL)) {
          // Если рейтинга нет в кэше или он устарел, обновляем
          this.updateBookRatingCache(book.id, {
            averageRating: book.rating,
            ratingCount: book.ratingsCount || 0,
            userRating: existingRating?.userRating || null,
            timestamp: Date.now()
          });
        }
      }
    });
  },
  
  // Удаление рейтинга книги из кэша
  removeBookRating(bookId: number, skipEvent: boolean = false): void {
    // Удаляем из localStorage
    try {
      const ratingKey = `book_${bookId}_rating`;
      localStorage.removeItem(ratingKey);
    } catch (e) {
      console.error('Ошибка при удалении рейтинга из localStorage:', e);
    }
    
    // Инвалидируем кэш в памяти
    ratingsCache.delete(bookId);
    
    // Отправляем событие для всех компонентов, независимо от флага skipEvent
      const ratingUpdateEvent = new CustomEvent('book-rating-updated', {
        detail: {
          bookId,
          rating: 0,
          userRating: null,
          ratingCount: 0
        },
        bubbles: true
      });
      document.dispatchEvent(ratingUpdateEvent);
  },
  
  // Получение подсказок для поиска
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    try {
      // API-запрос может быть слишком тяжелым для подсказок, поэтому используем имитацию
      // в реальном проекте здесь должен быть запрос к API
      const params = new URLSearchParams();
      params.append('query', query);
      params.append('page', '0');
      params.append('size', limit.toString());
      
      const response = await API.get<PagedResponse<Book>>(`/books/search?${params.toString()}`);
      
      // Извлекаем только заголовки и авторов для подсказок
      const suggestions = response.data.content.map(book => book.title);
      const authorSuggestions = response.data.content
        .map(book => book.author)
        .filter((author, index, self) => self.indexOf(author) === index); // Убираем дубликаты
      
      // Объединяем подсказки по заголовкам и авторам
      return [...suggestions, ...authorSuggestions].slice(0, limit);
    } catch (error) {
      console.error('Ошибка при получении подсказок для поиска:', error);
      // Используем мок-данные при ошибке
      return mockBooks
        .filter(book => 
          book.title.toLowerCase().includes(query.toLowerCase()) || 
          book.author.toLowerCase().includes(query.toLowerCase())
        )
        .map(book => book.title)
        .slice(0, limit);
    }
  },
  
  // Получение статистики
  async getStats(): Promise<{ totalBooks: number; totalAuthors: number; totalGenres: number; readCount: number }> {
    try {
      const response = await API.get<{ totalBooks: number; totalAuthors: number; totalGenres: number; readCount: number }>('/books/stats');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении статистики, возвращаем моковые данные:', error);
      // Импортируем мок статистики из catalog-data.ts
      const { mockCatalogStats } = await import('../mocks/catalog-data');
      return mockCatalogStats;
    }
  },
  
  // Получение файла книги по URL - для локального просмотра
  async getBookFileUrl(bookId: number): Promise<string> {
    try {
      // Пытаемся использовать новый endpoint для получения URL файла
      try {
        // Определяем расширение файла для передачи на сервер
        let extension = '';
        
        // Пытаемся получить расширение из информации о книге
        try {
          const book = await this.getBookById(bookId);
          if (book && book.fileUrl) {
            const ext = this.getFileExtension(book.fileUrl);
            if (ext) {
              extension = ext;
              // Также сохраняем формат в localStorage, чтобы использовать его в дальнейшем
              this.saveBookFormatToLocalStorage(bookId, this.extensionToFormat(extension));
            }
          }
        } catch (e) {
          console.warn('Не удалось получить информацию о книге для определения расширения:', e);
        }
        
        // Используем новый endpoint для получения URL
        const response = await API.get<string>(`/books/${bookId}/file-url${extension ? `?ext=${extension}` : ''}`);
        
        if (response.data) {
          // Возвращаем абсолютный URL, добавляя baseURL если нужно
          const fileUrl = response.data;
          
          // Если URL уже полный, возвращаем как есть
          if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            return fileUrl;
          } 
          
          // Иначе добавляем baseURL без дублирования /api
          const baseURL = API.defaults.baseURL || '';
          // Убираем завершающий / из baseURL если он есть
          const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
          
          // Если fileUrl начинается с /api/, убираем этот префикс чтобы избежать дублирования
          const cleanFileUrl = fileUrl.startsWith('/api/') ? fileUrl.substring(4) : 
                             fileUrl.startsWith('api/') ? fileUrl.substring(3) : 
                             fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
                             
          return `${cleanBaseURL}${cleanFileUrl}`;
        }
      } catch (apiError) {
        console.warn('Не удалось получить URL файла книги через API, используем прямой URL:', apiError);
      }
      
      // Формируем URL напрямую, как запасной вариант
      let baseUrl = API.defaults.baseURL || '';
      // Убираем завершающий / из baseUrl если он есть
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      // Убираем дублирование /api в пути
      let url;
      if (baseUrl.endsWith('/api')) {
        url = `${baseUrl}/books/${bookId}/file`;
      } else {
        url = `${baseUrl}/api/books/${bookId}/file`;
      }
      
      // Пытаемся получить информацию о книге для добавления расширения
      try {
        const book = await this.getBookById(bookId);
        if (book && book.fileUrl) {
          const extension = this.getFileExtension(book.fileUrl);
          if (extension) {
            // Сохраняем формат в localStorage
            this.saveBookFormatToLocalStorage(bookId, this.extensionToFormat(extension));
            url += `?ext=${extension}`;
          }
        }
      } catch (e) {
        console.warn('Не удалось получить информацию о книге для определения расширения:', e);
      }
      
      return url;
    } catch (error) {
      console.error(`Ошибка при получении URL файла книги ${bookId}:`, error);
      throw new Error(`Не удалось получить URL файла книги с ID ${bookId}`);
    }
  },
  
  // Преобразование расширения файла в формат книги
  extensionToFormat(extension: string): BookFormat {
    const ext = extension.toLowerCase();
    if (ext === 'pdf') return BookFormat.PDF;
    if (ext === 'epub') return BookFormat.EPUB;
    if (ext === 'fb2') return BookFormat.FB2;
    return BookFormat.UNKNOWN;
  },
  
  // Сохранение формата книги в localStorage
  saveBookFormatToLocalStorage(bookId: number, format: BookFormat): void {
    try {
      if (format !== BookFormat.UNKNOWN) {
        localStorage.setItem(`book_${bookId}_format`, format);
      }
    } catch (e) {
      console.error('Ошибка при сохранении формата книги в localStorage:', e);
    }
  },
  
  // Получение формата книги из localStorage
  getBookFormatFromLocalStorage(bookId: number): BookFormat | null {
    try {
      const format = localStorage.getItem(`book_${bookId}_format`);
      if (format) {
        return format as BookFormat;
      }
    } catch (e) {
      console.error('Ошибка при получении формата книги из localStorage:', e);
    }
    return null;
  },
  
  // Сохранение прогресса чтения книги в localStorage
  saveReadingProgress(progress: ReadingProgress): void {
    try {
      const { bookId } = progress;
      const progressKey = `reading_progress_${bookId}`;
      localStorage.setItem(progressKey, JSON.stringify({
        ...progress,
        lastReadDate: new Date().toISOString()
      }));
      
      // Отправка прогресса на сервер, если пользователь авторизован
      this.syncReadingProgress(progress).catch(error => {
        console.error('Ошибка синхронизации прогресса чтения:', error);
      });
    } catch (error) {
      console.error('Ошибка при сохранении прогресса чтения:', error);
    }
  },
  
  // Получение прогресса чтения из localStorage
  getReadingProgress(bookId: number): ReadingProgress | null {
    try {
      const progressKey = `reading_progress_${bookId}`;
      const savedProgress = localStorage.getItem(progressKey);
      
      if (savedProgress) {
        return JSON.parse(savedProgress);
      }
    } catch (error) {
      console.error('Ошибка при получении прогресса чтения:', error);
    }
    return null;
  },
  
  // Синхронизация прогресса чтения с сервером
  async syncReadingProgress(progress: ReadingProgress): Promise<void> {
    const token = localStorage.getItem('token');
    
    // Синхронизируем только для авторизованных пользователей
    if (token) {
      try {
        await API.post(`/users/reading-history/${progress.bookId}`, null, {
          params: {
          lastReadPage: progress.currentPage,
          isCompleted: progress.currentPage >= progress.totalPages
          }
        });
      } catch (error) {
        console.error('Ошибка синхронизации прогресса с сервером:', error);
      }
    }
  },

  // Метод для получения избранных книг пользователя
  async getUserFavoriteBooks(): Promise<Book[]> {
    try {
      const response = await API.get<Book[]>('/users/favorites');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении избранных книг:', error);
      return [];
    }
  },

  // Метод для добавления книги в избранное
  async addToFavorites(bookId: number): Promise<void> {
    try {
      await API.post(`/users/favorites/${bookId}`);
    } catch (error) {
      console.error(`Ошибка при добавлении книги ${bookId} в избранное:`, error);
      throw new Error('Не удалось добавить книгу в избранное');
    }
  },

  // Метод для удаления книги из избранного
  async removeFromFavorites(bookId: number): Promise<void> {
    try {
      await API.delete(`/users/favorites/${bookId}`);
    } catch (error) {
      console.error(`Ошибка при удалении книги ${bookId} из избранного:`, error);
      throw new Error('Не удалось удалить книгу из избранного');
    }
  },

  // Проверка, находится ли книга в избранном
  async isBookInFavorites(bookId: number): Promise<boolean> {
    try {
      const favorites = await this.getUserFavoriteBooks();
      return favorites.some(book => book.id === bookId);
    } catch (error) {
      console.error(`Ошибка при проверке статуса избранного для книги ${bookId}:`, error);
      return false;
    }
  },

  // Определение формата книги по расширению файла или Content-Type
  getBookFormat(fileUrl: string | undefined): BookFormat {
    if (!fileUrl) return BookFormat.UNKNOWN;
    
    const lowerUrl = fileUrl.toLowerCase();
    
    // Определение по расширению в URL
    if (lowerUrl.endsWith('.pdf')) {
      return BookFormat.PDF;
    } else if (lowerUrl.endsWith('.epub')) {
      return BookFormat.EPUB;
    } else if (lowerUrl.endsWith('.fb2') || lowerUrl.endsWith('.fb2.zip')) {
      return BookFormat.FB2;
    }
    
    // Проверка на наличие маркеров в URL
    if (lowerUrl.includes('pdf')) {
      return BookFormat.PDF;
    } else if (lowerUrl.includes('epub')) {
      return BookFormat.EPUB;
    } else if (lowerUrl.includes('fb2') || lowerUrl.includes('xml')) {
      return BookFormat.FB2;
    }
    
    // Проверка параметра ext в URL
    try {
      const urlObj = new URL(lowerUrl, window.location.origin);
      const ext = urlObj.searchParams.get('ext');
      if (ext) {
        return this.extensionToFormat(ext);
      }
      
      // Проверка на наличие параметра format в URL
      const format = urlObj.searchParams.get('format');
      if (format) {
        return this.extensionToFormat(format);
      }
    } catch (e) {
      console.error('Ошибка при парсинге URL:', e);
    }
    
    // Если не удалось определить по URL, будем загружать заголовки файла
    // при использовании в ReaderSelector
    return BookFormat.UNKNOWN;
  },

  // Получение расширения файла из URL
  getFileExtension(url: string): string | null {
    if (!url) return null;
    const match = url.toLowerCase().match(/\.([a-z0-9]+)(\?|$)/);
    return match ? match[1] : null;
  },
};

export default bookService; 
import API from './api';
import { mockBooks, getBooksByCategory, searchBooksByQuery, createPagedResponse } from '../mocks/booksData';

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
}

// Кэш для книг
let popularBooksCache: Book[] | null = null;
let popularBooksTimestamp = 0;

// Время жизни кэша в миллисекундах (5 минут)
const CACHE_TTL = 5 * 60 * 1000;

const bookService = {
  // Проверка актуальности кэша
  isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL;
  },
  
  // Очистка кэша
  clearCache() {
    popularBooksCache = null;
    popularBooksTimestamp = 0;
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
      
      const response = await API.get<PagedResponse<Book>>(`/books/category/${categoryId}?${queryParams.toString()}`);
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
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении популярных книг:', error);
      throw error;
    }
  },
  
  // Получение случайных книг для рекомендаций
  async getRandomBooks(limit: number = 5): Promise<Book[]> {
    const response = await API.get<Book[]>(`/books/random?limit=${limit}`);
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
  }
};

export default bookService; 
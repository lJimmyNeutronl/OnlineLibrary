import { axios } from '../../shared/api';
import { Book, BookSearchParams, BookSearchResult, Category, Author } from './types';

// URL для API книг
const BOOKS_URL = '/books';
const CATEGORIES_URL = '/categories';
const AUTHORS_URL = '/authors';

/**
 * Получить список книг с параметрами поиска
 * @param params Параметры поиска
 */
export const getBooks = async (params?: BookSearchParams): Promise<BookSearchResult> => {
  const response = await axios.get(BOOKS_URL, { params });
  return response.data;
};

/**
 * Получить книгу по ID
 * @param id ID книги
 */
export const getBookById = async (id: number): Promise<Book> => {
  const response = await axios.get(`${BOOKS_URL}/${id}`);
  return response.data;
};

/**
 * Получить книги по категории
 * @param categoryId ID категории
 * @param params Дополнительные параметры
 */
export const getBooksByCategory = async (categoryId: number, params?: BookSearchParams): Promise<BookSearchResult> => {
  const response = await axios.get(`${CATEGORIES_URL}/${categoryId}/books`, { params });
  return response.data;
};

/**
 * Получить книги по автору
 * @param authorId ID автора
 * @param params Дополнительные параметры
 */
export const getBooksByAuthor = async (authorId: number, params?: BookSearchParams): Promise<BookSearchResult> => {
  const response = await axios.get(`${AUTHORS_URL}/${authorId}/books`, { params });
  return response.data;
};

/**
 * Получить список категорий
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get(CATEGORIES_URL);
  return response.data;
};

/**
 * Получить список авторов
 */
export const getAuthors = async (): Promise<Author[]> => {
  const response = await axios.get(AUTHORS_URL);
  return response.data;
}; 
/**
 * Типы для функционала книг
 */

/**
 * Категория книги
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
}

/**
 * Автор книги
 */
export interface Author {
  id: number;
  name: string;
  biography?: string;
}

/**
 * Книга
 */
export interface Book {
  id: number;
  title: string;
  description: string;
  coverUrl?: string;
  fileUrl?: string;
  publicationYear?: number;
  pages?: number;
  isbn?: string;
  language?: string;
  authors: Author[];
  categories: Category[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Параметры для поиска книг
 */
export interface BookSearchParams {
  query?: string;
  categoryId?: number;
  authorId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Результат поиска книг с пагинацией
 */
export interface BookSearchResult {
  content: Book[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
} 
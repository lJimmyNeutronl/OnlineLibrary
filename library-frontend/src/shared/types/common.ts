/**
 * Тип для обработчика изменения значения в формах
 */
export type ChangeHandler = (value: string | number | boolean) => void;

/**
 * Тип для объекта с динамическими ключами и строковыми значениями
 */
export type StringRecord = Record<string, string>;

/**
 * Интерфейс для компонентов, которым требуется идентификатор
 */
export interface WithId {
  id: number | string;
}

/**
 * Статус загрузки данных
 */
export enum LoadingStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

/**
 * Статус загрузки с данными и ошибкой
 */
export interface AsyncState<T> {
  data: T | null;
  status: LoadingStatus;
  error: string | null;
}

/**
 * Создает начальное состояние для асинхронных данных
 */
export const createInitialAsyncState = <T>(): AsyncState<T> => ({
  data: null,
  status: LoadingStatus.IDLE,
  error: null
});

// Описание общей сущности книги
export interface Book {
  id: number;
  title: string;
  author: Author;
  publishYear: number;
  publisher: string;
  isbn: string;
  pageCount: number;
  coverImage?: string;
  description?: string;
  genres?: Genre[];
  rating?: number;
}

// Автор книги
export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  biography?: string;
  photoUrl?: string;
}

// Жанр книги
export interface Genre {
  id: number;
  name: string;
}

// Информация о пользователе
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles: UserRole[];
}

// Роль пользователя
export type UserRole = 'USER' | 'ADMIN' | 'LIBRARIAN';

// Статус книги в библиотеке
export type BookStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'PROCESSING' | 'UNAVAILABLE';

// Информация о взятой книге
export interface Borrowing {
  id: number;
  book: Book;
  user: User;
  borrowDate: string; // ISO-дата
  dueDate: string; // ISO-дата
  returnDate?: string; // ISO-дата
  status: BorrowingStatus;
}

// Статус взятия книги
export type BorrowingStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';

// Отзыв о книге
export interface Review {
  id: number;
  book: Book;
  user: User;
  rating: number;
  comment?: string;
  createdAt: string; // ISO-дата
  updatedAt?: string; // ISO-дата
} 
/**
 * Типы для функционала профиля пользователя
 */

import { Book } from '../books/types';

/**
 * Предпочтения пользователя
 */
export interface UserPreferences {
  favoriteGenres?: string[];
  readingMode?: 'day' | 'night';
  fontSize?: number;
}

/**
 * История прочтения
 */
export interface ReadingHistory {
  id: number;
  bookId: number;
  book?: Book;
  userId: number;
  lastPage: number;
  readPercentage: number;
  lastReadDate: string;
}

/**
 * Закладка
 */
export interface Bookmark {
  id: number;
  bookId: number;
  book?: Book;
  userId: number;
  page: number;
  name: string;
  createdAt: string;
}

/**
 * Избранная книга
 */
export interface FavoriteBook {
  id: number;
  bookId: number;
  book?: Book;
  userId: number;
  addedAt: string;
}

/**
 * Детальная информация о профиле пользователя
 */
export interface UserProfile {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
  readingHistory: ReadingHistory[];
  bookmarks: Bookmark[];
  favoriteBooks: FavoriteBook[];
}

/**
 * Обновление профиля пользователя
 */
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
}

/**
 * Добавление книги в избранное
 */
export interface AddFavoriteBookData {
  bookId: number;
}

/**
 * Добавление закладки
 */
export interface AddBookmarkData {
  bookId: number;
  page: number;
  name: string;
} 
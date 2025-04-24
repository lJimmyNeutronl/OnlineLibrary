// URL API сервера
export const API_URL = 'http://localhost:3001/api';

// Токен авторизации
export const TOKEN_KEY = 'token';

// Роли пользователей
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  LIBRARIAN = 'librarian'
}

// Константы для пагинации
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Статусы книг
export enum BookStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed'
}

// Максимальная длина описания книги в карточке
export const MAX_DESCRIPTION_LENGTH = 150; 
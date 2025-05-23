export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  registrationDate: string;
  lastLoginDate: string;
  roles: string[];
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  fileUrl: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface ReadingHistory {
  id: number;
  userId: number;
  bookId: number;
  book: Book;
  lastPage: number;
  lastReadAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  bookId: number;
  book: Book;
  addedAt: string;
} 

export interface BookSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  query?: string;
  includeSubcategories?: boolean;
} 

// Перечисление поддерживаемых форматов книг
export enum BookFormat {
  PDF = 'pdf',
  EPUB = 'epub',
  FB2 = 'fb2',
  UNKNOWN = 'unknown'
}

// Интерфейс для прогресса чтения
export interface ReadingProgress {
  bookId: number;
  currentPage: number;
  totalPages: number;
  lastReadDate: string;
  format: BookFormat;
} 
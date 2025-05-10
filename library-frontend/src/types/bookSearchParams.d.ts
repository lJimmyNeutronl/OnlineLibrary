/**
 * Параметры поиска книг
 */
export interface BookSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  query?: string;
  includeSubcategories?: boolean;
} 
/**
 * Базовый интерфейс для ответа API с пагинацией
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Параметры для запросов с пагинацией
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

/**
 * Базовый ответ для успешных операций
 */
export interface SuccessResponse {
  message: string;
  success: boolean;
}

/**
 * Параметры для фильтрации данных
 */
export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Объединенный тип для параметров запросов с пагинацией и фильтрацией
 */
export type QueryParams = PaginationParams & FilterParams;

// Общие типы для пагинации
export interface PaginationInfo {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// Общий тип для страничных ответов
export interface PagedData<T> {
  content: T[];
  pagination: PaginationInfo;
}

// Общий тип для поиска с пагинацией
export interface SearchOptions {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  query?: string;
}

// Базовый интерфейс для API ответов
export interface ApiBaseResponse {
  message?: string;
}

// Интерфейс для успешных ответов
export interface ApiSuccessResponse<T = any> extends ApiBaseResponse {
  data: T;
}

// Интерфейс для ошибочных ответов
export interface ApiErrorResponse extends ApiBaseResponse {
  code: string;
  errors?: Record<string, string[]>;
} 
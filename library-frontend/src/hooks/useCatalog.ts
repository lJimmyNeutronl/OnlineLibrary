import { useState, useEffect, useCallback } from 'react';
import bookService, { Book, PagedResponse } from '../services/bookService';
import { CatalogFiltersState } from './useCatalogFilters';

export interface CatalogState {
  books: Book[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
}

export const useCatalog = (filters: CatalogFiltersState) => {
  const [state, setState] = useState<CatalogState>({
    books: [],
    loading: true,
    error: null,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchBooks = useCallback(async (params: CatalogFiltersState) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response: PagedResponse<Book>;
      
      const baseParams = {
        page: params.page,
        size: params.size,
        sortBy: params.sortBy,
        direction: params.direction,
        yearFrom: params.yearFrom,
        yearTo: params.yearTo,
        language: params.language,
        minRating: params.minRating,
      };

      // Приоритет логики:
      // 1. Если есть поисковый запрос - используем поиск
      // 2. Если есть фильтр по категориям - используем фильтрацию по категориям
      // 3. Иначе получаем все книги
      
      if (params.search.trim()) {
        // Поиск книг
        response = await bookService.searchBooks(params.search, baseParams);
      } else if (params.categoryIds.length > 0) {
        // Фильтрация по категориям - включаем подкатегории для полного охвата
        response = await bookService.getBooksByMultipleCategories(params.categoryIds, {
          ...baseParams,
          includeSubcategories: true // Включаем подкатегории для корректного подсчета
        });
      } else {
        // Все книги
        response = await bookService.getBooks(baseParams);
      }

      // Теперь все фильтры применяются на сервере, поэтому используем данные как есть
      setState({
        books: response.content,
        loading: false,
        error: null,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Не удалось загрузить книги. Попробуйте позже.',
      }));
    }
  }, []);

  useEffect(() => {
    fetchBooks(filters);
  }, [filters, fetchBooks]);

  const refetch = useCallback(() => {
    fetchBooks(filters);
  }, [filters, fetchBooks]);

  return {
    ...state,
    refetch,
  };
}; 
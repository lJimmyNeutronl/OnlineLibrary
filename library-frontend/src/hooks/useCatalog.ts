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

      // Если есть поисковый запрос, используем поиск
      if (params.search.trim()) {
        response = await bookService.searchBooks(params.search, {
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          direction: params.direction,
        });
      } else {
        // Иначе получаем все книги
        response = await bookService.getBooks({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          direction: params.direction,
        });
      }

      // Фильтруем результаты на клиенте (для тех фильтров, которые не поддерживает API)
      let filteredBooks = response.content;

      // Фильтр по категориям
      if (params.categoryIds.length > 0) {
        filteredBooks = filteredBooks.filter(book =>
          book.categories?.some(category => params.categoryIds.includes(category.id))
        );
      }

      // Фильтр по году издания
      if (params.yearFrom > 1900 || params.yearTo < new Date().getFullYear()) {
        filteredBooks = filteredBooks.filter(book => {
          const year = book.publicationYear;
          if (!year) return false;
          return year >= params.yearFrom && year <= params.yearTo;
        });
      }

      // Фильтр по языку
      if (params.language) {
        filteredBooks = filteredBooks.filter(book =>
          book.language?.toLowerCase() === params.language.toLowerCase()
        );
      }

      // Фильтр по рейтингу
      if (params.minRating > 0) {
        filteredBooks = filteredBooks.filter(book =>
          (book.rating || 0) >= params.minRating
        );
      }

      setState({
        books: filteredBooks,
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
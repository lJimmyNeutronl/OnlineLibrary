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

      // Применяем дополнительные фильтры на клиенте только для тех параметров, 
      // которые еще не поддерживаются API (НЕ для категорий!)
      let filteredBooks = response.content;
      let needsClientPagination = false;

      // Фильтр по году издания
      if (params.yearFrom > 1900 || params.yearTo < new Date().getFullYear()) {
        filteredBooks = filteredBooks.filter(book => {
          const year = book.publicationYear;
          if (!year) return false;
          return year >= params.yearFrom && year <= params.yearTo;
        });
        needsClientPagination = true;
      }

      // Фильтр по языку
      if (params.language) {
        filteredBooks = filteredBooks.filter(book =>
          book.language?.toLowerCase() === params.language.toLowerCase()
        );
        needsClientPagination = true;
      }

      // Фильтр по рейтингу
      if (params.minRating > 0) {
        filteredBooks = filteredBooks.filter(book =>
          (book.rating || 0) >= params.minRating
        );
        needsClientPagination = true;
      }

      // Если применялись клиентские фильтры, пересчитываем пагинацию
      if (needsClientPagination && filteredBooks.length !== response.content.length) {
        // Для клиентской фильтрации нужно получить ВСЕ данные, а не только текущую страницу
        // Это временное решение - в идеале все фильтры должны быть на сервере
        
        const totalElements = filteredBooks.length;
        const totalPages = Math.ceil(totalElements / params.size);
        
        // Применяем пагинацию вручную
        const startIndex = params.page * params.size;
        const endIndex = Math.min(startIndex + params.size, filteredBooks.length);
        const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

        setState({
          books: paginatedBooks,
          loading: false,
          error: null,
          totalElements: totalElements,
          totalPages: totalPages,
        });
      } else {
        // Используем данные с сервера как есть
        setState({
          books: filteredBooks,
          loading: false,
          error: null,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
        });
      }
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
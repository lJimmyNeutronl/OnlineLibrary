import { useState, useCallback, useMemo } from 'react';

export interface CatalogFilters {
  search: string;
  categoryIds: number[];
  yearFrom: number;
  yearTo: number;
  language: string;
  minRating: number;
  sortBy: 'title' | 'author' | 'publicationYear' | 'rating' | 'uploadDate';
  direction: 'asc' | 'desc';
}

export interface CatalogFiltersState extends CatalogFilters {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: CatalogFilters = {
  search: '',
  categoryIds: [],
  yearFrom: 0,
  yearTo: 0,
  language: '',
  minRating: 0,
  sortBy: 'title',
  direction: 'asc',
};

const DEFAULT_PAGINATION = {
  page: 0,
  size: 12,
};

export const useCatalogFilters = () => {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // Объединенное состояние для API запросов
  const apiParams = useMemo((): CatalogFiltersState => ({
    ...filters,
    ...pagination,
  }), [filters, pagination]);

  // Обновление фильтров
  const updateFilters = useCallback((newFilters: Partial<CatalogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // При изменении фильтров сбрасываем на первую страницу
    setPagination(prev => ({ ...prev, page: 0 }));
  }, []);

  // Обновление пагинации
  const updatePagination = useCallback((newPagination: Partial<typeof DEFAULT_PAGINATION>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination(DEFAULT_PAGINATION);
  }, []);

  // Проверка, есть ли активные фильтры
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.categoryIds.length > 0 ||
      filters.yearFrom !== DEFAULT_FILTERS.yearFrom ||
      filters.yearTo !== DEFAULT_FILTERS.yearTo ||
      filters.language !== '' ||
      filters.minRating > 0
    );
  }, [filters]);

  // Количество активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.categoryIds.length > 0) count++;
    if (filters.yearFrom !== DEFAULT_FILTERS.yearFrom || filters.yearTo !== DEFAULT_FILTERS.yearTo) count++;
    if (filters.language !== '') count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    pagination,
    apiParams,
    updateFilters,
    updatePagination,
    resetFilters,
    hasActiveFilters,
    activeFiltersCount,
  };
}; 
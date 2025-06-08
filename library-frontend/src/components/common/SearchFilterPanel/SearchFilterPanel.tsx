import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input, Button, Select, Row, Col } from '@/components/common';
import { BsSearch, BsFilterLeft } from 'react-icons/bs';
import { FiGrid, FiList, FiX, FiChevronUp, FiChevronDown, FiShuffle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import Typography from '@/components/common/Typography';
import styles from './SearchFilterPanel.module.css';

const { Title } = Typography;

export type ViewMode = 'grid' | 'list';
export type SortOption = 'year' | 'relevance' | 'rating' | 'uploadDate';
export type SortDirection = 'asc' | 'desc';

export interface SearchFilterPanelProps<T> {
  data: T[];
  onFilteredDataChange: (filteredData: T[]) => void;
  onSortChange: (option: SortOption, direction: SortDirection) => void;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  sortBy: SortOption;
  sortDirection?: SortDirection;
  viewMode: ViewMode;
  totalItems?: number;
  onResetPage?: () => void;
  onSearchQueryChange?: (query: string) => void;
  filterByTitle?: (item: T, query: string) => boolean;
  searchMode?: 'local' | 'global';
}

function SearchFilterPanel<T extends Record<string, any>>({
  data,
  onFilteredDataChange,
  onSortChange,
  onViewModeChange,
  searchQuery: initialSearchQuery = '',
  sortBy,
  sortDirection = 'desc',
  viewMode,
  totalItems,
  onResetPage,
  onSearchQueryChange,
  filterByTitle,
  searchMode = 'local',
}: SearchFilterPanelProps<T>) {
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>(sortDirection);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Мемоизируем функцию фильтрации по умолчанию
  const defaultFilterByTitle = useCallback((item: T, query: string) => 
    item.title?.toLowerCase().includes(query.toLowerCase()) || 
    item.author?.toLowerCase().includes(query.toLowerCase()), []);

  // Используем переданную функцию или функцию по умолчанию
  const memoizedFilterByTitle = useMemo(() => 
    filterByTitle || defaultFilterByTitle, 
    [filterByTitle, defaultFilterByTitle]
  );

  const getSortOptions = useMemo(() => {
    const baseOptions = [
      { value: 'rating' as SortOption, label: 'По рейтингу', icon: <HiSparkles /> },
      { value: 'year' as SortOption, label: 'По году', icon: <FiShuffle /> },
      { value: 'uploadDate' as SortOption, label: 'По дате добавления', icon: <FiShuffle /> },
    ];

    if (searchQuery.trim()) {
      return [
        { value: 'relevance' as SortOption, label: 'По релевантности', icon: <BsSearch /> },
        ...baseOptions
      ];
    }

    return baseOptions;
  }, [searchQuery]);

  // Определяем направление сортировки по умолчанию для каждого типа
  const getDefaultDirection = useCallback((sortOption: SortOption): SortDirection => {
    switch (sortOption) {
      case 'year':
      case 'rating':
      case 'uploadDate':
      case 'relevance':
        return 'desc'; // Новые/высокие первыми
      default:
        return 'desc';
    }
  }, []);

  // Локальная фильтрация данных (только для режима 'local')
  useEffect(() => {
    if (searchMode !== 'local') return;

    let filtered = [...data];
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item => memoizedFilterByTitle(item, searchQuery));
    }
    
    if (searchQuery.trim() === '') {
      onFilteredDataChange([]);
    } else {
      onFilteredDataChange(filtered);
    }
  }, [data, searchQuery, onFilteredDataChange, memoizedFilterByTitle, searchMode]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (onResetPage) onResetPage();
    
    // Для глобального поиска вызываем onSearchQueryChange
    if (searchMode === 'global' && onSearchQueryChange) {
      onSearchQueryChange(value);
    }
  }, [onResetPage, onSearchQueryChange, searchMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onResetPage) onResetPage();
    }
  }, [onResetPage]);

  const handleSortChange = useCallback((option: SortOption) => {
    if (option === 'relevance' && !searchQuery.trim()) {
      const newDirection = getDefaultDirection('rating');
      setCurrentSortDirection(newDirection);
      onSortChange('rating', newDirection);
    } else {
      const newDirection = getDefaultDirection(option);
      setCurrentSortDirection(newDirection);
      onSortChange(option, newDirection);
    }
    if (onResetPage) onResetPage();
  }, [searchQuery, getDefaultDirection, onSortChange, onResetPage]);

  const toggleSortDirection = useCallback(() => {
    const newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    setCurrentSortDirection(newDirection);
    onSortChange(sortBy, newDirection);
    if (onResetPage) onResetPage();
  }, [currentSortDirection, sortBy, onSortChange, onResetPage]);

  const currentSortBy = useMemo(() => {
    if (sortBy === 'relevance' && !searchQuery.trim()) {
      return 'rating';
    }
    return sortBy;
  }, [sortBy, searchQuery]);

  // Синхронизация с внешним searchQuery только при изменении
  useEffect(() => {
    if (initialSearchQuery !== searchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Синхронизация направления сортировки
  useEffect(() => {
    if (sortDirection !== currentSortDirection) {
      setCurrentSortDirection(sortDirection);
    }
  }, [sortDirection]);

  // Функция для получения иконки направления сортировки
  const getSortDirectionIcon = () => {
    return currentSortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  // Получаем текущую опцию сортировки для отображения
  const currentSortOption = getSortOptions.find(opt => opt.value === currentSortBy);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    if (onResetPage) onResetPage();
    if (searchMode === 'global' && onSearchQueryChange) {
      onSearchQueryChange('');
    }
  }, [onResetPage, onSearchQueryChange, searchMode]);

  return (
    <div className={styles.searchFilterPanel}>
      {/* Главная панель поиска */}
      <div className={styles.mainSearchPanel}>
        <div className={styles.searchSection}>
          <div className={styles.modernSearchContainer}>
            <div className={styles.searchIconWrapper}>
              <BsSearch />
            </div>
            <Input 
              placeholder={searchMode === 'global' 
                ? "Найдите свою следующую любимую книгу..." 
                : "Поиск в текущей категории..."
              } 
              className={styles.modernSearchInput}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <Button 
                type="text" 
                size="small"
                icon={<FiX />}
                onClick={handleClearSearch}
                className={styles.modernClearButton}
              />
            )}
          </div>
        </div>

        <div className={styles.middleSection}>
          {/* Информация о результатах */}
          {totalItems !== undefined && (
            <div className={styles.inlineResultsInfo}>
              <div className={styles.inlineResultsCount}>
                <HiSparkles className={styles.inlineResultsIcon} />
                <span>
                  {totalItems === 0 ? 'Ничего не найдено' : 
                   totalItems === 1 ? 'Найдена 1 книга' :
                   totalItems < 5 ? `Найдено ${totalItems} книги` :
                   `Найдено ${totalItems} книг`}
                </span>
              </div>
              {searchQuery && (
                <div className={styles.inlineActiveSearch}>
                  по запросу "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.quickActions}>
          <Button
            icon={<BsFilterLeft />}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${styles.filterToggle} ${isExpanded ? styles.active : ''}`}
            type="default"
          >
            Фильтры
          </Button>
          
          <div className={styles.viewModeSection}>
            <Button 
              icon={<FiGrid />} 
              onClick={() => onViewModeChange('grid')}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              className={styles.viewModeButton}
            />
            <Button 
              icon={<FiList />} 
              onClick={() => onViewModeChange('list')}
              type={viewMode === 'list' ? 'primary' : 'default'}
              className={styles.viewModeButton}
            />
          </div>
        </div>
      </div>

      {/* Расширенная панель фильтров */}
      <div className={`${styles.advancedFilters} ${isExpanded ? styles.expanded : ''}`}>
        <div className={styles.filterRow}>
          <div className={styles.sortSection}>
            <span className={styles.filterLabel}>
              <BsFilterLeft />
              Сортировка
            </span>
            <div className={styles.sortControls}>
              <div className={styles.selectWrapper}>
                <Select 
                  className={styles.modernSortSelect}
                  onChange={handleSortChange}
                  value={currentSortBy}
                  options={getSortOptions.map(opt => ({
                    value: opt.value,
                    label: (
                      <div className={styles.sortOptionLabel}>
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                    )
                  }))}
                />
              </div>
              <Button 
                type="default"
                icon={getSortDirectionIcon()}
                onClick={toggleSortDirection}
                className={styles.modernSortDirection}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchFilterPanel; 
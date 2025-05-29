import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiSearch, 
  FiRefreshCw, 
  FiChevronDown,
  FiX,
  FiStar,
  FiBook,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { Button, Input, Select, Rate } from '../common';
import { useCategories } from '../../hooks/useCategories';
import { CatalogFilters } from '../../hooks/useCatalogFilters';
import './CatalogFilters.css';

interface CatalogFiltersProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: Partial<CatalogFilters>) => void;
  onReset: () => void;
  activeFiltersCount: number;
  loading?: boolean;
  totalBooks?: number;
  currentCount?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  hasActiveFilters?: boolean;
}

const LANGUAGES = [
  { value: '', label: 'Все языки' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];

const SORT_OPTIONS = [
  { value: 'title', label: 'По названию' },
  { value: 'author', label: 'По автору' },
  { value: 'publicationYear', label: 'По году издания' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'uploadDate', label: 'По дате добавления' },
];

const CatalogFiltersComponent: React.FC<CatalogFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  activeFiltersCount,
  loading = false,
  totalBooks,
  currentCount,
  viewMode,
  onViewModeChange,
  hasActiveFilters
}) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: searchValue });
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategoryIds = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter(id => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    
    onFiltersChange({ categoryIds: newCategoryIds });
  };

  const handleYearChange = (field: 'yearFrom' | 'yearTo', value: string) => {
    const year = parseInt(value) || (field === 'yearFrom' ? 1900 : new Date().getFullYear());
    onFiltersChange({ [field]: year });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="catalog-filters">
      {/* Заголовок фильтров с информацией о книгах */}
      <div className="filters-header">
        <div className="filters-title-section">
          <div className="filters-title">
            <FiFilter className="filter-icon" />
            <span>Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="filters-badge">{activeFiltersCount}</span>
            )}
          </div>
          
          {/* Информация о количестве книг */}
          {totalBooks !== undefined && currentCount !== undefined && (
            <div className="books-count-info">
              <FiBook className="book-icon" />
              <span className="books-count-text">
                {loading ? (
                  'Загрузка...'
                ) : hasActiveFilters ? (
                  <>Найдено <strong>{currentCount}</strong> из {totalBooks} книг</>
                ) : (
                  <>Всего <strong>{totalBooks}</strong> {totalBooks === 1 ? 'книга' : totalBooks < 5 ? 'книги' : 'книг'}</>
                )}
              </span>
            </div>
          )}
        </div>
        
        <div className="filters-actions">
          {/* Кнопки переключения вида */}
          {viewMode && onViewModeChange && (
            <div className="view-mode-section">
              <button
                className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                title="Сетка"
              >
                <FiGrid />
              </button>
              <button
                className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => onViewModeChange('list')}
                title="Список"
              >
                <FiList />
              </button>
            </div>
          )}
          
          <button
            className="filters-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <FiChevronDown 
              className={`chevron-icon ${isExpanded ? 'expanded' : ''}`} 
            />
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              className="filters-reset"
              onClick={onReset}
              title="Сбросить фильтры"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>
      </div>

      {/* Поиск - всегда видимый */}
      <form onSubmit={handleSearchSubmit} className="search-section">
        <div className="search-container">
          <Input
            type="text"
            placeholder="Поиск по названию или автору..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <FiSearch />
          </button>
        </div>
      </form>

      {/* Расширенные фильтры */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="filters-content"
          >
            {/* Быстрые фильтры */}
            <div className="filter-section">
              <label className="filter-label">Быстрые фильтры</label>
              <div className="quick-filters">
                <Button
                  size="small"
                  type={filters.sortBy === 'uploadDate' && filters.direction === 'desc' ? 'primary' : 'default'}
                  onClick={() => onFiltersChange({ sortBy: 'uploadDate', direction: 'desc' })}
                >
                  Новинки
                </Button>
                <Button
                  size="small"
                  type={filters.sortBy === 'rating' && filters.direction === 'desc' ? 'primary' : 'default'}
                  onClick={() => onFiltersChange({ sortBy: 'rating', direction: 'desc' })}
                >
                  Популярные
                </Button>
                <Button
                  size="small"
                  type={filters.minRating >= 4 ? 'primary' : 'default'}
                  onClick={() => onFiltersChange({ minRating: filters.minRating >= 4 ? 0 : 4 })}
                >
                  <FiStar /> Высокий рейтинг
                </Button>
              </div>
            </div>

            {/* Категории */}
            <div className="filter-section">
              <label className="filter-label">Категории</label>
              <div className="categories-list">
                {categoriesLoading ? (
                  <div className="categories-loading">Загрузка...</div>
                ) : (
                  categories.map(category => (
                    <div key={category.id} className="category-item">
                      <label className="category-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.categoryIds.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                        />
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">({category.bookCount})</span>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Год издания */}
            <div className="filter-section">
              <label className="filter-label">
                Год издания: {filters.yearFrom} - {filters.yearTo}
              </label>
              <div className="year-range">
                <Input
                  type="number"
                  min="1900"
                  max={filters.yearTo}
                  value={filters.yearFrom}
                  onChange={(e) => handleYearChange('yearFrom', e.target.value)}
                  className="year-input"
                  placeholder="От"
                />
                <span className="year-separator">—</span>
                <Input
                  type="number"
                  min={filters.yearFrom}
                  max={currentYear}
                  value={filters.yearTo}
                  onChange={(e) => handleYearChange('yearTo', e.target.value)}
                  className="year-input"
                  placeholder="До"
                />
              </div>
            </div>

            {/* Язык */}
            <div className="filter-section">
              <label className="filter-label">Язык</label>
              <Select
                value={filters.language}
                onChange={(value) => onFiltersChange({ language: value })}
                options={LANGUAGES}
                className="language-select"
              />
            </div>

            {/* Рейтинг */}
            <div className="filter-section">
              <label className="filter-label">Минимальный рейтинг</label>
              <div className="rating-filter">
                <Rate
                  value={filters.minRating}
                  onChange={(value) => onFiltersChange({ minRating: value })}
                />
                {filters.minRating > 0 && (
                  <button
                    className="rating-clear"
                    onClick={() => onFiltersChange({ minRating: 0 })}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>

            {/* Сортировка */}
            <div className="filter-section">
              <label className="filter-label">Сортировка</label>
              <div className="sort-controls">
                <Select
                  value={filters.sortBy}
                  onChange={(value) => onFiltersChange({ sortBy: value as any })}
                  options={SORT_OPTIONS}
                  className="sort-select"
                />
                <Button
                  type={filters.direction === 'desc' ? 'primary' : 'default'}
                  onClick={() => onFiltersChange({ 
                    direction: filters.direction === 'asc' ? 'desc' : 'asc' 
                  })}
                  className="sort-direction"
                >
                  {filters.direction === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Активные фильтры */}
      {activeFiltersCount > 0 && (
        <div className="active-filters">
          <div className="active-filters-title">Активные фильтры:</div>
          <div className="active-filters-list">
            {filters.search && (
              <span className="filter-tag">
                Поиск: "{filters.search}"
                <button onClick={() => onFiltersChange({ search: '' })}>
                  <FiX />
                </button>
              </span>
            )}
            {filters.categoryIds.length > 0 && (
              <span className="filter-tag">
                Категории: {filters.categoryIds.length}
                <button onClick={() => onFiltersChange({ categoryIds: [] })}>
                  <FiX />
                </button>
              </span>
            )}
            {filters.language && (
              <span className="filter-tag">
                Язык: {LANGUAGES.find(l => l.value === filters.language)?.label}
                <button onClick={() => onFiltersChange({ language: '' })}>
                  <FiX />
                </button>
              </span>
            )}
            {filters.minRating > 0 && (
              <span className="filter-tag">
                Рейтинг: от {filters.minRating} ★
                <button onClick={() => onFiltersChange({ minRating: 0 })}>
                  <FiX />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFiltersComponent; 
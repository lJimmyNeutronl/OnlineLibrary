import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import genreService from '../../services/genreService';
import authorService from '../../services/authorService';
import './CatalogFilters.css';

export interface FilterParams {
  search?: string;
  genres?: number[];
  authors?: number[];
  yearFrom?: number;
  yearTo?: number;
  onlyAvailable?: boolean;
  sortBy?: string;
}

interface CatalogFiltersProps {
  onApplyFilters: (filters: FilterParams) => void;
  loading?: boolean;
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({ onApplyFilters, loading = false }) => {
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [authors, setAuthors] = useState<Array<{ id: number; name: string }>>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1900, new Date().getFullYear()]);
  
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    genres: [],
    authors: [],
    yearFrom: 1900,
    yearTo: new Date().getFullYear(),
    onlyAvailable: false,
    sortBy: 'popularity',
  });

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const genresData = await genreService.getAllGenres();
        setGenres(genresData);

        const authorsData = await authorService.getAllAuthors();
        setAuthors(authorsData);
      } catch (error) {
        console.error('Ошибка загрузки данных фильтров:', error);
      }
    };
    
    loadFilterData();
  }, []);

  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleYearRangeChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(event.target.value, 10);
    const newRange = [...yearRange] as [number, number];
    newRange[index] = value;
    setYearRange(newRange);
    
    if (index === 0) {
      handleFilterChange('yearFrom', value);
    } else {
      handleFilterChange('yearTo', value);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', event.target.value);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, key: keyof FilterParams) => {
    handleFilterChange(key, event.target.value);
  };

  const handleMultiSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, key: keyof FilterParams) => {
    const options = event.target.options;
    const selectedValues: number[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(parseInt(options[i].value, 10));
      }
    }
    
    handleFilterChange(key, selectedValues);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('onlyAvailable', event.target.checked);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      genres: [],
      authors: [],
      yearFrom: 1900,
      yearTo: new Date().getFullYear(),
      onlyAvailable: false,
      sortBy: 'popularity',
    });
    setYearRange([1900, new Date().getFullYear()]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApplyFilters(filters);
  };

  return (
    <div className="catalog-filters">
      <div className="filters-header">
        <h4 className="filters-title">
          <FiFilter className="filter-icon" /> Фильтры
        </h4>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="filter-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск по названию или автору"
              className="search-input"
              value={filters.search}
              onChange={handleSearchChange}
            />
            <button type="button" className="search-button" onClick={() => onApplyFilters(filters)}>
              <FiSearch />
            </button>
          </div>
        </div>
        
        <hr className="filter-divider" />
        
        <div className="filter-section">
          <label className="filter-label">Жанры</label>
          <select
            multiple
            className="filter-select"
            value={filters.genres?.map(id => id.toString()) || []}
            onChange={(e) => handleMultiSelectChange(e, 'genres')}
            size={4}
          >
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
          <small className="filter-help">Зажмите Ctrl (Cmd) для выбора нескольких жанров</small>
        </div>
        
        <div className="filter-section">
          <label className="filter-label">Авторы</label>
          <select
            multiple
            className="filter-select"
            value={filters.authors?.map(id => id.toString()) || []}
            onChange={(e) => handleMultiSelectChange(e, 'authors')}
            size={4}
          >
            {authors.map(author => (
              <option key={author.id} value={author.id}>{author.name}</option>
            ))}
          </select>
          <small className="filter-help">Зажмите Ctrl (Cmd) для выбора нескольких авторов</small>
        </div>
        
        <div className="filter-section">
          <label className="filter-label">Год издания: {yearRange[0]} - {yearRange[1]}</label>
          <div className="year-range-inputs">
            <input
              type="number"
              min="1900"
              max={yearRange[1]}
              value={yearRange[0]}
              onChange={(e) => handleYearRangeChange(e, 0)}
              className="year-input"
            />
            <span className="year-range-separator">-</span>
            <input
              type="number"
              min={yearRange[0]}
              max={new Date().getFullYear()}
              value={yearRange[1]}
              onChange={(e) => handleYearRangeChange(e, 1)}
              className="year-input"
            />
          </div>
        </div>
        
        <div className="filter-section">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={handleCheckboxChange}
            />
            <span className="checkbox-label">Только доступные для чтения</span>
          </label>
        </div>
        
        <div className="filter-section">
          <label className="filter-label">Сортировать по</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSelectChange(e, 'sortBy')}
            className="filter-select"
          >
            <option value="popularity">Популярности</option>
            <option value="title_asc">Названию (А-Я)</option>
            <option value="title_desc">Названию (Я-А)</option>
            <option value="year_desc">Новые</option>
            <option value="year_asc">Старые</option>
            <option value="rating_desc">Рейтингу</option>
          </select>
        </div>
        
        <div className="filter-actions">
          <div className="filter-actions-row">
            <button 
              type="button" 
              className="reset-btn"
              onClick={handleResetFilters}
            >
              <FiRefreshCw className="button-icon" /> Сбросить
            </button>
            <button 
              type="submit" 
              className="apply-btn"
              disabled={loading}
            >
              {loading ? 'Применение...' : 'Применить'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CatalogFilters; 
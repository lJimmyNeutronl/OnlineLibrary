import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Row, Col } from '../../common';
import { BsSearch } from 'react-icons/bs';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';
import Typography from '../Typography';
import './search-filter-panel.css';

const { Title } = Typography;

export interface YearFilter {
  min: number;
  max: number;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'title' | 'author' | 'year' | 'relevance';

export interface SearchFilterPanelProps<T> {
  data: T[];
  onFilteredDataChange: (filteredData: T[]) => void;
  onSortChange: (option: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  sortBy: SortOption;
  viewMode: ViewMode;
  totalItems?: number;
  onResetPage?: () => void;
  filterByTitle?: (item: T, query: string) => boolean;
  filterByYear?: (item: T, min: number, max: number) => boolean;
}

function SearchFilterPanel<T>({
  data,
  onFilteredDataChange,
  onSortChange,
  onViewModeChange,
  searchQuery: initialSearchQuery = '',
  sortBy,
  viewMode,
  totalItems,
  onResetPage,
  filterByTitle = (item: any, query: string) => 
    item.title?.toLowerCase().includes(query.toLowerCase()) || 
    item.author?.toLowerCase().includes(query.toLowerCase()),
  filterByYear = (item: any, min: number, max: number) => 
    item.publicationYear !== undefined && 
    item.publicationYear >= min && 
    item.publicationYear <= max
}: SearchFilterPanelProps<T>) {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [yearFilter, setYearFilter] = useState<YearFilter | null>(null);
  const [filteredData, setFilteredData] = useState<T[]>([]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Обработчик отправки поискового запроса
  const handleSearchSubmit = () => {
    applyFilters();
    if (onResetPage) onResetPage();
  };

  // Переключение отображения фильтров
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Обработчик изменения фильтра по году
  const handleYearFilterChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setYearFilter(prev => ({ min: value, max: prev?.max || new Date().getFullYear() }));
    } else {
      setYearFilter(prev => ({ min: prev?.min || 1970, max: value }));
    }
  };

  // Обработчик сброса всех фильтров
  const handleResetFilters = () => {
    setSearchQuery('');
    setYearFilter(null);
    onFilteredDataChange([]);
    if (onResetPage) onResetPage();
  };

  // Функция применения фильтров
  const applyFilters = () => {
    let filtered = [...data];
    
    // Применяем поисковый фильтр
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item => filterByTitle(item, searchQuery));
    }
    
    // Применяем фильтр по году
    if (yearFilter) {
      filtered = filtered.filter(item => filterByYear(item, yearFilter.min, yearFilter.max));
    }
    
    // Если нет активных фильтров, возвращаем пустой массив (что означает "показать все")
    if (searchQuery.trim() === '' && !yearFilter) {
      setFilteredData([]);
      onFilteredDataChange([]);
    } else {
      setFilteredData(filtered);
      onFilteredDataChange(filtered);
    }
  };

  // Применяем фильтры при изменении параметров
  useEffect(() => {
    applyFilters();
  }, [yearFilter, data]);

  // Обновляем поисковый запрос, если изменился initialSearchQuery
  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: 50 }, (_, i) => ({ 
    value: currentYear - i, 
    label: (currentYear - i).toString() 
  }));

  return (
    <div className="search-filter-panel">
      <div className="search-filter-toolbar">
        <div className="search-filter-left">
          <Input 
            placeholder="Поиск по названию или автору" 
            prefix={<BsSearch color="#3769f5" />} 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onBlur={handleSearchSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
          <Button 
            icon={<FiFilter />} 
            onClick={toggleFilters}
            className={`filter-button ${showFilters ? 'active' : ''}`}
          >
            Фильтры
          </Button>
        </div>
        
        <div className="search-filter-right">
          <span className="sort-label">Сортировка:</span>
          <Select 
            defaultValue="relevance" 
            className="sort-select"
            onChange={(value: SortOption) => {
              onSortChange(value);
              if (onResetPage) onResetPage();
            }}
            value={sortBy}
            options={[
              { value: 'relevance', label: 'По релевантности' },
              { value: 'title', label: 'По названию' },
              { value: 'author', label: 'По автору' },
              { value: 'year', label: 'По году' },
            ]}
          />
          
          <div className="view-mode-buttons">
            <Button 
              icon={<FiGrid />} 
              onClick={() => onViewModeChange('grid')}
              type={viewMode === 'grid' ? 'primary' : 'default'}
            />
            <Button 
              icon={<FiList />} 
              onClick={() => onViewModeChange('list')}
              type={viewMode === 'list' ? 'primary' : 'default'}
            />
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="filter-panel">
          <Title level={5}>Фильтры</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div className="year-filter">
                <div className="year-filter-label">Год издания</div>
                <div className="year-filter-inputs">
                  <Select 
                    placeholder="От" 
                    className="year-select"
                    value={yearFilter?.min}
                    onChange={(value: number) => handleYearFilterChange('min', value)}
                    options={yearsArray}
                  />
                  <span>-</span>
                  <Select 
                    placeholder="До" 
                    className="year-select"
                    value={yearFilter?.max}
                    onChange={(value: number) => handleYearFilterChange('max', value)}
                    options={yearsArray}
                  />
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={16}>
              <div className="filter-actions">
                <Button className="reset-button" onClick={handleResetFilters}>
                  Сбросить
                </Button>
                <Button type="primary" onClick={() => {
                  setShowFilters(false);
                  applyFilters();
                }}>
                  Применить
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default SearchFilterPanel; 
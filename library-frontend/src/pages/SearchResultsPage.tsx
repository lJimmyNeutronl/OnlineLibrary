import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookList } from '@/components/book-card';
import { Typography, Breadcrumb, Spin, Empty } from '@/components/common';
import SearchFilterPanel, { ViewMode, SortOption, SortDirection } from '@/components/common/SearchFilterPanel/SearchFilterPanel';
import Pagination from '@/components/common/Pagination';
import AnimatedBackground from '@/components/common/AnimatedBackground';
import bookService, { Book, PagedResponse } from '@/services/bookService';
import styles from './SearchResultsPage.module.css';

const { Title, Text } = Typography;

const SearchResultsPage = () => {
  // Получаем параметры из URL
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Состояние для хранения результатов поиска и параметров
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Константы для пагинации
  const pageSize = 15;
  
  // Мемоизируем функцию получения результатов поиска
  const fetchSearchResults = useCallback(async (query: string, page: number, sort: SortOption, direction: SortDirection) => {
    console.log('fetchSearchResults called with:', { query, page, sort, direction });
    setLoading(true);
    try {
      // Преобразуем номер страницы для API (API использует 0-based индексацию)
      const apiPage = page - 1;
      
      // Преобразуем новые типы сортировки в совместимые с API
      let apiSortBy: string | undefined;
      switch (sort) {
        case 'year':
          apiSortBy = 'publicationYear';
          break;
        case 'rating':
          apiSortBy = 'rating';
          break;
        case 'uploadDate':
          apiSortBy = 'uploadDate';
          break;
        case 'relevance':
        default:
          apiSortBy = undefined;
          break;
      }
      
      const apiParams = {
        page: apiPage,
        size: pageSize,
        sortBy: apiSortBy,
        direction: direction
      };
      
      console.log('API request params:', apiParams);
      
      // Получаем результаты поиска
      const response: PagedResponse<Book> = await bookService.searchBooks(query, apiParams);
      
      console.log('API response:', { totalElements: response.totalElements, contentLength: response.content.length });
      
      setSearchResults(response.content);
      setTotalItems(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Ошибка при поиске книг:', error);
      setSearchResults([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Инициализация параметров из URL при загрузке страницы
  useEffect(() => {
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = (searchParams.get('sort') as SortOption) || 'relevance';
    const direction = (searchParams.get('direction') as SortDirection) || 'desc';
    
    console.log('useEffect triggered with URL params:', { query, page, sort, direction });
    console.log('Current searchParams:', searchParams.toString());
    
    setSearchQuery(query);
    setCurrentPage(page);
    setSortBy(sort);
    setSortDirection(direction);
    
    // Убеждаемся, что параметры сортировки всегда присутствуют в URL
    const currentSort = searchParams.get('sort');
    const currentDirection = searchParams.get('direction');
    
    if (!currentSort || !currentDirection) {
      const newParams = new URLSearchParams(searchParams);
      if (!currentSort) newParams.set('sort', sort);
      if (!currentDirection) newParams.set('direction', direction);
      setSearchParams(newParams, { replace: true });
      return; // Выходим, чтобы избежать двойного запроса
    }
    
    // Загружаем результаты поиска
    if (query) {
      console.log('Calling fetchSearchResults with:', { query, page, sort, direction });
      fetchSearchResults(query, page, sort, direction);
    } else {
      setLoading(false);
    }
  }, [searchParams, setSearchParams]);
  
  // Мемоизированные обработчики
  const handlePageChange = useCallback((page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    
    // Немедленно вызываем fetchSearchResults с новыми параметрами
    const currentQuery = searchParams.get('query') || '';
    const currentSort = (searchParams.get('sort') as SortOption) || 'relevance';
    const currentDirection = (searchParams.get('direction') as SortDirection) || 'desc';
    
    if (currentQuery) {
      console.log('Immediately calling fetchSearchResults from handlePageChange');
      fetchSearchResults(currentQuery, page, currentSort, currentDirection);
    }
  }, [searchParams, setSearchParams, fetchSearchResults]);
  
  const handleSortChange = useCallback((option: SortOption, direction: SortDirection) => {
    console.log('handleSortChange called with:', { option, direction });
    setSortBy(option);
    setSortDirection(direction);
    
    // Обновляем параметры URL, сохраняя существующие параметры
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', option);
    newParams.set('direction', direction);
    newParams.set('page', '1'); // Сбрасываем на первую страницу при изменении сортировки
    console.log('New URL params:', newParams.toString());
    setSearchParams(newParams);
    
    // Немедленно вызываем fetchSearchResults с новыми параметрами
    const currentQuery = searchParams.get('query') || '';
    if (currentQuery) {
      console.log('Immediately calling fetchSearchResults from handleSortChange');
      fetchSearchResults(currentQuery, 1, option, direction);
    }
  }, [searchParams, setSearchParams, fetchSearchResults]);
  
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);
  
  const handleSearchQueryChange = useCallback((query: string) => {
    // Проверяем, действительно ли запрос изменился
    const currentQuery = searchParams.get('query') || '';
    if (query === currentQuery) {
      return; // Не обновляем, если запрос не изменился
    }
    
    setSearchQuery(query);
    
    // Обновляем URL параметры, сохраняя текущие параметры сортировки
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('query', query);
    } else {
      newParams.delete('query');
    }
    newParams.set('page', '1'); // При новом поиске всегда начинаем с первой страницы
    
    setSearchParams(newParams);
    
    // Немедленно вызываем fetchSearchResults с новыми параметрами
    if (query) {
      const currentSort = (searchParams.get('sort') as SortOption) || 'relevance';
      const currentDirection = (searchParams.get('direction') as SortDirection) || 'desc';
      console.log('Immediately calling fetchSearchResults from handleSearchQueryChange');
      fetchSearchResults(query, 1, currentSort, currentDirection);
    }
  }, [searchParams, setSearchParams, fetchSearchResults]);

  const handleResetPage = useCallback(() => {
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Заглушка для onFilteredDataChange (не используется в глобальном режиме)
  const handleFilteredDataChange = useCallback(() => {
    // В глобальном режиме поиска фильтрация не используется
  }, []);

  return (
    <AnimatedBackground>
      <div className={styles.container}>
        {/* Хлебные крошки */}
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/books">Книги</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item style={{ color: '#8e54e9' }}>Поиск</Breadcrumb.Item>
        </Breadcrumb>

        {/* Карточка контента */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.contentCard}
        >
          {/* Заголовок страницы */}
          <div className={styles.titleContainer}>
            <Title 
              level={2} 
              style={{
                margin: 0,
                backgroundImage: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#3769f5' // Фолбэк для браузеров, не поддерживающих gradient text
              }}
            >
              Результаты поиска
            </Title>
          </div>
          
          {/* Панель поиска и фильтрации в глобальном режиме */}
          <SearchFilterPanel
            data={searchResults}
            onFilteredDataChange={handleFilteredDataChange}
            onSortChange={handleSortChange}
            onViewModeChange={handleViewModeChange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDirection={sortDirection}
            viewMode={viewMode}
            totalItems={totalItems}
            onResetPage={handleResetPage}
            onSearchQueryChange={handleSearchQueryChange}
            searchMode="global"
          />
          
          {/* Результаты поиска */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <BookList 
                books={searchResults}
                viewMode={viewMode}
              />
              
              {/* Пагинация */}
              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : searchQuery ? (
            <Empty 
              description={
                <div className={styles.emptyDescription}>
                  <p>
                    По запросу "{searchQuery}" ничего не найдено
                  </p>
                  <p>
                    Попробуйте изменить поисковый запрос или сбросить фильтры
                  </p>
                  <button
                    onClick={() => navigate('/books')}
                    className={styles.backToCatalogButton}
                  >
                    Вернуться к каталогу
                  </button>
                </div>
              } 
            />
          ) : (
            <div className={styles.noQueryContainer}>
              <p>Введите поисковый запрос для поиска книг</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default SearchResultsPage; 
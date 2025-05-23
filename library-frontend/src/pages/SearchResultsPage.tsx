import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaTimes, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { BookList } from '../components/book-card';
import { Typography, Breadcrumb, Spin, Empty } from '../components/common';
import Pagination from '../components/common/Pagination';
import AnimatedBackground from '../components/common/AnimatedBackground';
import bookService, { Book, PagedResponse } from '../services/bookService';

const { Title, Paragraph, Text } = Typography;

// Типы для сортировки и фильтрации
type SortOption = 'relevance' | 'title' | 'author' | 'publicationYear' | 'rating';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

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
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [yearFilter, setYearFilter] = useState<{ min: number, max: number } | null>(null);
  
  // Константы для пагинации
  const pageSize = 15;
  
  // Инициализация параметров из URL при загрузке страницы
  useEffect(() => {
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = (searchParams.get('sort') as SortOption) || 'relevance';
    const direction = (searchParams.get('direction') as SortDirection) || 'desc';
    
    setSearchQuery(query);
    setCurrentPage(page);
    setSortBy(sort);
    setSortDirection(direction);
    
    // Загружаем результаты поиска
    if (query) {
      fetchSearchResults(query, page, sort, direction);
    } else {
      setLoading(false);
    }
  }, [searchParams]);
  
  // Функция для получения результатов поиска
  const fetchSearchResults = async (query: string, page: number, sort: SortOption, direction: SortDirection) => {
    setLoading(true);
    try {
      // Преобразуем номер страницы для API (API использует 0-based индексацию)
      const apiPage = page - 1;
      
      // Получаем результаты поиска
      const response: PagedResponse<Book> = await bookService.searchBooks(query, {
        page: apiPage,
        size: pageSize,
        sortBy: sort === 'relevance' ? undefined : sort,
        direction: direction
      });
      
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
  };
  
  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Обработчик отправки поискового запроса
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Обновляем параметры URL
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('query', searchQuery);
    newParams.set('page', '1'); // При новом поиске всегда начинаем с первой страницы
    if (sortBy !== 'relevance') newParams.set('sort', sortBy);
    if (sortDirection !== 'desc') newParams.set('direction', sortDirection);
    
    setSearchParams(newParams);
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  
  // Обработчик изменения сортировки
  const handleSortChange = (option: SortOption) => {
    // Если выбрана та же опция, меняем направление сортировки
    const newDirection = option === sortBy && sortDirection === 'desc' ? 'asc' : 'desc';
    
    setSortBy(option);
    setSortDirection(newDirection);
    
    // Обновляем параметры URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', option);
    newParams.set('direction', newDirection);
    setSearchParams(newParams);
  };
  
  // Обработчик изменения режима просмотра
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };
  
  // Обработчик сброса фильтров
  const resetFilters = () => {
    setYearFilter(null);
    // Обновляем параметры URL, удаляя все фильтры
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('query', searchQuery);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };
  
  // Обработчик очистки поискового запроса
  const clearSearchQuery = () => {
    setSearchQuery('');
    navigate('/books'); // Перенаправляем на страницу всех книг
  };
  
  return (
    <AnimatedBackground>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '40px 20px', 
        position: 'relative', 
        zIndex: 1 
      }}>
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
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '16px', 
            padding: '28px', 
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(55, 105, 245, 0.1)'
          }}
        >
          {/* Заголовок страницы */}
          <div style={{ marginBottom: '20px' }}>
            <Title level={2} style={{ 
              margin: 0,
              backgroundImage: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Результаты поиска
            </Title>
            {searchQuery && !loading && (
              <Text style={{ margin: '10px 0 0', color: '#666' }}>
                {totalItems > 0 
                  ? `Найдено ${totalItems} результатов для "${searchQuery}"`
                  : `По запросу "${searchQuery}" ничего не найдено`
                }
              </Text>
            )}
          </div>
          
          {/* Форма поиска */}
          <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex',
              position: 'relative',
              width: '100%',
              maxWidth: '600px'
            }}>
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2
              }}>
                <FaSearch color="#3769f5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Поиск книг..."
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  borderRadius: '50px',
                  border: '1px solid #e0e0e0',
                  fontSize: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '50px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaTimes color="#999" />
                </button>
              )}
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FaSearch color="white" size={12} />
              </button>
            </div>
          </form>
          
          {/* Панель управления результатами */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px',
            background: '#f5f7fa',
            padding: '12px 16px',
            borderRadius: '8px'
          }}>
            {/* Кнопки сортировки и фильтрации */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Кнопка фильтров */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  background: showFilters ? '#3769f5' : 'white',
                  color: showFilters ? 'white' : '#333',
                  cursor: 'pointer'
                }}
              >
                <FaFilter size={14} />
                <span>Фильтры</span>
              </button>
              
              {/* Кнопка сортировки */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {sortDirection === 'asc' ? (
                    <FaSortAmountUp size={14} />
                  ) : (
                    <FaSortAmountDown size={14} />
                  )}
                  <span>Сортировка: {
                    sortBy === 'relevance' ? 'По релевантности' :
                    sortBy === 'title' ? 'По названию' :
                    sortBy === 'author' ? 'По автору' :
                    sortBy === 'publicationYear' ? 'По году' :
                    'По рейтингу'
                  }</span>
                </button>
                
                {/* Выпадающее меню сортировки */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '200px',
                    background: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    display: 'none' // По умолчанию скрыто, можно добавить состояние для отображения
                  }}
                >
                  <div
                    onClick={() => handleSortChange('relevance')}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'relevance' ? '#f0f0f0' : 'transparent'
                    }}
                  >
                    По релевантности
                  </div>
                  <div
                    onClick={() => handleSortChange('title')}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'title' ? '#f0f0f0' : 'transparent'
                    }}
                  >
                    По названию
                  </div>
                  <div
                    onClick={() => handleSortChange('author')}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'author' ? '#f0f0f0' : 'transparent'
                    }}
                  >
                    По автору
                  </div>
                  <div
                    onClick={() => handleSortChange('publicationYear')}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'publicationYear' ? '#f0f0f0' : 'transparent'
                    }}
                  >
                    По году
                  </div>
                  <div
                    onClick={() => handleSortChange('rating')}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'rating' ? '#f0f0f0' : 'transparent'
                    }}
                  >
                    По рейтингу
                  </div>
                </div>
              </div>
            </div>
            
            {/* Переключатель вида отображения */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  background: viewMode === 'grid' ? '#3769f5' : 'white',
                  color: viewMode === 'grid' ? 'white' : '#333',
                  cursor: 'pointer'
                }}
              >
                Сетка
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  background: viewMode === 'list' ? '#3769f5' : 'white',
                  color: viewMode === 'list' ? 'white' : '#333',
                  cursor: 'pointer'
                }}
              >
                Список
              </button>
            </div>
          </div>
          
          {/* Панель фильтров (скрыта по умолчанию) */}
          {showFilters && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, fontSize: '18px' }}>Фильтры</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                  Год публикации
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="От"
                    value={yearFilter?.min || ''}
                    onChange={(e) => setYearFilter(prev => ({ 
                      min: parseInt(e.target.value) || 0,
                      max: prev?.max || new Date().getFullYear()
                    }))}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0',
                      width: '80px'
                    }}
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="До"
                    value={yearFilter?.max || ''}
                    onChange={(e) => setYearFilter(prev => ({ 
                      min: prev?.min || 1800,
                      max: parseInt(e.target.value) || new Date().getFullYear()
                    }))}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0',
                      width: '80px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleSearch()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Применить
                </button>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Сбросить
                </button>
              </div>
            </div>
          )}
          
          {/* Результаты поиска */}
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '300px'
            }}>
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
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
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
                <div>
                  <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                    По запросу "{searchQuery}" ничего не найдено
                  </p>
                  <p>
                    Попробуйте изменить поисковый запрос или сбросить фильтры
                  </p>
                  <button
                    onClick={clearSearchQuery}
                    style={{
                      marginTop: '15px',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Вернуться к каталогу
                  </button>
                </div>
              } 
            />
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '40px 0',
              color: '#666'
            }}>
              <p>Введите поисковый запрос для поиска книг</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default SearchResultsPage; 
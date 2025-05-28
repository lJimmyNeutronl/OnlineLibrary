import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography,  
  Spin, 
  Empty, 
  Breadcrumb,
  Tag,
  Pagination,
  SearchFilterPanel
} from '@/components/common';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BookList } from '@/components/book-card';
import bookService from '@/services/bookService';
import { Book } from '@/types';
import AnimatedBackground from '@/components/common/AnimatedBackground';
import type { ViewMode, SortOption, SortDirection } from '@/components/common/SearchFilterPanel';
import { useCategoryDetails } from '@/hooks/useCategoryDetails';
import { fadeIn } from '@/styles/animations';
import styles from '@/components/common/SearchFilterPanel/SearchFilterPanel.module.css';
import '@/styles/common.css';


const { Title, Paragraph } = Typography;

const CategoryBooksPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const pageSize = 15;

  const { category } = useCategoryDetails(categoryId);

  const fetchBooks = useCallback(async (currentPage = page) => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      // Определяем параметры сортировки
      let sortByParam: string | undefined;
      let directionParam: 'asc' | 'desc' = sortDirection;
      
      switch (sortBy) {
        case 'year':
          sortByParam = 'publicationYear';
          break;
        case 'rating':
          sortByParam = 'rating';
          break;
        case 'uploadDate':
          sortByParam = 'uploadDate';
          break;
        case 'relevance':
        default:
          // По умолчанию сортируем по рейтингу, если нет специальной сортировки
          sortByParam = 'rating';
          break;
      }
      
      const response = await bookService.getBooksByCategory(Number(categoryId), {
        page: currentPage - 1,
        size: pageSize,
        sortBy: sortByParam,
        direction: directionParam
      });
      
      setBooks(response.content);
      setTotalBooks(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Ошибка при получении книг:', error);
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, sortBy, sortDirection, pageSize]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
    
    // Если нет активных фильтров, запрашиваем новую страницу с сервера
    if (filteredBooks.length === 0) {
      fetchBooks(newPage);
    }
  }, [filteredBooks.length, fetchBooks]);

  const handleSortChange = useCallback((value: SortOption, direction: SortDirection) => {
    setSortBy(value);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const handleResetPage = useCallback(() => {
    setPage(1);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleFilteredDataChange = useCallback((filtered: Book[]) => {
    setFilteredBooks(filtered);
    setPage(1); // Сбрасываем страницу при фильтрации
  }, []);

  // Определяем, активна ли фильтрация
  const isFilteringActive = filteredBooks.length > 0;
  const displayBooks = isFilteringActive ? filteredBooks : books;
  
  // Пагинация на клиентской стороне для отфильтрованных результатов
  const paginatedBooks = isFilteringActive
    ? displayBooks.slice((page - 1) * pageSize, page * pageSize)
    : displayBooks;

  return (
    <AnimatedBackground>
      <div className={styles.categoryPageContainer}>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className={styles.categoryPageContent}
        >
          <Breadcrumb style={{ marginBottom: '16px' }}>
            <Breadcrumb.Item>
              <Link to="/">Главная</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/categories">Категории</Link>
            </Breadcrumb.Item>
            {category?.parentCategory && (
              <Breadcrumb.Item>
                <Link to={`/categories/${category.parentCategory.id}`}>
                  {category.parentCategory.name}
                </Link>
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item>
              {category?.name ?? 'Загрузка...'}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <Link to="/categories" className="back-button">
              <FiArrowLeft size={20} className="back-button-icon" /> 
              <span>Назад к категориям</span>
            </Link>
            
            <Title level={2} className="gradient-text" style={{ margin: 0 }}>
              {category?.name ?? 'Загрузка...'}
            </Title>
            <Tag color="blue" className="tag-blue">
              {totalBooks} книг
            </Tag>
          </div>
      
          <Paragraph className="info-paragraph">
            Исследуйте нашу коллекцию книг в категории "{category?.name ?? 'Загрузка...'}".
            Выберите интересующую вас книгу для просмотра подробной информации.
          </Paragraph>

          {/* Панель поиска и фильтров в локальном режиме */}
          <SearchFilterPanel
            data={books}
            onFilteredDataChange={handleFilteredDataChange}
            onSortChange={handleSortChange}
            onViewModeChange={handleViewModeChange}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDirection={sortDirection}
            viewMode={viewMode}
            totalItems={isFilteringActive ? filteredBooks.length : totalBooks}
            onResetPage={handleResetPage}
            searchMode="local"
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : paginatedBooks.length === 0 ? (
            <Empty description="Книги не найдены" />
          ) : (
            <>
              <BookList 
                books={paginatedBooks}
                viewMode={viewMode}
              />

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Pagination
                  currentPage={page}
                  totalPages={isFilteringActive ? Math.ceil(filteredBooks.length / pageSize) : totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default CategoryBooksPage; 
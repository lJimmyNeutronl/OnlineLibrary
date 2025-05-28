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
import type { ViewMode, SortOption } from '@/components/common/SearchFilterPanel';
import { useCategoryDetails } from '@/hooks/useCategoryDetails';
import { fadeIn } from '@/styles/animations';
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
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const pageSize = 15;

  const { category } = useCategoryDetails(categoryId);

  const fetchBooks = useCallback(async (currentPage = page) => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      const response = await bookService.getBooksByCategory(Number(categoryId), {
        page: currentPage - 1,
        size: pageSize,
        sortBy: sortBy !== 'relevance' ? sortBy : undefined,
        direction: sortBy === 'year' ? 'desc' : 'asc'
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
  }, [categoryId, page, sortBy, pageSize]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
    
    // Если нет активных фильтров, запрашиваем новую страницу с сервера
    if (filteredBooks.length === 0) {
      fetchBooks(newPage);
    }
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setPage(1);
  };

  const handleResetPage = () => {
    setPage(1);
  };

  // Определяем, активна ли фильтрация
  const isFilteringActive = filteredBooks.length > 0;
  const displayBooks = isFilteringActive ? filteredBooks : books;
  
  // Пагинация на клиентской стороне для отфильтрованных результатов
  const paginatedBooks = isFilteringActive
    ? displayBooks.slice((page - 1) * pageSize, page * pageSize)
    : displayBooks;

  // Конфигурация для SearchFilterPanel
  const searchPanelProps = {
    data: books,
    onFilteredDataChange: setFilteredBooks,
    onSortChange: handleSortChange,
    onViewModeChange: setViewMode,
    searchQuery,
    sortBy,
    viewMode,
    totalItems: totalBooks,
    onResetPage: handleResetPage
  };

  return (
    <AnimatedBackground>
      <div className="category-page-container">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="category-page-content"
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

          {/* Панель поиска и фильтров */}
          <SearchFilterPanel {...searchPanelProps} />

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
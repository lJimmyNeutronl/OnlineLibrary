import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, 
  Row, 
  Col, 
  Divider, 
  Spin, 
  Empty, 
  Breadcrumb,
  Tag,
  Pagination,
  Button,
  SearchFilterPanel
} from '../components/common';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BookList } from '../components/book-card';
import categoryService from '../services/categoryService';
import bookService, { Book as BookType, PagedResponse } from '../services/bookService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import type { ViewMode, SortOption } from '../components/common/SearchFilterPanel';
import '../styles/common.css';

const { Title, Paragraph, Text } = Typography;

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  publicationYear?: number;
}

interface Category {
  id: number;
  name: string;
  parentCategory?: {
    id: number;
    name: string;
  };
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const CategoryBooksPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [books, setBooks] = useState<BookType[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  const pageSize = 15;

  // Определяем функцию fetchBooks перед её использованием
  const fetchBooks = async (page = currentPage) => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      // Используем сервис для получения книг по категории
      const response = await bookService.getBooksByCategory(parseInt(categoryId), {
        page: page - 1,
        size: pageSize,
        sortBy: sortBy !== 'relevance' ? sortBy : undefined,
        direction: sortBy === 'year' ? 'desc' : 'asc'
      });
      
      setBooks(response.content);
      setTotalBooks(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Ошибка при получении книг:', error);
    
      // При ошибке загружаем фиктивные данные для демонстрации UI
      const mockBooks: BookType[] = Array.from({ length: 24 }, (_, index) => ({
      id: index + 1,
      title: `Книга ${index + 1} категории ${categoryId}`,
      author: `Автор ${(index % 5) + 1}`,
      description: 'Краткое описание книги, дающее представление о ее содержании и основных темах.',
        coverImageUrl: `https://picsum.photos/400/600?random=${index + 1}`,
        publicationYear: 2020 - (index % 10),
        categories: []
      }));
    
      setBooks(mockBooks);
      setTotalBooks(mockBooks.length);
      setTotalPages(Math.ceil(mockBooks.length / pageSize));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (categoryId) {
          const categoryData = await categoryService.getCategoryById(parseInt(categoryId));
          
          // Проверяем, есть ли у категории родитель
          let parentCategory = undefined;
          
          // Получаем все категории
          const allCategories = await categoryService.getAllCategories();
          
          // Если у категории есть parentCategoryId, находим родителя
          if (categoryData.parentCategoryId) {
            const parent = allCategories.find(c => c.id === categoryData.parentCategoryId);
            if (parent) {
              parentCategory = {
                id: parent.id,
                name: parent.name
              };
            }
          }
          
          setCategory({
            id: categoryData.id,
            name: categoryData.name,
            parentCategory
          });
        }
      } catch (error) {
        console.error('Ошибка при получении данных категории:', error);
      }
    };

    fetchCategory();
    fetchBooks();
  }, [categoryId, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    
    // Если нет активных фильтров, запрашиваем новую страницу с сервера
    if (filteredBooks.length === 0) {
      fetchBooks(page);
    }
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Обработчик для сброса страницы на первую
  const handleResetPage = () => {
    setCurrentPage(1);
  };

  // Определяем, какие книги отображать - отфильтрованные или все
  const displayBooks = filteredBooks.length > 0 ? filteredBooks : books;
  
  // Пагинация на клиентской стороне для отфильтрованных результатов
  const paginatedBooks = filteredBooks.length > 0
    ? displayBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : displayBooks;

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
                <Link to={`/categories/${category.parentCategory.id}`}>{category.parentCategory.name}</Link>
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item>
              {category?.name || 'Загрузка...'}
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
              {category?.name || 'Загрузка...'}
            </Title>
            <Tag color="blue" style={{ 
              marginLeft: '12px',
              backgroundColor: 'rgba(55, 105, 245, 0.1)',
              color: '#3769f5',
              border: '1px solid rgba(55, 105, 245, 0.3)',
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '0 10px'
            }}>
              {totalBooks} книг
            </Tag>
          </div>
      
          <Paragraph className="info-paragraph">
            Исследуйте нашу коллекцию книг в категории "{category?.name || 'Загрузка...'}".
            Выберите интересующую вас книгу для просмотра подробной информации.
          </Paragraph>

          {/* Панель поиска и фильтров */}
          <SearchFilterPanel
            data={books}
            onFilteredDataChange={setFilteredBooks}
            onSortChange={handleSortChange}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            sortBy={sortBy}
            viewMode={viewMode}
            totalItems={totalBooks}
            onResetPage={handleResetPage}
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
              currentPage={currentPage}
              totalPages={filteredBooks.length > 0 ? Math.ceil(filteredBooks.length / pageSize) : totalPages}
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
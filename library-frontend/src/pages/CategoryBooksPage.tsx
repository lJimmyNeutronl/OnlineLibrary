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
  Select,
  Input
} from '../components/common';
import { FiArrowLeft, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import { BsSearch } from 'react-icons/bs';
import { FaBook, FaBookOpen, FaBookReader, FaPencilAlt, FaGraduationCap, FaFeatherAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import BookCard from '../components/books/BookCard';
import categoryService from '../services/categoryService';
import bookService, { Book as BookType, PagedResponse } from '../services/bookService';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Стили для анимаций фоновых элементов
const floatAnimation = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [0, -15, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

const rotateAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 60,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1, opacity: 0.05 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.05, 0.08, 0.05],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

type ViewMode = 'grid' | 'list';
type SortOption = 'title' | 'author' | 'year' | 'relevance';

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
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [yearFilter, setYearFilter] = useState<{min: number, max: number} | null>(null);
  const pageSize = 12;

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

    const fetchBooks = async () => {
      if (!categoryId) return;
      
    setLoading(true);
      try {
        // Используем сервис для получения книг по категории
        const response = await bookService.getBooksByCategory(parseInt(categoryId), {
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

    fetchCategory();
    fetchBooks();
  }, [categoryId, currentPage, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Фильтруем локально, если у нас уже есть книги
    if (books.length > 0 && query.trim() !== '') {
      const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) || 
        book.author.toLowerCase().includes(query.toLowerCase())
      );
      
      setFilteredBooks(filteredBooks);
      setCurrentPage(1);
    } else {
      // Сбрасываем фильтрацию
      setFilteredBooks([]);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Локальная фильтрация 
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  
  // Применяем годовой фильтр к текущим книгам
  useEffect(() => {
    // Если есть фильтр по году, применяем его
    if (yearFilter) {
      const filtered = books.filter(book => 
        book.publicationYear !== undefined && 
        book.publicationYear >= yearFilter.min && 
        book.publicationYear <= yearFilter.max
      );
      setFilteredBooks(filtered);
    } else if (searchQuery.trim() !== '') {
      // Если есть поисковый запрос, оставляем фильтрацию по нему
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      // Если нет фильтров, сбрасываем фильтрацию
      setFilteredBooks([]);
    }
  }, [yearFilter, books, searchQuery]);

  // Получаем книги для отображения
  const displayBooks = filteredBooks.length > 0 ? filteredBooks : books;
  
  // Получаем книги для текущей страницы (только если используем локальную фильтрацию)
  const paginatedBooks = filteredBooks.length > 0 
    ? displayBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : displayBooks;

  return (
    <div className="category-books-container" style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      padding: '40px 0'
    }}>
      {/* Анимированные декоративные элементы */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          top: '-150px',
          right: '-100px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.08,
          transform: 'rotate(15deg)',
        }}
      >
        <FaBookOpen size={300} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          bottom: '-100px',
          left: '-100px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.06,
        }}
      >
        <FaGraduationCap size={250} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pulseAnimation}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          top: '30%',
          right: '10%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FaPencilAlt size={150} color="#3769f5" />
      </motion.div>

      {/* Новый декоративный элемент */}
      <motion.div 
        initial={{ rotate: -15, x: 0 }}
        animate={{
          rotate: [-15, -10, -15],
          x: [0, 10, 0],
          transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }}
        style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          top: '15%',
          left: '8%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.07,
        }}
      >
        <FaFeatherAlt size={150} color="#3769f5" />
      </motion.div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 20px', 
        position: 'relative', 
        zIndex: 1 
      }}>
        {/* Хлебные крошки */}
        <Breadcrumb style={{ 
          marginBottom: '16px', 
          background: 'rgba(55, 105, 245, 0.1)', 
          padding: '8px 16px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
        <Breadcrumb.Item>
          <Link to="/" style={{ color: '#3769f5' }}>Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/categories" style={{ color: '#3769f5' }}>Категории</Link>
        </Breadcrumb.Item>
          {category?.parentCategory && (
            <Breadcrumb.Item>
              <Link to={`/categories/${category.parentCategory.id}`} style={{ color: '#3769f5' }}>
                {category.parentCategory.name}
              </Link>
            </Breadcrumb.Item>
          )}
        <Breadcrumb.Item style={{ color: '#8e54e9' }}>{category?.name || 'Загрузка...'}</Breadcrumb.Item>
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
          {/* Заголовок категории */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '24px',
            position: 'relative'
          }}>
            <Link to="/categories" style={{ 
              marginRight: '16px', 
              display: 'flex', 
              alignItems: 'center',
              color: '#3769f5',
              textDecoration: 'none',
              padding: '6px 12px',
              background: 'rgba(55, 105, 245, 0.07)',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}>
              <FiArrowLeft size={20} style={{ marginRight: '4px' }} /> 
              <span>Назад к категориям</span>
            </Link>
            <Title level={2} style={{ 
              margin: 0,
              backgroundImage: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
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
      
          <Paragraph style={{ 
            marginBottom: '30px', 
            padding: '16px',
            background: 'rgba(55, 105, 245, 0.04)',
            borderRadius: '8px',
            borderLeft: '4px solid #3769f5',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#444',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            Исследуйте нашу коллекцию книг в категории "{category?.name || 'Загрузка...'}".
            Выберите интересующую вас книгу для просмотра подробной информации.
          </Paragraph>

          {/* Панель инструментов (сортировка, фильтрация, вид отображения) */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            background: '#f5f7fa',
            padding: '12px 16px',
            borderRadius: '8px',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Input 
                placeholder="Поиск по названию или автору" 
                prefix={<BsSearch color="#3769f5" />} 
                style={{ width: '280px' }}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onBlur={() => handleSearch(searchQuery)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              />
              <Button 
                icon={<FiFilter />} 
                onClick={toggleFilters}
                style={{ 
                  background: showFilters ? '#3769f5' : 'white',
                  color: showFilters ? 'white' : '#3769f5',
                }}
              >
                Фильтры
              </Button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ marginRight: '8px' }}>Сортировка:</span>
              <Select 
                defaultValue="relevance" 
                style={{ width: 160 }} 
                onChange={handleSortChange}
                value={sortBy}
                options={[
                  { value: 'relevance', label: 'По релевантности' },
                  { value: 'title', label: 'По названию' },
                  { value: 'author', label: 'По автору' },
                  { value: 'year', label: 'По году' },
                ]}
              />
              
              <div style={{ marginLeft: '16px', display: 'flex', gap: '8px' }}>
                <Button 
                  icon={<FiGrid />} 
                  onClick={() => setViewMode('grid')}
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                />
                <Button 
                  icon={<FiList />} 
                  onClick={() => setViewMode('list')}
                  type={viewMode === 'list' ? 'primary' : 'default'}
                />
              </div>
            </div>
          </div>
          
          {/* Фильтры (появляются при нажатии на кнопку Фильтры) */}
          {showFilters && (
            <div style={{ 
              padding: '16px',
              backgroundColor: '#f5f7fa',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <Title level={5}>Фильтры</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div>
                    <div style={{ marginBottom: '8px' }}>Год издания</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Select 
                        placeholder="От" 
                        style={{ width: '100%' }}
                        onChange={(value: number) => setYearFilter(prev => ({ min: value, max: prev?.max || 2023 }))}
                        options={Array.from({ length: 50 }, (_, i) => ({ 
                          value: 2023 - i, 
                          label: (2023 - i).toString() 
                        }))}
                      />
                      <span>-</span>
                      <Select 
                        placeholder="До" 
                        style={{ width: '100%' }}
                        onChange={(value: number) => setYearFilter(prev => ({ min: prev?.min || 1970, max: value }))}
                        options={Array.from({ length: 50 }, (_, i) => ({ 
                          value: 2023 - i, 
                          label: (2023 - i).toString() 
                        }))}
                      />
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={16}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <Button style={{ marginRight: '8px' }} onClick={() => {
                      setYearFilter(null);
                      setSearchQuery('');
                      setFilteredBooks([]);
                    }}>
                      Сбросить
                    </Button>
                    <Button type="primary" onClick={() => {
                      setShowFilters(false);
                    }}>
                      Применить
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : paginatedBooks.length === 0 ? (
        <Empty description="Книги не найдены" />
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
                {viewMode === 'grid' ? (
                  <div className="book-grid">
                    {paginatedBooks.map((book) => (
                      <motion.div key={book.id} variants={fadeIn} className="motion-container">
                        <BookCard
                          id={book.id}
                          title={book.title}
                          author={book.author}
                          coverImageUrl={book.coverImageUrl || 'https://via.placeholder.com/180x250?text=Нет+обложки'}
                          publicationYear={book.publicationYear || undefined}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {paginatedBooks.map((book) => (
                      <motion.div key={book.id} variants={fadeIn}>
                        <Link to={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div 
                            style={{
                              display: 'flex',
                              padding: '16px',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                              backgroundColor: 'white',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            className="list-item-hover"
                          >
                            <div 
                              style={{ 
                                width: '100px', 
                                height: '150px', 
                                overflow: 'hidden',
                                borderRadius: '4px',
                                marginRight: '16px',
                                flexShrink: 0
                              }}
                            >
                            <img 
                                src={book.coverImageUrl || 'https://via.placeholder.com/100x150?text=Нет+обложки'} 
                              alt={book.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{book.title}</h3>
                              <div style={{ marginBottom: '8px' }}>
                              <Text strong>{book.author}</Text>
                              </div>
                              <div style={{ marginBottom: '16px' }}>
                                <Text type="secondary">{book.publicationYear || 'Год не указан'} г.</Text>
                              </div>
                              <Paragraph 
                                style={{ color: '#666', marginBottom: 0 }}
                              >
                                {book.description && book.description.length > 120 ? `${book.description.substring(0, 120)}...` : (book.description || 'Описание отсутствует')}
                              </Paragraph>
                            </div>
                          </div>
                    </Link>
                  </motion.div>
              ))}
                  </div>
                )}
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Pagination
              current={currentPage}
                  total={filteredBooks.length > 0 ? filteredBooks.length : totalBooks}
              pageSize={pageSize}
              onChange={handlePageChange}
            />
          </div>
        </>
      )}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryBooksPage; 
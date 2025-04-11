import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, 
  Row, 
  Col, 
  Card, 
  Input, 
  Select, 
  Divider, 
  Spin, 
  Empty, 
  Breadcrumb,
  Pagination,
  Tag,
  Space
} from 'antd';
import { SearchOutlined, FilterOutlined, BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Meta } = Card;

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  publicationYear: number;
  categories: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
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

const BooksPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const pageSize = 9;

  useEffect(() => {
    // Имитация загрузки категорий
    const mockCategories: Category[] = [
      { id: 1, name: 'Фантастика' },
      { id: 2, name: 'Детективы' },
      { id: 3, name: 'Научная литература' },
      { id: 4, name: 'История' },
      { id: 5, name: 'Искусство' },
      { id: 6, name: 'Романы' },
    ];
    setCategories(mockCategories);
  }, []);

  useEffect(() => {
    // Имитация загрузки книг
    setLoading(true);

    setTimeout(() => {
      // Генерация тестовых данных
      const mockBooks: Book[] = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        title: `Книга ${index + 1}`,
        author: `Автор ${(index % 5) + 1}`,
        description: 'Краткое описание книги, дающее представление о ее содержании и основных темах.',
        coverImageUrl: `https://picsum.photos/200/300?random=${index + 1}`,
        publicationYear: 2020 - (index % 10),
        categories: [
          { id: (index % 6) + 1, name: getRandomCategory((index % 6) + 1) }
        ]
      }));
      
      // Применение фильтров
      let filteredBooks = [...mockBooks];
      
      if (searchQuery) {
        filteredBooks = filteredBooks.filter(book => 
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (selectedCategory) {
        filteredBooks = filteredBooks.filter(book => 
          book.categories.some(cat => cat.id === selectedCategory)
        );
      }
      
      if (selectedYear) {
        filteredBooks = filteredBooks.filter(book => 
          book.publicationYear === selectedYear
        );
      }
      
      setBooks(filteredBooks);
      setTotalBooks(filteredBooks.length);
      setLoading(false);
    }, 1000);
  }, [searchQuery, selectedCategory, selectedYear]);

  const getRandomCategory = (id: number): string => {
    const categoriesMap = {
      1: 'Фантастика',
      2: 'Детективы',
      3: 'Научная литература',
      4: 'История',
      5: 'Искусство',
      6: 'Романы'
    };
    return (categoriesMap as any)[id] || 'Категория';
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    navigate(`/books?q=${encodeURIComponent(value)}`);
  };

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleYearChange = (value: number | null) => {
    setSelectedYear(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const paginatedBooks = books.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Уникальные годы для фильтра
  const availableYears = Array.from(
    new Set(books.map(book => book.publicationYear))
  ).sort((a, b) => b - a);

  return (
    <div className="books-container" style={{ padding: '24px 0' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/">Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Книги</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginBottom: '24px' }}>
        Книги нашей библиотеки
      </Title>
      
      <Paragraph style={{ marginBottom: '32px' }}>
        Исследуйте нашу коллекцию книг. Используйте поиск и фильтры, чтобы найти интересующие вас издания.
      </Paragraph>
      
      <div style={{ marginBottom: '32px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Поиск по названию или автору"
              allowClear
              enterButton={<><SearchOutlined /> Найти</>}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <FilterOutlined /> <Text strong>Категория:</Text>
            </Space>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              placeholder="Выберите категорию"
              allowClear
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <FilterOutlined /> <Text strong>Год издания:</Text>
            </Space>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              placeholder="Выберите год"
              allowClear
              onChange={handleYearChange}
              value={selectedYear}
            >
              {availableYears.map(year => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <Divider />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : paginatedBooks.length === 0 ? (
        <Empty 
          description={
            <span>
              Книги не найдены. Попробуйте изменить параметры поиска.
            </span>
          } 
        />
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <Text>Найдено книг: {totalBooks}</Text>
          </div>
        
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <Row gutter={[24, 24]}>
              {paginatedBooks.map((book) => (
                <Col xs={24} sm={12} md={8} key={book.id}>
                  <motion.div 
                    variants={fadeIn}
                    whileHover={{ y: -5 }}
                  >
                    <Link to={`/books/${book.id}`}>
                      <Card
                        hoverable
                        cover={
                          <div style={{ height: '260px', overflow: 'hidden' }}>
                            <img 
                              alt={book.title} 
                              src={book.coverImageUrl} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        }
                        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
                      >
                        <Meta 
                          title={book.title} 
                          description={
                            <div>
                              <Text strong>{book.author}</Text>
                              <div>
                                <Text type="secondary">{book.publicationYear} г.</Text>
                              </div>
                              <div style={{ marginTop: '8px' }}>
                                {book.categories.map(category => (
                                  <Tag color="blue" key={category.id} style={{ marginRight: '4px' }}>
                                    {category.name}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          } 
                        />
                      </Card>
                    </Link>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalBooks}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BooksPage; 
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, 
  Row, 
  Col, 
  Card, 
  Divider, 
  Spin, 
  Empty, 
  Breadcrumb,
  Tag,
  Rate,
  Pagination
} from '../components/common';
import { FiArrowLeft, FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  publicationYear: number;
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

const CategoryBooksPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const pageSize = 9;

  useEffect(() => {
    // Имитация загрузки данных с сервера
    setLoading(true);

    setTimeout(() => {
      // Мок данных категории
      const mockCategory = {
        id: parseInt(categoryId || '0'),
        name: getCategoryNameById(parseInt(categoryId || '0'))
      };
      
      // Мок данных книг (в реальном приложении это будет API-запрос)
      const mockBooks: Book[] = Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        title: `Книга ${index + 1} категории ${categoryId}`,
        author: `Автор ${(index % 5) + 1}`,
        description: 'Краткое описание книги, дающее представление о ее содержании и основных темах.',
        coverImageUrl: `https://picsum.photos/200/300?random=${index + 1}`,
        publicationYear: 2020 - (index % 10)
      }));
      
      setCategory(mockCategory);
      setBooks(mockBooks);
      setTotalBooks(mockBooks.length);
      setLoading(false);
    }, 1000);
  }, [categoryId]);

  const getCategoryNameById = (id: number): string => {
    const categories = {
      1: 'Фантастика',
      2: 'Детективы',
      3: 'Научная литература',
      4: 'История',
      5: 'Искусство',
      6: 'Романы',
      7: 'Психология',
      8: 'Бизнес',
      9: 'Компьютерная литература',
      10: 'Хобби и досуг'
    };
    return (categories as any)[id] || 'Неизвестная категория';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // В реальном приложении здесь будет API-запрос для получения книг с новой страницы
  };

  const paginatedBooks = books.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="category-books-container" style={{ padding: '24px 0' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/">Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/categories">Категории</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{category?.name || 'Загрузка...'}</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/categories" style={{ marginRight: '16px' }}>
          <FiArrowLeft size={20} /> Назад к категориям
        </Link>
        <Title level={2} style={{ margin: 0 }}>
          {category?.name || 'Загрузка...'}
        </Title>
        <Tag color="blue" style={{ marginLeft: '12px' }}>
          {totalBooks} книг
        </Tag>
      </div>
      
      <Paragraph style={{ marginBottom: '32px' }}>
        Исследуйте нашу коллекцию книг в категории "{category?.name || 'Загрузка...'}".
        Выберите интересующую вас книгу для просмотра подробной информации.
      </Paragraph>

      <Divider />

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
                                <Rate disabled defaultValue={4} style={{ fontSize: '14px' }} />
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
              total={totalBooks}
              pageSize={pageSize}
              onChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryBooksPage; 
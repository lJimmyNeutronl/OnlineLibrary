import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Row, 
  Col, 
  Card,
  Divider, 
  Spin, 
  Empty, 
  Breadcrumb,
  Button,
  Tag,
  Rate,
  Tabs,
  Space,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  BookOutlined, 
  HeartOutlined, 
  HeartFilled,
  ReadOutlined, 
  DownloadOutlined, 
  ShareAltOutlined,
  UserOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks/reduxHooks';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

interface BookDetail {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  publicationYear: number;
  publisher: string;
  language: string;
  pageCount: number;
  isbn: string;
  categories: { id: number; name: string }[];
  fileUrl: string;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const BookDetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    // Имитация загрузки данных с сервера
    setLoading(true);

    setTimeout(() => {
      // Мок данных книги (в реальном приложении это будет API-запрос)
      const mockBook: BookDetail = {
        id: parseInt(bookId || '0'),
        title: `Книга ${bookId}`,
        author: 'Известный Автор',
        description: 'Подробное описание книги, рассказывающее о сюжете, главных героях и основных темах произведения. Здесь может быть аннотация или краткий обзор, дающий представление о книге и ее особенностях.',
        coverImageUrl: `https://picsum.photos/400/600?random=${bookId}`,
        publicationYear: 2020,
        publisher: 'Издательство "Книжный мир"',
        language: 'Русский',
        pageCount: 320,
        isbn: `978-3-16-148410-${bookId}`,
        categories: [
          { id: 1, name: 'Фантастика' },
          { id: 6, name: 'Романы' }
        ],
        fileUrl: 'https://example.com/books/sample.pdf'
      };
      
      setBook(mockBook);
      setLoading(false);
    }, 1000);
  }, [bookId]);

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      message.warning('Для добавления книги в избранное необходимо авторизоваться');
      return;
    }
    
    // В реальном приложении здесь будет API-запрос для добавления/удаления из избранного
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? 'Книга удалена из избранного' : 'Книга добавлена в избранное');
  };

  const startReading = () => {
    if (!isAuthenticated) {
      message.warning('Для чтения книги необходимо авторизоваться');
      return;
    }
    
    // В реальном приложении здесь будет переход на страницу чтения книги
    navigate(`/books/${bookId}/read`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return <Empty description="Книга не найдена" />;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="book-detail-container" 
      style={{ padding: '24px 0' }}
    >
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/">Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/books">Книги</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: '16px' }}>
        <Link to="/books">
          <ArrowLeftOutlined /> Назад к списку книг
        </Link>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={book.coverImageUrl}
                alt={book.title}
                style={{ maxWidth: '100%', borderRadius: '8px' }}
              />
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <Button 
                type="primary" 
                icon={<ReadOutlined />} 
                size="large" 
                block
                onClick={startReading}
                style={{ marginBottom: '12px' }}
              >
                Читать онлайн
              </Button>
              
              <Button 
                icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                size="large"
                block
                onClick={toggleFavorite}
                style={{ marginBottom: '12px' }}
              >
                {isFavorite ? 'В избранном' : 'Добавить в избранное'}
              </Button>
              
              <Button 
                icon={<DownloadOutlined />}
                size="large"
                block
                style={{ marginBottom: '12px' }}
              >
                Скачать
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Title level={2} style={{ marginTop: 0 }}>{book.title}</Title>
          
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '18px' }}>{book.author}</Text>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <Rate disabled defaultValue={4.5} allowHalf />{' '}
            <Text type="secondary">(25 отзывов)</Text>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            {book.categories.map(category => (
              <Tag color="blue" key={category.id} style={{ marginRight: '8px' }}>
                <Link to={`/categories/${category.id}`} style={{ color: 'inherit' }}>
                  {category.name}
                </Link>
              </Tag>
            ))}
          </div>
          
          <Divider />
          
          <Tabs defaultActiveKey="description">
            <TabPane tab="Описание" key="description">
              <Paragraph>{book.description}</Paragraph>
            </TabPane>
            
            <TabPane tab="Информация" key="info">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Год издания:</Text>
                  <Paragraph>{book.publicationYear}</Paragraph>
                </Col>
                <Col span={12}>
                  <Text strong>Издательство:</Text>
                  <Paragraph>{book.publisher}</Paragraph>
                </Col>
                <Col span={12}>
                  <Text strong>Язык:</Text>
                  <Paragraph>{book.language}</Paragraph>
                </Col>
                <Col span={12}>
                  <Text strong>Количество страниц:</Text>
                  <Paragraph>{book.pageCount}</Paragraph>
                </Col>
                <Col span={24}>
                  <Text strong>ISBN:</Text>
                  <Paragraph>{book.isbn}</Paragraph>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="Отзывы" key="reviews">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Empty 
                  description="Пока нет отзывов" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button type="primary" style={{ marginTop: '16px' }}>
                  Оставить отзыв
                </Button>
              </div>
            </TabPane>
          </Tabs>
          
          <Divider />
          
          <Space>
            <Button icon={<ShareAltOutlined />}>Поделиться</Button>
            <Button icon={<UserOutlined />}>Другие книги автора</Button>
          </Space>
        </Col>
      </Row>
    </motion.div>
  );
};

export default BookDetailPage; 
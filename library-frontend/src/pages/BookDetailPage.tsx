import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Typography from '../components/common/Typography';
import Row from '../components/common/Row';
import Col from '../components/common/Col';
import Card from '../components/common/Card';
import Divider from '../components/common/Divider';
import Spin from '../components/common/Spin';
import Empty from '../components/common/Empty';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import Tag from '../components/common/Tag';
import Rate from '../components/common/Rate';
import Tabs, { TabPane } from '../components/common/Tabs';
import Space from '../components/common/Space';
import message from '../components/common/message';
import { FiArrowLeft, FiUser, FiHeart, FiBookOpen, FiDownload, FiShare2, FiCalendar, FiBook, FiFlag, FiHash } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks/reduxHooks';
import bookService, { Book } from '../services/bookService';
import { FaBookOpen, FaBookReader, FaPencilAlt, FaGraduationCap, FaFeatherAlt } from 'react-icons/fa';

const { Title, Paragraph, Text } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
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

const BookDetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      setLoading(true);
      try {
        const bookData = await bookService.getBookById(parseInt(bookId));
        setBook(bookData);
        
        // Загружаем похожие книги из той же категории
        if (bookData.categories && bookData.categories.length > 0) {
          const randomCategoryId = bookData.categories[0].id;
          const response = await bookService.getBooksByCategory(randomCategoryId, { 
            size: 4
          });
          // Фильтруем, чтобы исключить текущую книгу
          const filtered = response.content.filter(b => b.id !== bookData.id);
          setRelatedBooks(filtered.slice(0, 3)); // Берем только 3 книги
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных книги:', error);
        message.error('Не удалось загрузить данные книги');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
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
    <div className="book-detail-container" style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px 0'
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
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Breadcrumb style={{ 
            marginBottom: '16px', 
            background: 'rgba(255, 255, 255, 0.7)', 
            padding: '8px 16px', 
            borderRadius: '8px' 
          }}>
            <Breadcrumb.Item>
              <Link to="/">Главная</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/books">Книги</Link>
            </Breadcrumb.Item>
            {book.categories && book.categories.length > 0 && (
              <Breadcrumb.Item>
                <Link to={`/categories/${book.categories[0].id}`}>
                  {book.categories[0].name}
                </Link>
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ marginBottom: '16px' }}>
            <Link to="/books" style={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#3769f5',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              <FiArrowLeft size={18} style={{ marginRight: '8px' }} /> Назад к списку книг
            </Link>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=Нет+обложки'}
                      alt={book.title}
                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                  </div>
                  
                  <div style={{ marginTop: '24px' }}>
                    <Button 
                      type="primary" 
                      icon={<FiBookOpen size={18} />} 
                      size="large" 
                      block
                      onClick={startReading}
                      style={{ 
                        marginBottom: '12px',
                        height: '48px',
                        fontWeight: 500,
                        fontSize: '16px'
                      }}
                    >
                      Читать онлайн
                    </Button>
                    
                    <Button 
                      icon={isFavorite ? <AiFillHeart size={18} color="#ff4d4f" /> : <FiHeart size={18} />}
                      size="large"
                      block
                      onClick={toggleFavorite}
                      style={{ 
                        marginBottom: '12px',
                        height: '44px'
                      }}
                    >
                      {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                    </Button>
                    
                    <Button 
                      icon={<FiDownload size={18} />}
                      size="large"
                      block
                      style={{ marginBottom: '12px', height: '44px' }}
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
                  {book.categories && book.categories.map(category => (
                    <Tag color="blue" key={category.id} style={{ marginRight: '8px', padding: '4px 10px' }}>
                      <Link to={`/categories/${category.id}`} style={{ color: 'inherit' }}>
                        {category.name}
                      </Link>
                    </Tag>
                  ))}
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div>
                  <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {book.description || 'Описание отсутствует'}
                  </Paragraph>
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {book.publicationYear && (
                    <div className="book-info-item">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiCalendar style={{ marginRight: '8px', color: '#3769f5' }} />
                        <Text strong>Год издания:</Text>
                      </div>
                      <div>{book.publicationYear}</div>
                    </div>
                  )}
                  
                  {book.publisher && (
                    <div className="book-info-item">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiBook style={{ marginRight: '8px', color: '#3769f5' }} />
                        <Text strong>Издательство:</Text>
                      </div>
                      <div>{book.publisher}</div>
                    </div>
                  )}
                  
                  {book.language && (
                    <div className="book-info-item">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiFlag style={{ marginRight: '8px', color: '#3769f5' }} />
                        <Text strong>Язык:</Text>
                      </div>
                      <div>{book.language}</div>
                    </div>
                  )}
                  
                  {book.pageCount && (
                    <div className="book-info-item">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiBookOpen style={{ marginRight: '8px', color: '#3769f5' }} />
                        <Text strong>Страниц:</Text>
                      </div>
                      <div>{book.pageCount}</div>
                    </div>
                  )}
                  
                  {book.isbn && (
                    <div className="book-info-item">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiHash style={{ marginRight: '8px', color: '#3769f5' }} />
                        <Text strong>ISBN:</Text>
                      </div>
                      <div>{book.isbn}</div>
                    </div>
                  )}
                </div>

                {relatedBooks.length > 0 && (
                  <>
                    <Divider>Похожие книги</Divider>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      {relatedBooks.map(relatedBook => (
                        <Link key={relatedBook.id} to={`/books/${relatedBook.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ 
                            width: '120px', 
                            textAlign: 'center',
                            transition: 'transform 0.2s'
                          }}
                          className="related-book-item"
                          >
                            <img 
                              src={relatedBook.coverImageUrl || 'https://via.placeholder.com/120x180?text=Нет+обложки'} 
                              alt={relatedBook.title}
                              style={{ 
                                width: '120px', 
                                height: '180px', 
                                objectFit: 'cover',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 500, height: '40px', overflow: 'hidden' }}>
                              {relatedBook.title}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetailPage; 
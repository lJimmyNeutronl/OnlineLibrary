import { useState, useEffect, useRef } from 'react';
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
import Space from '../components/common/Space';
import message from '../components/common/message';
import { FiArrowLeft, FiUser, FiHeart, FiBookOpen, FiCalendar, FiBook, FiFlag, FiHash } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks/reduxHooks';
import bookService, { Book } from '../services/bookService';
import { FaBookOpen, FaGraduationCap, FaInfoCircle, FaComments, FaBookmark } from 'react-icons/fa';
import BookRating from '../components/rating/BookRating';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import BookCard from '../components/books/BookCard';
import '../styles/bookDetail.css';

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [userHasReview, setUserHasReview] = useState<boolean>(false);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      setLoading(true);
      try {
        const bookData = await bookService.getBookById(parseInt(bookId));
        setBook(bookData);
        
        // Загружаем книги из той же категории
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

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      // Получаем высоту хедера - предполагаем, что он 64px (можно заменить на фактическую)
      const headerHeight = 64;
      // Добавляем дополнительный отступ для приятного просмотра
      const additionalOffset = 24;
      
      const reviewsPosition = reviewsSection.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = reviewsPosition - headerHeight - additionalOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Обработчик успешного добавления отзыва
  const handleReviewSuccess = (newReview: any) => {
    // Обновление списка отзывов после добавления нового
    setReviews(prevReviews => [newReview, ...prevReviews]);
    
    // Показываем уведомление об успешном добавлении
    message.success('Отзыв успешно опубликован!');
    
    // Обновляем счетчик отзывов
    if (book) {
      const reviewsCount = (book.reviewsCount || 0) + 1;
      setBook({...book, reviewsCount});
    }
    
    // Очищаем форму
    setReviewText('');
    setReviewRating(0);
    setCharCount(0);
  };

  // Обработчик изменения рейтинга из компонента BookRating
  const handleBookRatingChange = (rating: number) => {
    setReviewRating(rating);
  };

  // Создаем слушатель события для отслеживания изменений рейтинга
  useEffect(() => {
    const handleRatingEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.rating === 'number') {
        setReviewRating(customEvent.detail.rating);
      }
    };
    
    document.addEventListener('book-rating-change' as any, handleRatingEvent);
    
    return () => {
      document.removeEventListener('book-rating-change' as any, handleRatingEvent);
    };
  }, []);

  // Вспомогательные функции для склонения слов
  const getOcenokText = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'оценка';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'оценки';
    } else {
      return 'оценок';
    }
  };
  
  const getReviewsText = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'отзыв';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'отзыва';
    } else {
      return 'отзывов';
    }
  };

  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReviewText(newText);
    setCharCount(newText.length);
  };
  
  const handleReviewSubmit = async () => {
    const minCharCount = 10;
    
    if (reviewRating === 0) {
      setReviewError('Пожалуйста, выберите рейтинг');
      return;
    }

    if (reviewText.trim().length < minCharCount) {
      setReviewError(`Отзыв должен содержать не менее ${minCharCount} символов`);
      return;
    }
    
    setReviewError(null);
    setSubmitting(true);
    
    try {
      // Делаем реальный API-запрос через bookService
      const newReview = await bookService.addReview(
        parseInt(bookId || '0'),
        reviewText,
        reviewRating
      );
      
      // Вызываем обработчик успешного добавления отзыва
      handleReviewSuccess(newReview);
      
      // Отправляем событие о добавлении отзыва для обновления списка отзывов
      const reviewAddedEvent = new CustomEvent('review-added', {
        detail: { review: newReview },
        bubbles: true
      });
      document.dispatchEvent(reviewAddedEvent);
      
      message.success('Ваш отзыв успешно опубликован!');
      
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      setReviewError('Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
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
    <div className="book-detail-container">
      {/* Анимированные декоративные элементы */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        className="book-detail-decorative top-right"
      >
        <FaBookOpen size={300} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        className="book-detail-decorative bottom-left"
      >
        <FaGraduationCap size={250} color="#3769f5" />
      </motion.div>
      
      <div ref={contentRef} className="book-detail-content">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Хлебные крошки */}
          <Breadcrumb className="book-breadcrumb">
            <Breadcrumb.Item>
              <Link to="/" style={{ color: '#3769f5', fontWeight: 500 }}>Главная</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/books" style={{ color: '#3769f5', fontWeight: 500 }}>Книги</Link>
            </Breadcrumb.Item>
            {book.categories && book.categories.length > 0 && (
              <Breadcrumb.Item>
                <Link to={`/categories/${book.categories[0].id}`} style={{ color: '#3769f5', fontWeight: 500 }}>
                  {book.categories[0].name}
                </Link>
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item style={{ color: '#333', fontWeight: 600 }}>
              {book.title.length > 40 ? `${book.title.substring(0, 40)}...` : book.title}
            </Breadcrumb.Item>
          </Breadcrumb>

          {/* Кнопка "Назад" */}
          <div>
            <Link to="/books" className="back-link">
              <FiArrowLeft size={18} style={{ marginRight: '8px' }} /> Назад к списку книг
            </Link>
          </div>

          {/* Основной контент */}
          <div className="book-layout">
            {/* Левая колонка с обложкой и кнопками */}
            <div className="book-left-column">
              {/* Карточка с обложкой */}
              <div className="book-cover-container">
                <div className="book-cover-wrapper">
                  {/* Градиентная тень-подложка для эффекта парения */}
                  <div className="book-cover-shadow"></div>
                  
                  <img
                    src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=Нет+обложки'}
                    alt={book.title}
                    className="book-cover-img"
                    loading="eager"
                  />
                </div>
                
                <div className="book-action-buttons">
                  <Button 
                    type="primary" 
                    icon={<FiBookOpen />} 
                    onClick={startReading} 
                    block
                    size="large"
                    className="read-button"
                    style={{ 
                      background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                      boxShadow: '0 4px 15px rgba(55, 105, 245, 0.3)',
                      border: 'none'
                    }}
                  >
                    Читать онлайн
                  </Button>
                  
                  <Button 
                    icon={isFavorite ? <AiFillHeart color="#ff4d4f" /> : <FiHeart />} 
                    onClick={toggleFavorite} 
                    block
                    size="large"
                    className={`favorite-button ${isFavorite ? 'is-favorite' : 'not-favorite'}`}
                  >
                    {isFavorite ? 'В избранном' : 'В избранное'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Правая часть с основным контентом */}
            <div className="book-right-column">
              {/* Информация о книге */}
              <div className="book-info-section">
                <Title level={2} className="book-title" style={{ 
                  borderLeft: '5px solid #3769f5'
                }}>
                  {book.title}
                </Title>
                
                <div className="book-author">
                  <FiUser size={18} style={{ color: '#3769f5' }} />
                  <Text strong style={{ fontSize: '18px' }}>{book.author}</Text>
                </div>
                
                <div className="book-rating-summary">
                  <div className="rating-value">
                    <span className="star-icon">★</span>
                    <span className="rating-number">{book.rating ? book.rating.toFixed(1).replace('.', ',') : '0,0'}</span>
                  </div>
                  <div className="rating-count">
                    {book.ratingsCount || 0} {getOcenokText(book.ratingsCount || 0)}
                  </div>
                  <div className="reviews-count" onClick={scrollToReviews} role="button" tabIndex={0}>
                    <div className="reviews-count-divider"></div>
                    <span>{book.reviewsCount || 0} {getReviewsText(book.reviewsCount || 0)}</span>
                  </div>
                </div>
                
                <div className="book-category-tags">
                  {book.categories && book.categories.map(category => (
                    <Tag color="#3769f5" key={category.id} className="category-tag">
                      <Link to={`/categories/${category.id}`} style={{ color: 'inherit' }}>
                        {category.name}
                      </Link>
                    </Tag>
                  ))}
                </div>
              </div>
                
              {/* Секция Описание */}
              <div className="book-info-section">
                <div className="section-header">
                  <FaInfoCircle className="section-icon" style={{ color: '#3769f5' }} />
                  <Title level={3} style={{ margin: 0 }}>Описание</Title>
                </div>

                <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', margin: '16px 0' }}>
                  {book.description || 'Описание отсутствует'}
                </Paragraph>
                
                <Divider style={{ margin: '24px 0' }} />
                
                <div className="book-details-card">
                  <div className="book-details-section">
                    <Text className="book-details-title">Автор</Text>
                    <div className="book-author author-detail">
                      <FiUser size={16} className="label-icon" />
                      <Text strong>{book.author}</Text>
                    </div>
                  </div>
                  
                  <Divider className="book-details-divider" />
                  
                  <div className="book-details-section">
                    <Text className="book-details-title">Детали книги</Text>
                    
                    <div className="book-details-list">
                      <div className="book-details-row striped">
                        <div className="book-details-label">
                          <FiCalendar className="label-icon" />
                          Год издания
                        </div>
                        <div className="book-details-value">{book.publicationYear}</div>
                      </div>
                      <div className="book-details-row">
                        <div className="book-details-label">
                          <FiBook className="label-icon" />
                          Издательство
                        </div>
                        <div className="book-details-value">{book.publisher}</div>
                      </div>
                      <div className="book-details-row striped">
                        <div className="book-details-label">
                          <FiHash className="label-icon" />
                          ISBN
                        </div>
                        <div className="book-details-value">{book.isbn || 'Не указан'}</div>
                      </div>
                      <div className="book-details-row">
                        <div className="book-details-label">
                          <FiFlag className="label-icon" />
                          Язык
                        </div>
                        <div className="book-details-value">
                          {book.language === 'ru' ? 'Русский' : 
                           book.language === 'en' ? 'Английский' : 
                           book.language === 'fr' ? 'Французский' : 
                           book.language === 'de' ? 'Немецкий' : 
                           book.language || 'Не указан'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Секция Книги из этой же категории */}
              {relatedBooks.length > 0 && (
                <div className="book-info-section">
                  <div className="section-header">
                    <FaBookmark className="section-icon" style={{ color: '#3769f5' }} />
                    <Title level={3} style={{ margin: 0 }}>Книги из этой же категории</Title>
                  </div>

                  <div className="related-books-grid">
                    {relatedBooks.map(relatedBook => (
                      <div key={relatedBook.id} className="related-book-card">
                        <BookCard
                          id={relatedBook.id}
                          title={relatedBook.title} 
                          author={relatedBook.author}
                          coverImageUrl={relatedBook.coverImageUrl || 'https://via.placeholder.com/180x240?text=Нет+обложки'}
                          publicationYear={relatedBook.publicationYear}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Секция Отзывы */}
              <div 
                id="reviews-section"
                className="reviews-section"
              >
                <div className="reviews-header">
                  <div className="reviews-header-title">
                    <FaComments className="section-icon" />
                    <Title level={3} style={{ margin: 0 }}>Отзывы</Title>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="reviews-form-wrapper">
                    <div className="reviews-rating-block">
                      <div className="reviews-rating-title">Ваша оценка:</div>
                      <div className="reviews-rating-stars">
                        <BookRating 
                          bookId={parseInt(bookId || '0')} 
                          isAuthenticated={isAuthenticated}
                          showCount={false}
                          size={28}
                          interactive={true}
                          detailed={false}
                        />
                      </div>
                    </div>
                    
                    <div className="reviews-input-block">
                      <div className="reviews-input-header">
                        <div className="reviews-input-title">Ваш отзыв:</div>
                        <div className={`reviews-char-counter ${charCount < 10 ? 'count-error' : ''}`}>
                          {charCount}/10+ символов
                        </div>
                      </div>
                      <textarea 
                        className={`reviews-textarea ${reviewError && reviewText.trim().length < 10 ? 'input-error' : ''}`}
                        placeholder="Поделитесь своими впечатлениями о книге..."
                        rows={5}
                        value={reviewText}
                        onChange={handleReviewTextChange}
                      />
                      {reviewError && <div className="reviews-error-message">{reviewError}</div>}
                      <div className="reviews-submit-block">
                        <Button 
                          type="primary" 
                          className="reviews-submit-button"
                          loading={submitting}
                          disabled={submitting || reviewText.trim().length < 10 || reviewRating === 0}
                          onClick={handleReviewSubmit}
                        >
                          Опубликовать отзыв
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="login-prompt">
                    <FaComments style={{ opacity: 0.5, fontSize: '20px' }} />
                    <Text>Чтобы оставить отзыв и оценить книгу, <Link to="/login" className="login-link">войдите</Link> в аккаунт</Text>
                  </div>
                )}
                
                <div className="reviews-list-container">
                  <Title level={4} className="reviews-list-title">Отзывы читателей</Title>
                  <ReviewList bookId={parseInt(bookId || '0')} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Задний фон */}
      <div 
        className="book-background"
        style={{ 
          background: `linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(195, 207, 226, 0.9) 100%), 
                       url(${book.coverImageUrl || '/images/book-bg-pattern.jpg'})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      />
    </div>
  );
};

export default BookDetailPage; 
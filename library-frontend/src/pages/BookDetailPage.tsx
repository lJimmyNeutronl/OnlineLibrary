import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// Путь к плейсхолдеру
const PLACEHOLDER_IMAGE = '/src/assets/images/placeholder.png';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

// Стили для анимаций фоновых элементов - оптимизированы для производительности
const floatAnimation = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [0, -15, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
      // Оптимизированные настройки анимации
      restDelta: 0.01,
      restSpeed: 0.01
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
      ease: "linear",
      // Оптимизированные настройки анимации
      restDelta: 0.01,
      restSpeed: 0.01
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
  const [imageError, setImageError] = useState<boolean>(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Мемоизируем идентификатор книги, чтобы избежать лишних ререндеров
  const parsedBookId = useMemo(() => bookId ? parseInt(bookId) : 0, [bookId]);
  
  // Состояние для хранения отзывов пользователя для этой книги
  const [userReviews, setUserReviews] = useState<any[]>([]);
  // Состояние для отслеживания редактируемого отзыва
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  
  const fetchBookDetails = useCallback(async () => {
    if (!parsedBookId) return;
    
    setLoading(true);
    try {
      const bookData = await bookService.getBookById(parsedBookId);
      setBook(bookData);
      
      // Загружаем книги из той же категории если есть категории
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
  }, [parsedBookId]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  // Обработчик обновления рейтинга книги
  const handleRatingUpdate = useCallback(async () => {
    if (!parsedBookId) return;
    
    try {
      // Получаем обновленные данные о рейтинге
      const ratingData = await bookService.getBookRating(parsedBookId);
      
      // Обновляем информацию о книге с новыми данными о рейтинге
      setBook(prevBook => {
        if (!prevBook) return null;
        return {
          ...prevBook,
          rating: ratingData.averageRating,
          ratingsCount: ratingData.ratingCount
        };
      });
    } catch (error) {
      console.error('Ошибка при обновлении рейтинга:', error);
    }
  }, [parsedBookId]);

  // Обработчик обновления счетчика отзывов
  const handleReviewsUpdate = useCallback(async () => {
    if (!parsedBookId) return;
    
    try {
      const reviews = await bookService.getBookReviews(parsedBookId);
      setReviews(reviews);
      
      // Обновляем счетчик отзывов в информации о книге
      setBook(prevBook => {
        if (!prevBook) return null;
        return {
          ...prevBook,
          reviewsCount: reviews.length
        };
      });
    } catch (error) {
      console.error('Ошибка при обновлении отзывов:', error);
    }
  }, [parsedBookId]);

  // Слушатель события обновления рейтинга
  useEffect(() => {
    // Обработчик события изменения рейтинга
    const handleBookRatingUpdated = () => {
      handleRatingUpdate();
    };
    
    // Регистрируем обработчик события
    document.addEventListener('book-rating-change', handleBookRatingUpdated);
    
    // Удаляем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener('book-rating-change', handleBookRatingUpdated);
    };
  }, [handleRatingUpdate]);

  // Слушатель события добавления/обновления отзыва
  useEffect(() => {
    const handleReviewAdded = () => {
      handleReviewsUpdate();
    };
    
    document.addEventListener('review-added', handleReviewAdded);
    
    return () => {
      document.removeEventListener('review-added', handleReviewAdded);
    };
  }, [handleReviewsUpdate]);

  // Слушатель события обновления счетчика отзывов
  useEffect(() => {
    const handleReviewsCountUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.bookId === parsedBookId) {
        // Обновляем счетчик отзывов в информации о книге
        setBook(prevBook => {
          if (!prevBook) return null;
          return {
            ...prevBook,
            reviewsCount: customEvent.detail.count
          };
        });
      }
    };
    
    document.addEventListener('reviews-count-update', handleReviewsCountUpdate);
    
    // Проверяем наличие сохраненного счетчика отзывов при монтировании
    try {
      const savedReviewsCount = localStorage.getItem(`book_${parsedBookId}_reviews_count`);
      if (savedReviewsCount && book) {
        const count = parseInt(savedReviewsCount, 10);
        if (!isNaN(count) && book.reviewsCount !== count) {
          setBook(prevBook => {
            if (!prevBook) return null;
            return {
              ...prevBook,
              reviewsCount: count
            };
          });
        }
      }
    } catch (e) {
      console.error('Ошибка при чтении счетчика отзывов из localStorage:', e);
    }
    
    return () => {
      document.removeEventListener('reviews-count-update', handleReviewsCountUpdate);
    };
  }, [parsedBookId, book]);

  // Проверка наличия сохраненного рейтинга в localStorage
  useEffect(() => {
    if (parsedBookId && handleRatingUpdate) {
      try {
        const ratingKey = `book_${parsedBookId}_rating`;
        const savedRatingData = localStorage.getItem(ratingKey);
        
        if (savedRatingData) {
          const { rating, timestamp } = JSON.parse(savedRatingData);
          
          // Проверяем, не устарел ли рейтинг (например, старше 24 часов)
          const MAX_AGE = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
          const now = Date.now();
          
          if (now - timestamp < MAX_AGE) {
            // Если рейтинг не устарел, принудительно обновляем рейтинг книги
            handleRatingUpdate();
          }
        }
      } catch (e) {
        console.error('Ошибка при чтении рейтинга из localStorage:', e);
      }
    }
  }, [parsedBookId, handleRatingUpdate]);

  // Мемоизируем обработчики событий, чтобы избежать лишних ререндеров
  const toggleFavorite = useCallback(() => {
    if (!isAuthenticated) {
      message.warning('Для добавления книги в избранное необходимо авторизоваться');
      return;
    }
    
    // В реальном приложении здесь будет API-запрос для добавления/удаления из избранного
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? 'Книга удалена из избранного' : 'Книга добавлена в избранное');
  }, [isAuthenticated, isFavorite]);

  const startReading = useCallback(() => {
    if (!isAuthenticated) {
      message.warning('Для чтения книги необходимо авторизоваться');
      return;
    }
    
    // В реальном приложении здесь будет переход на страницу чтения книги
    navigate(`/books/${parsedBookId}/read`);
  }, [isAuthenticated, navigate, parsedBookId]);

  const scrollToReviews = useCallback(() => {
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
  }, []);

  // Обработчик успешного добавления отзыва
  const handleReviewSuccess = useCallback((newReview: any) => {
    // Обновление списка отзывов после добавления нового
    setReviews(prevReviews => {
      // Проверяем, существует ли уже отзыв с таким ID
      const existingIndex = prevReviews.findIndex(review => review.id === newReview.id);
      
      if (existingIndex >= 0) {
        // Если отзыв уже существует, обновляем его
        const updatedReviews = [...prevReviews];
        updatedReviews[existingIndex] = newReview;
        return updatedReviews;
      } else {
        // Если это новый отзыв, добавляем его в начало списка
        return [newReview, ...prevReviews];
      }
    });
    
    // Обновляем счетчик отзывов
    handleReviewsUpdate();
    
    // Очищаем форму
    setReviewText('');
    setReviewRating(0);
    setCharCount(0);
  }, [handleReviewsUpdate]);

  // Обработчик изменения рейтинга из компонента BookRating
  const handleBookRatingChange = useCallback((rating: number) => {
    setReviewRating(rating);
  }, []);

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
  const getOcenokText = useCallback((count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'оценка';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'оценки';
    } else {
      return 'оценок';
    }
  }, []);
  
  const getReviewsText = useCallback((count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'отзыв';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'отзыва';
    } else {
      return 'отзывов';
    }
  }, []);

  const handleReviewTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReviewText(newText);
    setCharCount(newText.length);
  }, []);
  
  // Загрузка отзывов пользователя при изменении bookId
  useEffect(() => {
    const loadUserReviews = async () => {
      if (!isAuthenticated || !parsedBookId) return;
      
      try {
        const reviews = await bookService.getUserReviewsForBook(parsedBookId);
        setUserReviews(reviews);
      } catch (error) {
        console.error('Ошибка при загрузке отзывов пользователя:', error);
      }
    };
    
    loadUserReviews();
  }, [isAuthenticated, parsedBookId]);

  // Загрузка всех отзывов при монтировании компонента
  useEffect(() => {
    if (parsedBookId) {
      handleReviewsUpdate();
    }
  }, [parsedBookId, handleReviewsUpdate]);

  // Функция для начала редактирования отзыва
  const startEditingReview = useCallback((review: any) => {
    setEditingReviewId(review.id);
    setReviewText(review.content);
    setReviewRating(review.rating || 0);
    setCharCount(review.content.length);
    
    // Прокрутка к форме отзыва
    const reviewFormElement = document.querySelector('.reviews-form-wrapper');
    if (reviewFormElement) {
      reviewFormElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Функция для отмены редактирования
  const cancelEditingReview = useCallback(() => {
    setEditingReviewId(null);
    setReviewText('');
    setReviewRating(0);
    setCharCount(0);
    setReviewError(null);
  }, []);

  // Обновляем handleReviewSubmit для поддержки редактирования
  const handleReviewSubmit = useCallback(async () => {
    const minCharCount = 10;
    
    if (reviewText.trim().length < minCharCount) {
      setReviewError(`Отзыв должен содержать не менее ${minCharCount} символов`);
      return;
    }
    
    setReviewError(null);
    setSubmitting(true);
    
    try {
      // Делаем реальный API-запрос через bookService с учетом ID отзыва при редактировании
      const newReview = await bookService.addReview(
        parsedBookId,
        reviewText,
        reviewRating || null,
        editingReviewId || undefined
      );
      
      // Проверяем, существовал ли уже отзыв от этого пользователя
      const existingReviewIdx = userReviews.findIndex(r => r.id === newReview.id);
      const isUpdateOperation = existingReviewIdx >= 0;
      
      // Обновляем список отзывов пользователя
      if (isUpdateOperation) {
        setUserReviews(prev => prev.map(r => r.id === newReview.id ? newReview : r));
      } else {
        setUserReviews(prev => [...prev, newReview]);
      }
      
      // Вызываем обработчик успешного добавления отзыва
      handleReviewSuccess(newReview);
      
      // Отправляем событие о добавлении отзыва для обновления списка отзывов
      const reviewAddedEvent = new CustomEvent('review-added', {
        detail: { review: newReview, isUpdate: isUpdateOperation },
        bubbles: true
      });
      document.dispatchEvent(reviewAddedEvent);
      
      // Обновляем данные о рейтинге только если была выставлена оценка
      if (reviewRating > 0) {
        handleRatingUpdate();
      }
      
      // Показываем соответствующее сообщение
      if (isUpdateOperation) {
        message.success('Ваш отзыв успешно обновлен!');
      } else {
        message.success('Ваш отзыв успешно опубликован!');
      }
      
      // Сбрасываем состояние редактирования
      cancelEditingReview();
      
    } catch (error: any) {
      console.error('Ошибка при отправке отзыва:', error);
      
      // Более информативное сообщение об ошибке
      if (error?.response?.status === 400) {
        setReviewError('Ошибка в формате отзыва. Пожалуйста, проверьте введенные данные.');
      } else if (error?.response?.status === 429) {
        setReviewError('Вы достигли лимита отзывов для этой книги (максимум 3 отзыва).');
      } else if (error?.response?.status === 404) {
        setReviewError('Отзыв не найден. Возможно, он был удален.');
      } else {
        setReviewError('Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [parsedBookId, reviewText, reviewRating, editingReviewId, userReviews, handleReviewSuccess, handleRatingUpdate, cancelEditingReview]);

  // Обработчик ошибки загрузки изображения
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

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

  // Определяем URL изображения обложки книги
  const coverImageUrl = imageError ? PLACEHOLDER_IMAGE : book.coverImageUrl || PLACEHOLDER_IMAGE;

  return (
    <div className="book-detail-container">
      {/* Анимированные декоративные элементы с lazy анимацией */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        className="book-detail-decorative top-right"
        style={{ willChange: 'transform' }}
      >
        <FaBookOpen size={300} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        className="book-detail-decorative bottom-left"
        style={{ willChange: 'transform' }}
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
                    src={coverImageUrl}
                    alt={book.title}
                    className="book-cover-img"
                    loading="eager"
                    onError={handleImageError}
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
                          coverImageUrl={relatedBook.coverImageUrl || PLACEHOLDER_IMAGE}
                          publicationYear={relatedBook.publicationYear}
                          showRating={true}
                          rating={relatedBook.rating || 0}
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
                          bookId={parsedBookId} 
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
                        <div className="reviews-input-title">
                          {editingReviewId ? 'Редактирование отзыва:' : 'Ваш отзыв:'}
                        </div>
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
                          disabled={submitting || reviewText.trim().length < 10}
                          onClick={handleReviewSubmit}
                        >
                          {editingReviewId ? 'Сохранить изменения' : 'Опубликовать отзыв'}
                        </Button>
                        
                        {editingReviewId && (
                          <Button 
                            type="default"
                            className="reviews-cancel-button"
                            onClick={cancelEditingReview}
                            style={{ marginLeft: '10px' }}
                          >
                            Отменить
                          </Button>
                        )}
                        
                        {userReviews.length >= 3 && !editingReviewId && (
                          <div className="reviews-limit-warning">
                            Достигнут лимит отзывов (максимум 3 для одной книги)
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {userReviews.length > 0 && !editingReviewId && (
                      <div className="user-reviews-section">
                        <h4>Ваши отзывы</h4>
                        <div className="user-reviews-list">
                          {userReviews.map(review => (
                            <div key={review.id} className="user-review-item">
                              <div className="user-review-content">
                                {review.content}
                              </div>
                              <div className="user-review-meta">
                                {review.rating > 0 && (
                                  <div className="user-review-rating">
                                    Ваша оценка: {review.rating}★
                                  </div>
                                )}
                                <div className="user-review-date">
                                  {new Date(review.creationDate).toLocaleDateString('ru-RU')}
                                  {review.editedDate && ' (ред.)'}
                                </div>
                              </div>
                              <div className="user-review-actions">
                                <Button 
                                  type="link" 
                                  size="small"
                                  onClick={() => startEditingReview(review)}
                                >
                                  Редактировать
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="login-prompt">
                    <FaComments style={{ opacity: 0.5, fontSize: '20px' }} />
                    <Text>Чтобы оставить отзыв и оценить книгу, <Link to="/login" className="login-link">войдите</Link> в аккаунт</Text>
                  </div>
                )}
                
                <div className="reviews-list-container">
                  <ReviewList bookId={parsedBookId} />
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
                       url(${coverImageUrl})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      />
    </div>
  );
};

export default BookDetailPage; 
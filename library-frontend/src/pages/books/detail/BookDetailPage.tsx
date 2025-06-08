import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Divider, 
  Spin, 
  Empty, 
  Breadcrumb, 
  Button, 
  Tag, 
  message 
} from '@components/common';
import AnimatedBackground from '@components/common/AnimatedBackground';
import { FiArrowLeft, FiUser, FiHeart, FiBookOpen, FiCalendar, FiBook, FiFlag, FiHash } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { useAppSelector } from '@hooks/reduxHooks';
import bookService, { Book } from '@services/bookService';
import { FaInfoCircle, FaComments, FaBookmark } from 'react-icons/fa';
import BookCard from '@components/book-card/BookCard';
import styles from './BookDetailPage.module.css';
import { useBookEvents, useFavorites, useReviews, type BookEventCallbacks } from '@hooks/index';
import { pluralizeRatings, pluralizeReviews } from '@utils/pluralization';
import BookRating from '@components/rating/BookRating';
import ReviewList from '@components/reviews/ReviewList';

const { Title, Paragraph, Text } = Typography;

// Путь к плейсхолдеру
const PLACEHOLDER_IMAGE = '/src/assets/images/placeholder.png';

const BookDetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  // Мемоизируем идентификатор книги, чтобы избежать лишних ререндеров
  const parsedBookId = useMemo(() => bookId ? parseInt(bookId) : 0, [bookId]);
  
  // Основные состояния страницы (не дублируемые в хуках)
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [imageError, setImageError] = useState<boolean>(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Callbacks для хука useBookEvents
  const onRatingUpdate = useCallback(async () => {
    if (!parsedBookId) return;
    try {
      const ratingData = await bookService.getBookRating(parsedBookId);
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

  const onReviewsUpdate = useCallback(async () => {
    if (!parsedBookId) return;
    try {
      const reviews = await bookService.getBookReviews(parsedBookId);
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

  const onBookUpdate = useCallback((bookData: any) => {
    setBook(prevBook => {
      if (!prevBook) return null;
      return {
        ...prevBook,
        ...bookData
      };
    });
  }, []);

  const bookEventCallbacks: BookEventCallbacks = useMemo(() => ({
    onRatingUpdate,
    onReviewsUpdate,
    onBookUpdate
  }), [onRatingUpdate, onReviewsUpdate, onBookUpdate]);

  // Используем расширенные хуки
  const { handleBookClick, handleCategoryClick } = useBookEvents(parsedBookId, bookEventCallbacks);
  const { 
    toggleCurrentBookFavorite, 
    isFavorite, 
    isUpdating: isFavoriteUpdating 
  } = useFavorites(parsedBookId);
  const {
    // Состояния формы отзыва
    reviewText,
    reviewRating,
    charCount,
    reviewError,
    editingReviewId,
    // Функции управления формой
    handleReviewTextChange,
    setReviewRating,
    startEditingReview,
    cancelEditingReview,
    handleReviewSubmit,
    // Данные отзывов
    reviews,
    userReviews,
    // Состояния загрузки
    isSubmitting
  } = useReviews(parsedBookId, isAuthenticated);

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

  // Мемоизируем обработчики событий, чтобы избежать лишних ререндеров
  const handleToggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      message.warning('Для добавления книги в избранное необходимо авторизоваться');
      return;
    }
    
    await toggleCurrentBookFavorite(
      () => {
        message.success(isFavorite ? 'Книга удалена из избранного' : 'Книга добавлена в избранное');
      },
      (error) => {
        console.error('Ошибка при обновлении избранного:', error);
        message.error('Не удалось обновить избранное');
      }
    );
  }, [isAuthenticated, isFavorite, toggleCurrentBookFavorite]);

  const startReading = useCallback(() => {
    if (!isAuthenticated) {
      message.warning('Для чтения книги необходимо авторизоваться');
      return;
    }
    
    // Переход на страницу чтения книги
    navigate(`/books/${parsedBookId}/read`);
  }, [isAuthenticated, parsedBookId, navigate]);

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
    <AnimatedBackground>
      <div ref={contentRef} className={styles.bookDetailContent}>
        {/* Хлебные крошки */}
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/books">Книги</Link>
          </Breadcrumb.Item>
          {book.categories && book.categories.length > 0 && (
            <Breadcrumb.Item>
              <span 
                onClick={(e) => handleCategoryClick(e, book.categories[0].id)}
                style={{ cursor: 'pointer', color: '#3769f5' }}
              >
                {book.categories[0].name}
              </span>
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item style={{ color: '#8e54e9' }}>
            {book.title.length > 40 ? `${book.title.substring(0, 40)}...` : book.title}
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Кнопка "Назад" */}
        <div>
          <Link to="/books" className={styles.backLink}>
            <FiArrowLeft size={18} style={{ marginRight: '8px' }} /> Назад к списку книг
          </Link>
        </div>

        {/* Основной контент */}
        <div className={styles.bookLayout}>
          {/* Левая колонка с обложкой и кнопками */}
          <div className={styles.bookLeftColumn}>
            {/* Карточка с обложкой */}
            <div className={styles.bookCoverContainer}>
              <div className={styles.bookCoverWrapper}>
                {/* Градиентная тень-подложка для эффекта парения */}
                <div className={styles.bookCoverShadow}></div>
                
                <img
                  src={coverImageUrl}
                  alt={book.title}
                  className={styles.bookCoverImg}
                  loading="eager"
                  onError={handleImageError}
                />
              </div>
              
              <div className={styles.bookActionButtons}>
                <Button 
                  type="primary" 
                  icon={<FiBookOpen />} 
                  onClick={startReading} 
                  block
                  size="large"
                  className={styles.readButton}
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
                  onClick={handleToggleFavorite} 
                  loading={isFavoriteUpdating}
                  block
                  size="large"
                  className={`${styles.favoriteButton} ${isFavorite ? styles.isFavorite : styles.notFavorite}`}
                >
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </Button>
              </div>
            </div>
          </div>

          {/* Правая часть с основным контентом */}
          <div className={styles.bookRightColumn}>
            {/* Информация о книге */}
            <div className={styles.bookInfoSection}>
              <Title level={2} className={styles.bookTitle} style={{ 
                borderLeft: '5px solid #3769f5'
              }}>
                {book.title}
              </Title>
              
              <div className={styles.bookAuthor}>
                <FiUser size={18} style={{ color: '#3769f5' }} />
                <Text strong style={{ fontSize: '18px' }}>{book.author}</Text>
              </div>
              
              <div className={styles.bookRatingSummary}>
                <div className={styles.ratingValue}>
                  <span className={styles.starIcon}>★</span>
                  <span className={styles.ratingNumber}>{book.rating ? book.rating.toFixed(1).replace('.', ',') : '0,0'}</span>
                </div>
                <div className={styles.ratingCount}>
                  {book.ratingsCount || 0} {pluralizeRatings(book.ratingsCount || 0)}
                </div>
                <div className={styles.reviewsCount} onClick={scrollToReviews} role="button" tabIndex={0}>
                  <div className={styles.reviewsCountDivider}></div>
                  <span>{book.reviewsCount || 0} {pluralizeReviews(book.reviewsCount || 0)}</span>
                </div>
              </div>
              
              <div className={styles.bookCategoryTags}>
                {book.categories && book.categories.map(category => (
                  <Tag color="#3769f5" key={category.id} className={styles.categoryTag}>
                    <span 
                      onClick={(e) => handleCategoryClick(e, category.id)}
                      style={{ color: 'inherit', cursor: 'pointer' }}
                    >
                      {category.name}
                    </span>
                  </Tag>
                ))}
              </div>
            </div>
            
            {/* Секция Описание */}
            <div className={styles.bookInfoSection}>
              <div className={styles.sectionHeader}>
                <FaInfoCircle className={styles.sectionIcon} style={{ color: '#3769f5' }} />
                <Title level={3} style={{ margin: 0 }}>Описание</Title>
              </div>

              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', margin: '16px 0' }}>
                {book.description || 'Описание отсутствует'}
              </Paragraph>
              
              <Divider style={{ margin: '24px 0' }} />
              
              <div className={styles.bookDetailsCard}>
                <div className={styles.bookDetailsSection}>
                  <Text className={styles.bookDetailsTitle}>Автор</Text>
                  <div className={styles.bookAuthorDetail}>
                    <FiUser size={16} className={styles.labelIcon} />
                    <Text strong>{book.author}</Text>
                  </div>
                </div>
                
                <Divider className={styles.bookDetailsDivider} />
                
                <div className={styles.bookDetailsSection}>
                  <Text className={styles.bookDetailsTitle}>Детали книги</Text>
                  
                  <div className={styles.bookDetailsList}>
                    <div className={`${styles.bookDetailsRow} ${styles.striped}`}>
                      <div className={styles.bookDetailsLabel}>
                        <FiCalendar className={styles.labelIcon} />
                        Год издания
                      </div>
                      <div className={styles.bookDetailsValue}>{book.publicationYear}</div>
                    </div>
                    <div className={styles.bookDetailsRow}>
                      <div className={styles.bookDetailsLabel}>
                        <FiBook className={styles.labelIcon} />
                        Издательство
                      </div>
                      <div className={styles.bookDetailsValue}>{book.publisher}</div>
                    </div>
                    <div className={`${styles.bookDetailsRow} ${styles.striped}`}>
                      <div className={styles.bookDetailsLabel}>
                        <FiHash className={styles.labelIcon} />
                        ISBN
                      </div>
                      <div className={styles.bookDetailsValue}>{book.isbn || 'Не указан'}</div>
                    </div>
                    <div className={styles.bookDetailsRow}>
                      <div className={styles.bookDetailsLabel}>
                        <FiFlag className={styles.labelIcon} />
                        Язык
                      </div>
                      <div className={styles.bookDetailsValue}>
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
              <div className={styles.bookInfoSection}>
                <div className={styles.sectionHeader}>
                  <FaBookmark className={styles.sectionIcon} style={{ color: '#3769f5' }} />
                  <Title level={3} style={{ margin: 0 }}>Книги из этой же категории</Title>
                </div>

                <div className={styles.relatedBooksGrid}>
                  {relatedBooks.map(relatedBook => (
                    <div key={relatedBook.id} className={styles.relatedBookCard}>
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
              className={styles.reviewsSection}
            >
              <div className={styles.reviewsHeader}>
                <div className={styles.reviewsHeaderTitle}>
                  <FaComments className={styles.sectionIcon} />
                  <Title level={3} style={{ margin: 0 }}>Отзывы</Title>
                </div>
              </div>

              {isAuthenticated ? (
                <div className={styles.reviewsFormWrapper}>
                  <div className={styles.reviewsRatingBlock}>
                    <div className={styles.reviewsRatingTitle}>Ваша оценка:</div>
                    <div className={styles.reviewsRatingStars}>
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
                  
                  <div className={styles.reviewsInputBlock}>
                    <div className={styles.reviewsInputHeader}>
                      <div className={styles.reviewsInputTitle}>
                        {editingReviewId ? 'Редактирование отзыва:' : 'Ваш отзыв:'}
                      </div>
                      <div className={`${styles.reviewsCharCounter} ${charCount < 10 ? styles.countError : ''}`}>
                        {charCount}/10+ символов
                      </div>
                    </div>
                    <textarea 
                      className={`${styles.reviewsTextarea} ${reviewError && reviewText.trim().length < 10 ? styles.inputError : ''}`}
                      placeholder="Поделитесь своими впечатлениями о книге..."
                      rows={5}
                      value={reviewText}
                      onChange={handleReviewTextChange}
                    />
                    {reviewError && <div className={styles.reviewsErrorMessage}>{reviewError}</div>}
                    <div className={styles.reviewsSubmitBlock}>
                      <Button 
                        type="primary" 
                        className={styles.reviewsSubmitButton}
                        loading={isSubmitting}
                        disabled={isSubmitting || reviewText.trim().length < 10}
                        onClick={handleReviewSubmit}
                      >
                        {editingReviewId ? 'Сохранить изменения' : 'Опубликовать отзыв'}
                      </Button>
                      
                      {editingReviewId && (
                        <Button 
                          type="default"
                          className={styles.reviewsCancelButton}
                          onClick={cancelEditingReview}
                          style={{ marginLeft: '10px' }}
                        >
                          Отменить
                        </Button>
                      )}
                      
                      {userReviews.length >= 3 && !editingReviewId && (
                        <div className={styles.reviewsLimitWarning}>
                          Достигнут лимит отзывов (максимум 3 для одной книги)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {userReviews.length > 0 && !editingReviewId && (
                    <div className={styles.userReviewsSection}>
                      <h4>Ваши отзывы</h4>
                      <div className={styles.userReviewsList}>
                        {userReviews.map(review => (
                          <div key={review.id} className={styles.userReviewItem}>
                            <div className={styles.userReviewContent}>
                              {review.content}
                            </div>
                            <div className={styles.userReviewMeta}>
                              {review.rating && review.rating > 0 && (
                                <div className={styles.userReviewRating}>
                                  Ваша оценка: {review.rating}★
                                </div>
                              )}
                              <div className={styles.userReviewDate}>
                                {new Date(review.creationDate).toLocaleDateString('ru-RU')}
                                {review.editedDate && ' (ред.)'}
                              </div>
                            </div>
                            <div className={styles.userReviewActions}>
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
                <div className={styles.loginPrompt}>
                  <FaComments style={{ opacity: 0.5, fontSize: '20px' }} />
                  <Text>Чтобы оставить отзыв и оценить книгу, <Link to="/login" className={styles.loginLink}>войдите</Link> в аккаунт</Text>
                </div>
              )}
              
              <div className={styles.reviewsListContainer}>
                <ReviewList bookId={parsedBookId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default BookDetailPage; 
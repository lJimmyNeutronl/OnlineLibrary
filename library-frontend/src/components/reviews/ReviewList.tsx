import React, { useState, useEffect, useCallback } from 'react';
import './ReviewList.css';
import Typography from '../common/Typography';
import api from '../../services/api';
import RatingStars from '../rating/RatingStars';
import Empty from '../common/Empty';
import Spin from '../common/Spin';
import Button from '../common/Button';
import Divider from '../common/Divider';
import bookService, { Review } from '../../services/bookService';

const { Title, Text, Paragraph } = Typography;

interface ReviewListProps {
  bookId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ bookId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  // Стабильная функция загрузки отзывов
  const fetchReviews = useCallback(async () => {
    if (!bookId) return;
    
    try {
      setLoading(true);
      const reviewsData = await bookService.getBookReviews(bookId);
      setReviews(reviewsData);
      setError(null);
      
      // Отправляем событие с количеством отзывов для обновления счетчика на странице
      const reviewsCountEvent = new CustomEvent('reviews-count-update', {
        detail: { count: reviewsData.length, bookId },
        bubbles: true
      });
      document.dispatchEvent(reviewsCountEvent);
      
      // Сохраняем количество отзывов в localStorage для восстановления после перезагрузки
      try {
        localStorage.setItem(`book_${bookId}_reviews_count`, reviewsData.length.toString());
      } catch (e) {
        console.error('Ошибка при сохранении количества отзывов в localStorage:', e);
      }
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setError('Не удалось загрузить отзывы.');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  // Первоначальная загрузка отзывов
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Слушатель события добавления нового отзыва
  useEffect(() => {
    const handleReviewAdded = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Проверяем, что событие относится к текущей книге
      if (customEvent.detail && customEvent.detail.bookId === bookId) {
        // Перезагружаем отзывы только если событие для текущей книги
        fetchReviews();
      } else if (!customEvent.detail) {
        // Если нет детальной информации, перезагружаем отзывы для текущей книги
        fetchReviews();
      }
    };
    
    document.addEventListener('review-added', handleReviewAdded);
    
    return () => {
      document.removeEventListener('review-added', handleReviewAdded);
    };
  }, [bookId, fetchReviews]);

  const toggleExpandReview = (reviewId: number) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Функция для форматирования даты без использования date-fns
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Получение разницы в миллисекундах
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      // Преобразование в минуты, часы, дни
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Форматирование даты на русском языке
      if (diffMins < 60) {
        return `${diffMins} ${getRussianMinutesText(diffMins)} назад`;
      } else if (diffHours < 24) {
        return `${diffHours} ${getRussianHoursText(diffHours)} назад`;
      } else if (diffDays < 7) {
        return `${diffDays} ${getRussianDaysText(diffDays)} назад`;
      } else {
        // Преобразование в полную дату
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      }
    } catch (e) {
      return 'Недавно';
    }
  };
  
  // Вспомогательные функции для склонения слов
  const getRussianMinutesText = (minutes: number) => {
    if (minutes >= 11 && minutes <= 19) return 'минут';
    const lastDigit = minutes % 10;
    
    if (lastDigit === 1) return 'минута';
    if (lastDigit >= 2 && lastDigit <= 4) return 'минуты';
    return 'минут';
  };
  
  const getRussianHoursText = (hours: number) => {
    if (hours >= 11 && hours <= 19) return 'часов';
    const lastDigit = hours % 10;
    if (lastDigit === 1) return 'час';
    if (lastDigit >= 2 && lastDigit <= 4) return 'часа';
    return 'часов';
  };
  
  const getRussianDaysText = (days: number) => {
    if (days >= 11 && days <= 19) return 'дней';
    const lastDigit = days % 10;
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
  };
  
  // Получение названия месяца на русском
  const getMonthName = (month: number): string => {
    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return monthNames[month];
  };

  if (loading) {
    return <div className="review-list-loading"><Spin /></div>;
  }

  if (error) {
    return <div className="review-list-error">{error}</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <Empty description="Пока нет отзывов. Будьте первым, кто оставит отзыв!" />;
  }

  return (
    <div className="review-list">
      <Title level={4} className="review-list-title">Отзывы читателей <span className="review-count">({reviews.length})</span></Title>
      
      {reviews.map((review, index) => {
        const isExpanded = expandedReviews[review.id] || false;
        const reviewContent = review.content;
        const shouldTruncate = reviewContent.length > 300;
        
        return (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="review-user">
                {review.userAvatarUrl ? (
                  <img src={review.userAvatarUrl} alt={`${review.userFirstName} ${review.userLastName}`} className="review-avatar-img" />
                ) : (
                  <div className="review-avatar">
                    {review.userFirstName?.[0] || 'U'}{review.userLastName?.[0] || ''}
                  </div>
                )}
                <div className="review-user-info">
                  <Text strong className="review-username">
                    {review.userFirstName} {review.userLastName}
                  </Text>
                  <div className="review-date">
                    {formatDate(review.creationDate)}
                    {review.editedDate && ' (ред.)'}
                  </div>
                </div>
              </div>
              
              {review.rating !== null && review.rating > 0 && (
                <div className="review-rating">
                  <RatingStars 
                    rating={review.rating} 
                    interactive={false} 
                    size={18} 
                  />
                </div>
              )}
            </div>

            <div className="review-content">
              <Paragraph className={`review-text ${shouldTruncate && !isExpanded ? 'truncated' : ''}`}>
                {shouldTruncate && !isExpanded 
                  ? `${reviewContent.substring(0, 300)}...` 
                  : reviewContent
                }
              </Paragraph>
              
              {shouldTruncate && (
                <button 
                  className="review-expand-btn"
                  onClick={() => toggleExpandReview(review.id)}
                >
                  {isExpanded ? 'Свернуть' : 'Читать полностью'}
                </button>
              )}
            </div>
            
            {index < reviews.length - 1 && <Divider className="review-divider" />}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList; 
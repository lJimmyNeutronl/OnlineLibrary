import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import './BookRating.css';
import api from '../../services/api';

interface BookRatingProps {
  bookId: number;
  isAuthenticated: boolean;
  showCount?: boolean;
  size?: number;
  interactive?: boolean;
}

interface RatingData {
  bookId: number;
  averageRating: number;
  ratingCount: number;
  userRating: number | null;
}

const BookRating: React.FC<BookRatingProps> = ({
  bookId,
  isAuthenticated,
  showCount = true,
  size = 20,
  interactive = true
}) => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Загрузка данных о рейтинге
  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/books/${bookId}/rating`);
        setRatingData(response.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке рейтинга:', err);
        setError('Не удалось загрузить рейтинг книги.');
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [bookId]);

  // Обработчик изменения рейтинга
  const handleRatingChange = async (newRating: number) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setSubmitStatus('submitting');
      const response = await api.post(`/books/${bookId}/rating`, { rating: newRating });
      
      // Обновляем локальные данные с сервера
      setRatingData(prev => {
        if (!prev) return null;
        
        // Расчет нового среднего рейтинга
        const totalBeforeUser = prev.averageRating * prev.ratingCount;
        const userPreviousRating = prev.userRating || 0;
        
        // Если это первая оценка пользователя
        if (!prev.userRating) {
          const newCount = prev.ratingCount + 1;
          const newAverage = (totalBeforeUser + newRating) / newCount;
          
          return {
            ...prev,
            averageRating: newAverage,
            ratingCount: newCount,
            userRating: newRating
          };
        } 
        // Если пользователь меняет свою оценку
        else {
          const totalWithoutUser = totalBeforeUser - userPreviousRating;
          const newAverage = (totalWithoutUser + newRating) / prev.ratingCount;
          
          return {
            ...prev,
            averageRating: newAverage,
            userRating: newRating
          };
        }
      });
      
      setSubmitStatus('success');
      
      // Возвращаем статус в 'idle' через 2 секунды
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка при отправке рейтинга:', err);
      setSubmitStatus('error');
      
      // Возвращаем статус в 'idle' через 2 секунды
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 2000);
    }
  };

  // Если данные еще загружаются
  if (loading) {
    return <div className="book-rating-loading">Загрузка рейтинга...</div>;
  }

  // Если произошла ошибка
  if (error) {
    return <div className="book-rating-error">{error}</div>;
  }

  // Если данные загружены
  return (
    <div className="book-rating">
      <div className="book-rating-stars">
        <RatingStars
          rating={ratingData?.averageRating || 0}
          size={size}
          interactive={interactive}
          onRatingChange={handleRatingChange}
          isAuthenticated={isAuthenticated}
        />
      </div>
      
      {showCount && ratingData && (
        <div className="book-rating-stats">
          <span className="book-rating-average">
            {ratingData.averageRating.toFixed(1)}
          </span>
          <span className="book-rating-count">
            ({ratingData.ratingCount} {getRatingCountText(ratingData.ratingCount)})
          </span>
        </div>
      )}
      
      {submitStatus === 'submitting' && (
        <div className="book-rating-status">Сохранение оценки...</div>
      )}
      
      {submitStatus === 'success' && (
        <div className="book-rating-status success">Ваша оценка сохранена!</div>
      )}
      
      {submitStatus === 'error' && (
        <div className="book-rating-status error">Ошибка при сохранении оценки.</div>
      )}
      
      {isAuthenticated && ratingData?.userRating && (
        <div className="book-rating-user">
          Ваша оценка: <strong>{ratingData.userRating}</strong>
        </div>
      )}
    </div>
  );
};

// Функция для склонения слова "оценка" в зависимости от числа
function getRatingCountText(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'оценок';
  }
  
  if (lastDigit === 1) {
    return 'оценка';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'оценки';
  }
  
  return 'оценок';
}

export default BookRating; 
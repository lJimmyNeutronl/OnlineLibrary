import React, { useState, useEffect, useRef } from 'react';
import RatingStars from './RatingStars';
import './BookRating.css';
import api from '../../services/api';
import { FaStar, FaStarHalfAlt, FaRegStar, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface BookRatingProps {
  bookId: number;
  isAuthenticated: boolean;
  showCount?: boolean;
  size?: number;
  interactive?: boolean;
  reviewsCount?: number;
  onReviewsClick?: () => void;
  detailed?: boolean;
}

interface RatingData {
  bookId: number;
  averageRating: number;
  ratingCount: number;
  userRating: number | null;
  ratingsDistribution?: {
    [key: number]: number;
  };
}

const BookRating: React.FC<BookRatingProps> = ({
  bookId,
  isAuthenticated,
  showCount = true,
  size = 20,
  interactive = true,
  reviewsCount = 0,
  onReviewsClick,
  detailed = false
}) => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [expandedTooltip, setExpandedTooltip] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);

  // Загрузка данных о рейтинге
  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/books/${bookId}/rating`);
        
        // Мок распределения оценок для демонстрации
        // В реальном приложении эти данные должны приходить с сервера
        const mockDistribution = {
          5: Math.floor(Math.random() * 300) + 200, // 5 звезд - больше всего
          4: Math.floor(Math.random() * 100) + 20,
          3: Math.floor(Math.random() * 20) + 5,
          2: Math.floor(Math.random() * 10),
          1: Math.floor(Math.random() * 5)
        };
        
        setRatingData({
          ...response.data,
          ratingsDistribution: mockDistribution
        });
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

  // Обработчик клика вне тултипа для его закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && 
          ratingRef.current && !ratingRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Обработчик изменения рейтинга
  const handleRatingChange = async (newRating: number | null) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setSubmitStatus('submitting');
      
      // Если передан null, удаляем рейтинг
      if (newRating === null) {
        await api.delete(`/books/${bookId}/rating`);
        
        // Обновляем локальные данные
        setRatingData(prev => {
          if (!prev) return null;
          
          // Если у пользователя не было рейтинга, ничего не меняем
          if (!prev.userRating) return prev;
          
          const userOldRating = prev.userRating;
          const newCount = prev.ratingCount - 1;
          
          // Рассчитываем новый средний рейтинг без оценки пользователя
          let newAverage = 0;
          if (newCount > 0) {
            // Убираем старую оценку пользователя из суммы
            const totalBeforeRemoval = prev.averageRating * prev.ratingCount;
            const totalAfterRemoval = totalBeforeRemoval - userOldRating;
            newAverage = totalAfterRemoval / newCount;
          }
          
          // Обновляем распределение оценок
          const updatedDistribution = { ...prev.ratingsDistribution };
          if (updatedDistribution && userOldRating) {
            updatedDistribution[userOldRating] = Math.max(0, (updatedDistribution[userOldRating] || 0) - 1);
          }
          
          return {
            ...prev,
            averageRating: newAverage,
            ratingCount: newCount,
            userRating: null,
            ratingsDistribution: updatedDistribution
          };
        });
        
        // Отправляем событие об удалении рейтинга
        const ratingChangeEvent = new CustomEvent('book-rating-change', { 
          detail: { rating: null, bookId },
          bubbles: true
        });
        document.dispatchEvent(ratingChangeEvent);
        
        setSubmitStatus('success');
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 2000);
        return;
      }
      
      // Стандартный код для добавления/обновления рейтинга
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
          
          // Обновляем распределение оценок
          const updatedDistribution = { ...prev.ratingsDistribution };
          if (updatedDistribution) {
            updatedDistribution[newRating] = (updatedDistribution[newRating] || 0) + 1;
          }
          
          return {
            ...prev,
            averageRating: newAverage,
            ratingCount: newCount,
            userRating: newRating,
            ratingsDistribution: updatedDistribution
          };
        } 
        // Если пользователь меняет свою оценку
        else {
          const totalWithoutUser = totalBeforeUser - userPreviousRating;
          const newAverage = (totalWithoutUser + newRating) / prev.ratingCount;
          
          // Обновляем распределение оценок
          const updatedDistribution = { ...prev.ratingsDistribution };
          if (updatedDistribution) {
            updatedDistribution[userPreviousRating] = Math.max(0, (updatedDistribution[userPreviousRating] || 0) - 1);
            updatedDistribution[newRating] = (updatedDistribution[newRating] || 0) + 1;
          }
          
          return {
            ...prev,
            averageRating: newAverage,
            userRating: newRating,
            ratingsDistribution: updatedDistribution
          };
        }
      });
      
      setSubmitStatus('success');
      
      // Отправляем пользовательское событие для обновления формы отзыва и статистики рейтинга на странице
      const ratingChangeEvent = new CustomEvent('book-rating-change', { 
        detail: { rating: newRating, bookId },
        bubbles: true
      });
      document.dispatchEvent(ratingChangeEvent);
      
      // Сохраняем рейтинг в локальное хранилище для восстановления после перезагрузки страницы
      try {
        const ratingKey = `book_${bookId}_rating`;
        localStorage.setItem(ratingKey, JSON.stringify({
          rating: newRating,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Ошибка при сохранении рейтинга в localStorage:', e);
      }
      
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

  // Проверяем наличие сохраненного рейтинга при монтировании компонента
  useEffect(() => {
    if (isAuthenticated && bookId) {
      try {
        const ratingKey = `book_${bookId}_rating`;
        const savedRatingData = localStorage.getItem(ratingKey);
        
        if (savedRatingData) {
          const { rating, timestamp } = JSON.parse(savedRatingData);
          
          // Проверяем, не устарел ли рейтинг (например, старше 24 часов)
          const MAX_AGE = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
          const now = Date.now();
          
          if (now - timestamp < MAX_AGE && rating) {
            // Если рейтинг не устарел, устанавливаем его в состояние
            setRatingData(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                userRating: rating
              };
            });
          }
        }
      } catch (e) {
        console.error('Ошибка при чтении рейтинга из localStorage:', e);
      }
    }
  }, [isAuthenticated, bookId]);

  // Получение максимального значения для распределения оценок
  const getMaxDistributionValue = () => {
    if (!ratingData?.ratingsDistribution) return 0;
    return Math.max(...Object.values(ratingData.ratingsDistribution));
  };

  // Расчет ширины полосы распределения в процентах
  const getBarWidth = (count: number) => {
    const max = getMaxDistributionValue();
    return max > 0 ? Math.max(4, (count / max) * 100) : 0;
  };

  // Расчет процента оценок определенного значения
  const getPercentage = (count: number) => {
    if (!ratingData?.ratingCount || ratingData.ratingCount === 0) return '0%';
    return `${Math.round((count / ratingData.ratingCount) * 100)}%`;
  };

  // Обработчик перехода к отзывам
  const handleReviewsClick = () => {
    if (onReviewsClick) {
      onReviewsClick();
    }
  };

  const toggleExpandedTooltip = () => {
    setExpandedTooltip(!expandedTooltip);
  };

  // Отображение статуса отправки рейтинга
  const renderSubmitStatus = () => {
    if (submitStatus === 'submitting') {
      return <div className="book-rating-status submitting">Сохранение оценки...</div>;
    }
    if (submitStatus === 'success') {
      return <div className="book-rating-status success">Ваша оценка сохранена!</div>;
    }
    if (submitStatus === 'error') {
      return <div className="book-rating-status error">Ошибка при сохранении оценки</div>;
    }
    return null;
  };

  // Определение цвета рейтинга в зависимости от значения
  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return '#4caf50'; // Зеленый для высоких оценок
    if (rating >= 3) return '#ff9800'; // Оранжевый для средних оценок
    return '#f44336';                  // Красный для низких оценок
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
    <div className="book-rating" ref={ratingRef}>
      {detailed ? (
        // Детальное отображение для верхней части страницы
        <div className="book-rating-detailed">
          <div className="book-rating-header">
            <div className="book-rating-value">
              <span 
                className="book-rating-number"
                style={{ color: getRatingColor(ratingData?.averageRating || 0) }}
              >
                {ratingData?.averageRating.toFixed(1) || '0.0'}
              </span>
            </div>
            <div className="book-rating-counters">
              <div 
                className="book-rating-count"
                onClick={() => setShowTooltip(!showTooltip)}
              >
                {ratingData?.ratingCount || 0} {getRatingCountText(ratingData?.ratingCount || 0)}
              </div>
              <div className="book-rating-reviews" onClick={handleReviewsClick}>
                <Link to="#reviews-section" className="book-rating-reviews-link">
                  {reviewsCount} {getReviewsCountText(reviewsCount)}
                </Link>
              </div>
            </div>
          </div>
          
          {showTooltip && ratingData?.ratingsDistribution && (
            <div 
              className={`book-rating-tooltip ${expandedTooltip ? 'expanded' : ''}`}
              ref={tooltipRef}
            >
              <div className="book-rating-tooltip-header">
                <span className="book-rating-tooltip-title">
                  Оценок: <strong>{ratingData.ratingCount}</strong>
                </span>
                <button 
                  className="book-rating-tooltip-toggle"
                  onClick={toggleExpandedTooltip}
                  aria-label={expandedTooltip ? "Свернуть" : "Развернуть"}
                >
                  {expandedTooltip ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              
              <div className="book-rating-distribution">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingData.ratingsDistribution?.[star] || 0;
                  const percentage = getPercentage(count);
                  const barWidth = getBarWidth(count);
                  
                  return (
                    <div key={star} className="book-rating-distribution-row">
                      <div className="book-rating-distribution-stars">
                        <span>{star}</span>
                        <FaStar color="#f39c12" />
                      </div>
                      <div className="book-rating-distribution-bar-container">
                        <div 
                          className="book-rating-distribution-bar" 
                          style={{ 
                            width: `${barWidth}%`
                          }}
                        ></div>
                      </div>
                      <div className="book-rating-distribution-count">
                        <span className="book-rating-distribution-percentage">{percentage}</span>
                        {expandedTooltip && (
                          <span className="book-rating-distribution-absolute">({count})</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {isAuthenticated && (
                <div className="book-rating-user-container">
                  <div className="book-rating-user-header">
                    <span className="book-rating-user-title">Ваша оценка:</span>
                  </div>
                  <div className="book-rating-user-stars">
                    <RatingStars
                      rating={ratingData?.userRating || 0}
                      size={24}
                      interactive={true}
                      onRatingChange={handleRatingChange}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                  {renderSubmitStatus()}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Упрощенное отображение для формы отзыва
        <div className="book-rating-simple">
          <RatingStars
            rating={ratingData?.userRating || 0}
            size={size}
            interactive={interactive}
            onRatingChange={handleRatingChange}
            isAuthenticated={isAuthenticated}
          />
          {showCount && (
            <span className="book-rating-count-simple">
              {ratingData?.ratingCount || 0} {getRatingCountText(ratingData?.ratingCount || 0)}
            </span>
          )}
          {renderSubmitStatus()}
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

// Функция для склонения слова "отзыв" в зависимости от числа
function getReviewsCountText(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'отзывов';
  }
  
  if (lastDigit === 1) {
    return 'отзыв';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'отзыва';
  }
  
  return 'отзывов';
}

export default BookRating; 
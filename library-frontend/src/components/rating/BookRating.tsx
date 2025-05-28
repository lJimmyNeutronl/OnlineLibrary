import React, { useState, useEffect, useRef, useCallback } from 'react';
import RatingStars from './RatingStars';
import './BookRating.css';
import api from '../../services/api';
import bookService from '../../services/bookService';
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
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'deleted' | 'error'>('idle');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [expandedTooltip, setExpandedTooltip] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef<boolean>(true);
  const statusTimeoutRef = useRef<number | null>(null);

  // Мемоизированная функция загрузки рейтинга
  const fetchRating = useCallback(async () => {
    try {
      setLoading(true);
      
      // При первой загрузке всегда делаем запрос к API с принудительным обновлением
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        
        // Делаем запрос к API с параметром refresh=true
        const freshRatingData = await bookService.getBookRating(bookId, true);
        
        // Устанавливаем полученные данные
        setRatingData({
          bookId,
          averageRating: freshRatingData.averageRating,
          ratingCount: freshRatingData.ratingCount,
          userRating: freshRatingData.userRating,
          // Мок распределения оценок для демонстрации
          ratingsDistribution: {
            5: Math.floor(Math.random() * 300) + 200,
            4: Math.floor(Math.random() * 100) + 20,
            3: Math.floor(Math.random() * 20) + 5,
            2: Math.floor(Math.random() * 10),
            1: Math.floor(Math.random() * 5)
          }
        });
        setError(null);
        setLoading(false);
        return;
      }
      
      // Для последующих обновлений сначала проверяем кэш
      const cachedRating = bookService.getBookRatingFromCache(bookId);
      if (cachedRating && cachedRating.averageRating >= 0) {
        // Используем данные из кэша
        setRatingData({
          bookId,
          averageRating: cachedRating.averageRating,
          ratingCount: cachedRating.ratingCount,
          userRating: cachedRating.userRating,
          // Мок распределения оценок для демонстрации
          ratingsDistribution: {
            5: Math.floor(Math.random() * 300) + 200,
            4: Math.floor(Math.random() * 100) + 20,
            3: Math.floor(Math.random() * 20) + 5,
            2: Math.floor(Math.random() * 10),
            1: Math.floor(Math.random() * 5)
          }
        });
        setError(null);
      } else {
        // Если в кэше нет данных, делаем запрос к API
        const ratingData = await bookService.getBookRating(bookId);
        
        // Устанавливаем полученные данные
        setRatingData({
          bookId,
          averageRating: ratingData.averageRating,
          ratingCount: ratingData.ratingCount,
          userRating: ratingData.userRating,
          // Мок распределения оценок для демонстрации
          ratingsDistribution: {
            5: Math.floor(Math.random() * 300) + 200,
            4: Math.floor(Math.random() * 100) + 20,
            3: Math.floor(Math.random() * 20) + 5,
            2: Math.floor(Math.random() * 10),
            1: Math.floor(Math.random() * 5)
          }
        });
        setError(null);
      }
    } catch (err) {
      console.error('Ошибка при загрузке рейтинга:', err);
      setError('Не удалось загрузить рейтинг книги.');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  // Упрощенный useEffect для загрузки данных
  useEffect(() => {
    fetchRating();
  }, [fetchRating]);

  // Отдельный useEffect для обработки событий
  useEffect(() => {
    // Добавляем слушатель события обновления рейтинга
    const handleRatingUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.bookId === bookId) {
        // Обрабатываем событие обновления рейтинга независимо от его типа (новая оценка или удаление)
        setRatingData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            averageRating: customEvent.detail.rating || 0,
            ratingCount: customEvent.detail.ratingCount || prev.ratingCount,
            userRating: customEvent.detail.userRating
          };
        });
      }
    };
    
    // Регистрируем обработчик события
    document.addEventListener('book-rating-updated', handleRatingUpdate);
    
    // Удаляем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener('book-rating-updated', handleRatingUpdate);
    };
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

  // Функция для установки статуса с автоматическим сбросом
  const setStatusWithTimeout = useCallback((status: typeof submitStatus) => {
    // Очищаем предыдущий таймер
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    
    setSubmitStatus(status);
    
    // Устанавливаем новый таймер только для не-idle статусов
    if (status !== 'idle') {
      statusTimeoutRef.current = setTimeout(() => {
        setSubmitStatus('idle');
        statusTimeoutRef.current = null;
      }, 2000);
    }
  }, []);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Обработчик изменения рейтинга
  const handleRatingChange = async (newRating: number | null) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setStatusWithTimeout('submitting');
      
      // Если передан null, удаляем рейтинг
      if (newRating === null) {
        await api.delete(`/books/${bookId}/rating`);
        
        // Обновляем локальный userRating на null
        setRatingData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            userRating: null
          };
        });
        
        // Удаляем рейтинг из localStorage и кэша
        bookService.removeBookRating(bookId, false);
        
        setStatusWithTimeout('deleted');
        return;
      }
      
      // Обновляем локальный userRating на новое значение
      setRatingData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          userRating: newRating
        };
      });
      
      // Стандартный код для добавления/обновления рейтинга
      const response = await api.post(`/books/${bookId}/rating`, { rating: newRating });
      
      // Обновляем данные рейтинга с учетом полученных от сервера значений
      setRatingData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          averageRating: response.data.averageRating,
          ratingCount: response.data.ratingCount,
          userRating: newRating
        };
      });
      
      // Обновляем кэш рейтинга
      bookService.updateBookRatingCache(bookId, {
        averageRating: response.data.averageRating,
        ratingCount: response.data.ratingCount,
        userRating: newRating,
        timestamp: Date.now()
      });
      
      // Отправляем событие обновления рейтинга
      document.dispatchEvent(new CustomEvent('book-rating-change', {
        detail: { 
          bookId, 
          rating: response.data.averageRating,
          ratingCount: response.data.ratingCount,
          userRating: newRating
        }
      }));
      
      setStatusWithTimeout('success');
      
    } catch (err) {
      console.error('Ошибка при отправке рейтинга:', err);
      setStatusWithTimeout('error');
    }
  };

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
    if (submitStatus === 'deleted') {
      return <div className="book-rating-status deleted">Ваша оценка удалена!</div>;
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
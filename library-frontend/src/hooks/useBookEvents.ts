import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../services/bookService';

export interface BookEventCallbacks {
  onRatingUpdate?: () => void;
  onReviewsUpdate?: () => void;
  onBookUpdate?: (bookData: any) => void;
}

/**
 * Хук для управления событиями книг
 */
export const useBookEvents = (bookId?: number, callbacks?: BookEventCallbacks) => {
  const navigate = useNavigate();
  const callbacksRef = useRef(callbacks);
  
  // Обновляем ref при изменении callbacks
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const handleBookClick = useCallback((targetBookId: number) => {
    navigate(`/books/${targetBookId}`);
  }, [navigate]);

  const handleAuthorClick = useCallback((e: React.MouseEvent, authorId: number) => {
    e.stopPropagation();
    navigate(`/authors/${authorId}`);
  }, [navigate]);

  const handleCategoryClick = useCallback((e: React.MouseEvent, categoryId: number) => {
    e.stopPropagation();
    navigate(`/categories/${categoryId}`);
  }, [navigate]);

  const handlePublisherClick = useCallback((e: React.MouseEvent, publisherId: number) => {
    e.stopPropagation();
    navigate(`/publishers/${publisherId}`);
  }, [navigate]);

  // Настройка слушателей событий
  useEffect(() => {
    if (!bookId) return;

    const handleBookRatingUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.bookId === bookId && callbacksRef.current?.onRatingUpdate) {
        callbacksRef.current.onRatingUpdate();
      }
    };

    const handleReviewAdded = () => {
      if (callbacksRef.current?.onReviewsUpdate) {
        callbacksRef.current.onReviewsUpdate();
      }
    };

    const handleReviewsCountUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.bookId === bookId && callbacksRef.current?.onBookUpdate) {
        // Обновляем счетчик отзывов в информации о книге
        callbacksRef.current.onBookUpdate({
          reviewsCount: customEvent.detail.count
        });
      }
    };

    // Регистрируем обработчики событий
    document.addEventListener('book-rating-change', handleBookRatingUpdated);
    document.addEventListener('book-rating-updated', handleBookRatingUpdated);
    document.addEventListener('review-added', handleReviewAdded);
    document.addEventListener('reviews-count-update', handleReviewsCountUpdate);

    // Проверяем наличие сохраненного рейтинга в localStorage
    try {
      const ratingKey = `book_${bookId}_rating`;
      const savedRatingData = localStorage.getItem(ratingKey);
      
      if (savedRatingData) {
        const { timestamp } = JSON.parse(savedRatingData);
        
        // Проверяем, не устарел ли рейтинг (например, старше 24 часов)
        const MAX_AGE = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
        const now = Date.now();
        
        if (now - timestamp < MAX_AGE && callbacksRef.current?.onRatingUpdate) {
          // Если рейтинг не устарел, принудительно обновляем рейтинг книги
          callbacksRef.current.onRatingUpdate();
        }
      }
    } catch (e) {
      console.error('Ошибка при чтении рейтинга из localStorage:', e);
    }

    // Проверяем наличие сохраненного счетчика отзывов
    try {
      const savedReviewsCount = localStorage.getItem(`book_${bookId}_reviews_count`);
      if (savedReviewsCount && callbacksRef.current?.onBookUpdate) {
        const count = parseInt(savedReviewsCount, 10);
        if (!isNaN(count)) {
          callbacksRef.current.onBookUpdate({
            reviewsCount: count
          });
        }
      }
    } catch (e) {
      console.error('Ошибка при чтении счетчика отзывов из localStorage:', e);
    }

    // Удаляем обработчики при размонтировании компонента
    return () => {
      document.removeEventListener('book-rating-change', handleBookRatingUpdated);
      document.removeEventListener('book-rating-updated', handleBookRatingUpdated);
      document.removeEventListener('review-added', handleReviewAdded);
      document.removeEventListener('reviews-count-update', handleReviewsCountUpdate);
    };
  }, [bookId]); // Убираем handleRatingUpdate и handleReviewsUpdate из зависимостей

  return {
    handleBookClick,
    handleAuthorClick,
    handleCategoryClick,
    handlePublisherClick,
  };
}; 
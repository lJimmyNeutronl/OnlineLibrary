import { useState, useCallback, useEffect } from 'react';
import bookService from '../services/bookService';

export interface ReviewFormData {
  rating: number;
  comment: string;
}

/**
 * Хук для управления отзывами
 */
export const useReviews = (bookId?: number, isAuthenticated?: boolean) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Состояния для формы отзыва
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  
  // Состояния для списков отзывов
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  // Обработчик изменения текста отзыва
  const handleReviewTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setReviewText(newText);
    setCharCount(newText.length);
  }, []);

  // Сброс формы
  const resetForm = useCallback(() => {
    setReviewText('');
    setReviewRating(0);
    setCharCount(0);
    setReviewError(null);
    setEditingReviewId(null);
  }, []);

  // Начало редактирования отзыва
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

  // Отмена редактирования
  const cancelEditingReview = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // Загрузка данных при изменении bookId
  useEffect(() => {
    if (!bookId) return;
    
    // Загружаем отзывы
    const loadReviewsData = async () => {
      try {
        const reviewsData = await bookService.getBookReviews(bookId);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      }
    };
    
    // Загружаем отзывы пользователя
    const loadUserReviewsData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const userReviewsData = await bookService.getUserReviewsForBook(bookId);
        setUserReviews(userReviewsData);
      } catch (error) {
        console.error('Ошибка при загрузке отзывов пользователя:', error);
      }
    };
    
    loadReviewsData();
    loadUserReviewsData();
  }, [bookId, isAuthenticated]);

  // Загрузка отзывов пользователя для книги
  const loadUserReviews = useCallback(async () => {
    if (!bookId || !isAuthenticated) return;
    
    try {
      const userReviewsData = await bookService.getUserReviewsForBook(bookId);
      setUserReviews(userReviewsData);
    } catch (error) {
      console.error('Ошибка при загрузке отзывов пользователя:', error);
    }
  }, [bookId, isAuthenticated]);

  // Загрузка всех отзывов книги
  const loadReviews = useCallback(async () => {
    if (!bookId) return;
    
    try {
      const reviewsData = await bookService.getBookReviews(bookId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
    }
  }, [bookId]);

  // Обработчик успешного добавления/обновления отзыва
  const handleReviewSuccess = useCallback((newReview: any) => {
    // Обновление списка отзывов
    setReviews((prevReviews: any[]) => {
      const existingIndex = prevReviews.findIndex((review: any) => review.id === newReview.id);
      
      if (existingIndex >= 0) {
        const updatedReviews = [...prevReviews];
        updatedReviews[existingIndex] = newReview;
        return updatedReviews;
      } else {
        return [newReview, ...prevReviews];
      }
    });
    
    // Перезагружаем отзывы пользователя
    loadUserReviews();
    
    // Сбрасываем форму
    resetForm();
    
    // Отправляем событие обновления отзывов
    document.dispatchEvent(new CustomEvent('review-added'));
  }, [loadUserReviews, resetForm]);

  const submitReview = useCallback(async (
    targetBookId: number,
    reviewData: ReviewFormData,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await bookService.addReview(targetBookId, reviewData.comment, reviewData.rating);
      onSuccess?.();
    } catch (error) {
      console.error('Ошибка при добавлении отзыва:', error);
      onError?.(error instanceof Error ? error.message : 'Произошла ошибка при добавлении отзыва');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const editReview = useCallback(async (
    reviewId: number,
    reviewData: ReviewFormData,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await bookService.updateReview(reviewId, reviewData.comment, reviewData.rating);
      onSuccess?.();
    } catch (error) {
      console.error('Ошибка при обновлении отзыва:', error);
      onError?.(error instanceof Error ? error.message : 'Произошла ошибка при обновлении отзыва');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const removeReview = useCallback(async (
    reviewId: number,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await bookService.deleteReview(reviewId);
      onSuccess?.();
    } catch (error) {
      console.error('Ошибка при удалении отзыва:', error);
      onError?.(error instanceof Error ? error.message : 'Произошла ошибка при удалении отзыва');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting]);

  // Комплексная отправка отзыва с валидацией
  const handleReviewSubmit = useCallback(async () => {
    const minCharCount = 10;
    
    if (reviewText.trim().length < minCharCount) {
      setReviewError(`Отзыв должен содержать не менее ${minCharCount} символов`);
      return;
    }
    
    if (!bookId) return;
    
    setReviewError(null);
    
    try {
      const reviewData: ReviewFormData = {
        rating: reviewRating || 0,
        comment: reviewText
      };

      if (editingReviewId) {
        // Редактируем существующий отзыв
        await editReview(
          editingReviewId,
          reviewData,
          () => {
            handleReviewSuccess({ id: editingReviewId, content: reviewText, rating: reviewRating });
          },
          (error) => {
            setReviewError(error);
          }
        );
      } else {
        // Добавляем новый отзыв
        await submitReview(
          bookId,
          reviewData,
          () => {
            handleReviewSuccess({ id: Date.now(), content: reviewText, rating: reviewRating });
          },
          (error) => {
            setReviewError(error);
          }
        );
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      setReviewError('Произошла ошибка при отправке отзыва');
    }
  }, [bookId, reviewText, reviewRating, editingReviewId, submitReview, editReview, handleReviewSuccess]);

  // Слушатель события изменения рейтинга
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

  return {
    // Основные функции
    submitReview,
    editReview,
    removeReview,
    handleReviewSubmit,
    
    // Управление формой
    reviewText,
    reviewRating,
    charCount,
    reviewError,
    editingReviewId,
    handleReviewTextChange,
    setReviewRating,
    startEditingReview,
    cancelEditingReview,
    resetForm,
    
    // Данные отзывов
    reviews,
    userReviews,
    loadReviews,
    loadUserReviews,
    
    // Состояния загрузки
    isSubmitting,
    isDeleting,
  };
}; 
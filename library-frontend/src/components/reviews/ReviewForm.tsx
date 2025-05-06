import React, { useState, useEffect } from 'react';
import './ReviewForm.css';
import Typography from '../common/Typography';
import Button from '../common/Button';
import RatingStars from '../rating/RatingStars';
import message from '../common/message';
import api from '../../services/api';

const { Title, Paragraph, Text } = Typography;

interface ReviewFormProps {
  bookId: number;
  existingReview?: {
    id: number;
    content: string;
    rating: number;
  };
  onSuccess: (review: any) => void;
  hideRating?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  bookId, 
  existingReview, 
  onSuccess,
  hideRating = false
}) => {
  const [content, setContent] = useState<string>(existingReview?.content || '');
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number>(existingReview?.content?.length || 0);

  const isEditing = !!existingReview;
  const minCharCount = 10;

  // Прослушиваем пользовательское событие изменения рейтинга
  useEffect(() => {
    const handleRatingEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.rating === 'number') {
        setRating(customEvent.detail.rating);
      }
    };
    
    document.addEventListener('book-rating-change' as any, handleRatingEvent);
    
    return () => {
      document.removeEventListener('book-rating-change' as any, handleRatingEvent);
    };
  }, []);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharCount(newContent.length);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Валидация формы
    if (!hideRating && rating === 0) {
      setError('Пожалуйста, выберите рейтинг');
      return;
    }

    if (content.trim().length < minCharCount) {
      setError(`Отзыв должен содержать не менее ${minCharCount} символов`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let response;

      if (isEditing) {
        // Обновляем существующий отзыв
        response = await api.put(`/reviews/${existingReview.id}`, {
          content,
          rating: hideRating ? existingReview.rating : rating
        });
        message.success('Отзыв успешно обновлен!');
      } else {
        // Создаем новый отзыв
        response = await api.post(`/books/${bookId}/reviews`, {
          content,
          rating: hideRating ? 0 : rating
        });
        message.success('Ваш отзыв успешно добавлен!');
      }

      // Очищаем форму после успешного добавления
      if (!isEditing) {
        setContent('');
        setRating(0);
        setCharCount(0);
      }

      // Уведомляем родительский компонент о успешном добавлении/обновлении
      onSuccess(response.data);
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);
      setError('Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      {!isEditing && !hideRating && (
        <Title level={4} className="review-form-title">
          {isEditing ? 'Редактировать отзыв' : 'Написать отзыв'}
        </Title>
      )}
      
      <form onSubmit={handleSubmit} className="review-form">
        {!hideRating && (
          <div className="review-form-rating">
            <Text strong>Ваша оценка:</Text>
            <div className="review-form-stars">
              <RatingStars 
                rating={rating} 
                interactive={true} 
                isAuthenticated={true}
                onRatingChange={handleRatingChange} 
                size={28}
                color="#f39c12"
              />
            </div>
          </div>
        )}
        
        <div className="review-form-content">
          <div className="review-form-content-header">
            <Text strong>Ваш отзыв:</Text>
            <div className={`review-form-char-count ${charCount < minCharCount ? 'error' : ''}`}>
              {charCount}/{minCharCount}+ символов
            </div>
          </div>
          <textarea 
            className={`review-textarea ${error && content.trim().length < minCharCount ? 'error' : ''}`}
            value={content}
            onChange={handleContentChange}
            placeholder="Поделитесь своими впечатлениями о книге..."
            rows={5}
          />
        </div>

        {error && <div className="review-form-error">{error}</div>}
        
        <div className="review-form-actions">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            disabled={loading || content.trim().length < minCharCount}
            className="review-submit-button"
          >
            {isEditing ? 'Обновить отзыв' : 'Опубликовать отзыв'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 
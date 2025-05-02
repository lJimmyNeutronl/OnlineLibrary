import React, { useState } from 'react';
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
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  bookId, 
  existingReview, 
  onSuccess 
}) => {
  const [content, setContent] = useState<string>(existingReview?.content || '');
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Валидация формы
    if (rating === 0) {
      setError('Пожалуйста, выберите рейтинг');
      return;
    }

    if (content.trim().length < 10) {
      setError('Отзыв должен содержать не менее 10 символов');
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
          rating
        });
        message.success('Отзыв успешно обновлен!');
      } else {
        // Создаем новый отзыв
        response = await api.post(`/books/${bookId}/reviews`, {
          content,
          rating
        });
        message.success('Ваш отзыв успешно добавлен!');
      }

      // Очищаем форму после успешного добавления
      if (!isEditing) {
        setContent('');
        setRating(0);
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
      <Title level={4}>{isEditing ? 'Редактировать отзыв' : 'Написать отзыв'}</Title>
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="review-form-rating">
          <Text strong>Ваша оценка:</Text>
          <div className="review-form-stars">
            <RatingStars 
              rating={rating} 
              interactive={true} 
              isAuthenticated={true}
              onRatingChange={handleRatingChange} 
              size={28}
            />
          </div>
        </div>
        
        <div className="review-form-content">
          <Text strong>Ваш отзыв:</Text>
          <textarea 
            className="review-textarea"
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
            disabled={loading}
          >
            {isEditing ? 'Обновить отзыв' : 'Опубликовать отзыв'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 
import React, { useState, useEffect } from 'react';
import './ReviewList.css';
import Typography from '../common/Typography';
import Empty from '../common/Empty';
import Spin from '../common/Spin';
import Divider from '../common/Divider';
import RatingStars from '../rating/RatingStars';
import api from '../../services/api';

const { Title, Paragraph, Text } = Typography;

interface ReviewListProps {
  bookId: number;
}

interface Review {
  id: number;
  userId: number;
  bookId: number;
  content: string;
  userFirstName: string;
  userLastName: string;
  creationDate: string;
  editedDate?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ bookId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/books/${bookId}/reviews`);
        setReviews(response.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке отзывов:', err);
        setError('Не удалось загрузить отзывы.');
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchReviews();
    }
  }, [bookId]);

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
      <Title level={4}>Отзывы читателей ({reviews.length})</Title>
      
      {reviews.map((review, index) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="review-user">
              <div className="review-avatar">
                {review.userFirstName?.[0] || 'U'}{review.userLastName?.[0] || ''}
              </div>
              <div className="review-user-info">
                <Text strong>
                  {review.userFirstName} {review.userLastName}
                </Text>
                <div className="review-date">
                  {new Date(review.creationDate).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {review.editedDate && ' (ред.)'}
                </div>
              </div>
            </div>
          </div>

          <div className="review-content">
            <Paragraph>
              {review.content}
            </Paragraph>
          </div>
          
          {index < reviews.length - 1 && <Divider />}
        </div>
      ))}
    </div>
  );
};

export default ReviewList; 
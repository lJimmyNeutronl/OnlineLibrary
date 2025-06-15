import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Typography from '../common/Typography';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import bookService from '../../services/bookService';
import './BookCard.css';

const { Title, Text } = Typography;

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  coverImageUrl: string | null | undefined;
  publicationYear?: number;
  showRating?: boolean;
  rating?: number;
}

// Функция для обрезания длинного текста с добавлением многоточия
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  coverImageUrl,
  publicationYear,
  showRating = false,
  rating = 0,
}) => {
  // Ограничиваем длину названия книги и автора
  const truncatedTitle = truncateText(title, 40);
  const truncatedAuthor = truncateText(author, 30);
  
  // Состояние для отслеживания ошибок загрузки изображения
  const [imageError, setImageError] = useState(false);
  
  // Состояние для хранения рейтинга книги
  const [bookRating, setBookRating] = useState<number>(rating);
  
  // Путь к изображению-плейсхолдеру
  const placeholderImage = '/placeholder.png';
  
  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Проверяем кэш рейтингов при монтировании и обновляем рейтинг, если он есть в кэше
  useEffect(() => {
    // Проверяем, есть ли рейтинг в кэше
    const cachedRating = bookService.getBookRatingFromCache(id);
    if (cachedRating && cachedRating.averageRating > 0) {
      setBookRating(cachedRating.averageRating);
    } else if (rating > 0) {
      setBookRating(rating);
    } else if (showRating) {
      // Если рейтинг не передан и его нет в кэше, но нужно отображать рейтинг,
      // делаем запрос к API для получения рейтинга
      const fetchRating = async () => {
        try {
          const ratingData = await bookService.getBookRating(id);
          if (ratingData.averageRating > 0) {
            setBookRating(ratingData.averageRating);
          }
        } catch (error) {
          console.error(`Ошибка при получении рейтинга для книги ${id}:`, error);
        }
      };
      
      fetchRating();
    }
    
    // Слушатель события обновления рейтинга
    const handleRatingUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.bookId === id) {
        setBookRating(customEvent.detail.rating || 0);
      }
    };
    
    // Регистрируем обработчик события
    document.addEventListener('book-rating-updated', handleRatingUpdate);
    
    // Удаляем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener('book-rating-updated', handleRatingUpdate);
    };
  }, [id, rating, showRating]);
  
  return (
    <div className="book-card-wrapper">
      <motion.div
        className="motion-container"
        whileHover={{ 
          y: -10,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/books/${id}`} className="book-link" onClick={(e) => {
          // Проверяем, не является ли цель клика кнопкой удаления
          const target = e.target as HTMLElement;
          if (target.closest('.remove-favorite-button')) {
            e.preventDefault();
          }
        }}>
          <Card
            hoverable
            className="book-card"
          >
            <div className="book-image-container">
              <img
                src={imageError || !coverImageUrl ? placeholderImage : coverImageUrl}
                alt={title}
                onError={handleImageError}
                className="book-image"
              />
            </div>
            <div title={title} className="book-title-container">
              <Title 
                level={5} 
                className="book-title text-ellipsis-2lines"
              >
                {truncatedTitle}
              </Title>
            </div>
            <div title={author}>
              <Text 
                className="book-author text-ellipsis"
              >
                {truncatedAuthor}
              </Text>
            </div>
            {publicationYear && (
              <Text className="book-year">
                {publicationYear}
              </Text>
            )}
            {showRating && (
              <div className="book-rating-container">
                <div className="rating-badge">
                  <FaStar className="rating-icon" />
                  {bookRating > 0 ? bookRating.toFixed(1).replace('.', ',') : '0,0'}
                </div>
              </div>
            )}
          </Card>
        </Link>
      </motion.div>
    </div>
  );
};

export default BookCard; 
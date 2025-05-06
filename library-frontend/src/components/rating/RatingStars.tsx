import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import './RatingStars.css';

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  size?: number;
  color?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number | null) => void;
  isAuthenticated?: boolean;
  onClick?: () => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalStars = 5,
  size = 24,
  color = '#FFD700', // золотой цвет для звезд
  interactive = false,
  onRatingChange,
  isAuthenticated = false,
  onClick
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [lastSelectedRating, setLastSelectedRating] = useState<number | null>(null);

  // При изменении рейтинга извне, обновляем lastSelectedRating
  useEffect(() => {
    if (rating > 0) {
      setLastSelectedRating(rating);
    } else {
      setLastSelectedRating(null);
    }
  }, [rating]);

  // Проверка, может ли пользователь оценивать
  const canRate = interactive && isAuthenticated;

  // Обработчик клика по звезде
  const handleClick = (selectedRating: number) => {
    if (canRate && onRatingChange) {
      // Если пользователь нажимает на ту же звезду, что и раньше - отменяем оценку
      if (lastSelectedRating === selectedRating) {
        onRatingChange(null); // Передаем null для отмены рейтинга
        setLastSelectedRating(null);
        
        // Отправка пользовательского события для обновления формы отзыва
        const ratingChangeEvent = new CustomEvent('book-rating-change', { 
          detail: { rating: 0 },
          bubbles: true
        });
        document.dispatchEvent(ratingChangeEvent);
      } else {
        // Устанавливаем новый рейтинг
        onRatingChange(selectedRating);
        setLastSelectedRating(selectedRating);
        
        // Отправка пользовательского события для обновления формы отзыва
        const ratingChangeEvent = new CustomEvent('book-rating-change', { 
          detail: { rating: selectedRating },
          bubbles: true
        });
        document.dispatchEvent(ratingChangeEvent);
      }
    } else if (onClick) {
      // Если пользователь не может оценивать, но есть обработчик общего клика
      onClick();
    }
  };

  // Обработчики наведения мыши
  const handleMouseEnter = (index: number) => {
    if (canRate) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (canRate) {
      setHoverRating(0);
    }
  };

  // Функция для рендеринга звезд
  const renderStar = (index: number) => {
    const starValue = index + 1;
    // Выбираем рейтинг для отображения (при наведении или обычный)
    const currentRating = hoverRating > 0 ? hoverRating : rating;
    
    // Стиль для звезды
    const starStyle = {
      color,
      fontSize: `${size}px`,
      cursor: (canRate || onClick) ? 'pointer' : 'default'
    };
    
    // Если текущий рейтинг больше или равен значению звезды, отображаем полную звезду
    if (currentRating >= starValue) {
      return (
        <FaStar
          key={index}
          style={starStyle}
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onMouseLeave={handleMouseLeave}
        />
      );
    }
    // Если текущий рейтинг больше значения звезды - 0.5, отображаем половину звезды
    else if (currentRating >= starValue - 0.5) {
      return (
        <FaStarHalfAlt
          key={index}
          style={starStyle}
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onMouseLeave={handleMouseLeave}
        />
      );
    }
    // Иначе отображаем пустую звезду
    else {
      return (
        <FaRegStar
          key={index}
          style={starStyle}
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onMouseLeave={handleMouseLeave}
        />
      );
    }
  };

  return (
    <div className="rating-stars" onClick={onClick ? () => onClick() : undefined}>
      {Array.from({ length: totalStars }, (_, index) => renderStar(index))}
      {interactive && !isAuthenticated && (
        <div className="rating-login-note">
          Войдите, чтобы оценить книгу
        </div>
      )}
    </div>
  );
};

export default RatingStars; 
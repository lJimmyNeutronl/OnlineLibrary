import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import BookCard from './BookCard';
import './BookCarousel.css';

interface Book {
  id: number;
  title: string;
  author: string;
  coverImageUrl?: string | null;
  publicationYear?: number;
  rating?: number;
  description?: string | null;
}

interface BookCarouselProps {
  books: Book[];
  title?: string;
  className?: string;
}

const BookCarousel: React.FC<BookCarouselProps> = ({
  books,
  title,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setVisibleCount(1);
      } else if (width < 768) {
        setVisibleCount(2);
      } else if (width < 992) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      return newIndex < 0 ? 0 : newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = books.length - visibleCount;
      const newIndex = prevIndex + 1;
      return newIndex > maxIndex ? maxIndex : newIndex;
    });
  };

  // Если нет книг, не отображаем карусель
  if (!books || books.length === 0) {
    return null;
  }

  // Если книг меньше, чем видимое количество, показываем все книги без стрелок
  const showControls = books.length > visibleCount;
  
  // Определяем, нужно ли отключить кнопки
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= books.length - visibleCount;

  return (
    <div className={`book-carousel ${className}`}>
      {title && <h3 className="book-carousel-title">{title}</h3>}
      
      <div className="book-carousel-container">
        {showControls && (
          <button
            className={`carousel-control prev ${isPrevDisabled ? 'disabled' : ''}`}
            onClick={handlePrev}
            disabled={isPrevDisabled}
            aria-label="Предыдущие книги"
          >
            <FiChevronLeft size={24} />
          </button>
        )}
        
        <div className="carousel-items-container" ref={containerRef}>
          <motion.div
            className="carousel-items"
            animate={{
              x: `calc(-${currentIndex * (100 / visibleCount)}%)`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {books.map((book) => (
              <div
                key={book.id}
                className="carousel-item"
                style={{ width: `calc(100% / ${visibleCount})` }}
              >
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverImageUrl={book.coverImageUrl || ''}
                  publicationYear={book.publicationYear}
                  showRating={true}
                  rating={book.rating || 0}
                />
              </div>
            ))}
          </motion.div>
        </div>
        
        {showControls && (
          <button
            className={`carousel-control next ${isNextDisabled ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={isNextDisabled}
            aria-label="Следующие книги"
          >
            <FiChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCarousel; 
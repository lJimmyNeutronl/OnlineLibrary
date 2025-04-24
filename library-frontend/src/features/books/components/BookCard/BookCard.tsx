import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types';
import './BookCard.css';

interface BookCardProps {
  book: Book;
}

/**
 * Компонент карточки книги
 */
export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { id, title, description, coverUrl, authors } = book;
  
  // Сокращаем описание, если оно слишком длинное
  const truncatedDescription = description.length > 150
    ? `${description.substring(0, 150)}...`
    : description;
  
  // Формируем строку с авторами
  const authorsString = authors.map(author => author.name).join(', ');
  
  return (
    <div className="book-card">
      <Link to={`/books/${id}`} className="book-card-link">
        <div className="book-card-cover">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="book-cover-image" />
          ) : (
            <div className="book-cover-placeholder">
              <span>{title.charAt(0)}</span>
            </div>
          )}
        </div>
        
        <div className="book-card-content">
          <h3 className="book-card-title">{title}</h3>
          {authorsString && (
            <p className="book-card-authors">{authorsString}</p>
          )}
          <p className="book-card-description">{truncatedDescription}</p>
        </div>
      </Link>
    </div>
  );
}; 
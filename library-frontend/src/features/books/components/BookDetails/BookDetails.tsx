import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types';
import './BookDetails.css';

interface BookDetailsProps {
  book: Book;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Компонент для отображения подробной информации о книге
 */
export const BookDetails: React.FC<BookDetailsProps> = ({ 
  book, 
  isLoading = false, 
  error = null 
}) => {
  // Показываем сообщение о загрузке
  if (isLoading) {
    return (
      <div className="book-details-loader">
        <p>Загрузка информации о книге...</p>
      </div>
    );
  }

  // Показываем сообщение об ошибке
  if (error) {
    return (
      <div className="book-details-error">
        <p>{error}</p>
      </div>
    );
  }

  // Показываем детали книги
  const { 
    title, 
    description, 
    coverUrl, 
    authors, 
    categories, 
    publicationYear, 
    pages, 
    isbn, 
    language 
  } = book;

  return (
    <div className="book-details">
      <div className="book-details-content">
        <div className="book-details-cover">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="book-details-image" />
          ) : (
            <div className="book-details-placeholder">
              <span>{title.charAt(0)}</span>
            </div>
          )}
        </div>
        
        <div className="book-details-info">
          <h1 className="book-details-title">{title}</h1>
          
          {authors.length > 0 && (
            <div className="book-details-section">
              <h3 className="book-details-section-title">Авторы:</h3>
              <div className="book-details-authors">
                {authors.map(author => (
                  <Link 
                    key={author.id} 
                    to={`/authors/${author.id}`} 
                    className="book-details-author"
                  >
                    {author.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {categories.length > 0 && (
            <div className="book-details-section">
              <h3 className="book-details-section-title">Категории:</h3>
              <div className="book-details-categories">
                {categories.map(category => (
                  <Link 
                    key={category.id} 
                    to={`/categories/${category.id}`} 
                    className="book-details-category"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="book-details-section">
            <h3 className="book-details-section-title">Описание:</h3>
            <p className="book-details-description">{description}</p>
          </div>
          
          <div className="book-details-metadata">
            <div className="book-details-metadata-item">
              <span className="book-details-metadata-label">Год издания:</span>
              <span className="book-details-metadata-value">
                {publicationYear || 'Не указан'}
              </span>
            </div>
            
            <div className="book-details-metadata-item">
              <span className="book-details-metadata-label">Страниц:</span>
              <span className="book-details-metadata-value">
                {pages || 'Не указано'}
              </span>
            </div>
            
            <div className="book-details-metadata-item">
              <span className="book-details-metadata-label">ISBN:</span>
              <span className="book-details-metadata-value">
                {isbn || 'Не указан'}
              </span>
            </div>
            
            <div className="book-details-metadata-item">
              <span className="book-details-metadata-label">Язык:</span>
              <span className="book-details-metadata-value">
                {language || 'Не указан'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {book.fileUrl && (
        <div className="book-details-actions">
          <Link to={`/reader/${book.id}`} className="book-details-read-button">
            Читать книгу
          </Link>
        </div>
      )}
    </div>
  );
}; 
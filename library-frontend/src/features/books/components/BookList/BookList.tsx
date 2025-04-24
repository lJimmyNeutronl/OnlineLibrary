import React from 'react';
import { Book } from '../../types';
import { BookCard } from '../BookCard';
import './BookList.css';

interface BookListProps {
  books: Book[];
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Компонент списка книг
 */
export const BookList: React.FC<BookListProps> = ({ 
  books, 
  isLoading = false, 
  error = null 
}) => {
  // Показываем сообщение о загрузке
  if (isLoading) {
    return (
      <div className="book-list-loader">
        <p>Загрузка книг...</p>
      </div>
    );
  }

  // Показываем сообщение об ошибке
  if (error) {
    return (
      <div className="book-list-error">
        <p>{error}</p>
      </div>
    );
  }

  // Показываем сообщение, если книги не найдены
  if (books.length === 0) {
    return (
      <div className="book-list-empty">
        <p>Книги не найдены</p>
      </div>
    );
  }

  // Показываем список книг
  return (
    <div className="book-list-container">
      <div className="book-list">
        {books.map(book => (
          <div key={book.id} className="book-list-item">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
}; 
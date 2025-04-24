import React from 'react';
import { FavoriteBook } from '../types';
import { formatDate, sortFavoriteBooks, getAuthorsString } from '../utils';

interface FavoriteBooksProps {
  favorites: FavoriteBook[];
  onRemoveFromFavorites: (id: number) => void;
}

/**
 * Компонент для отображения списка избранных книг
 */
const FavoriteBooks: React.FC<FavoriteBooksProps> = ({ favorites, onRemoveFromFavorites }) => {
  if (favorites.length === 0) {
    return (
      <div className="empty-favorites">
        <p>У вас пока нет избранных книг</p>
      </div>
    );
  }

  // Сортировка избранных книг по дате добавления (сначала новые)
  const sortedFavorites = sortFavoriteBooks(favorites);

  return (
    <div className="favorite-books">
      <h2>Избранные книги</h2>
      
      <div className="book-grid">
        {sortedFavorites.map(book => (
          <div key={book.id} className="book-card">
            <div className="book-cover">
              {book.book?.coverUrl ? (
                <img src={book.book.coverUrl} alt={book.book.title} />
              ) : (
                <div className="cover-placeholder">
                  {book.book?.title?.charAt(0) || 'К'}
                </div>
              )}
            </div>
            
            <div className="book-info">
              <h3 className="book-title">{book.book?.title || 'Без названия'}</h3>
              <p className="book-author">
                {getAuthorsString(book.book)}
              </p>
              <p className="added-date">
                Добавлено: {formatDate(book.addedAt)}
              </p>
              
              <button 
                className="remove-favorite-button"
                onClick={() => onRemoveFromFavorites(book.id)}
              >
                Удалить из избранного
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteBooks; 
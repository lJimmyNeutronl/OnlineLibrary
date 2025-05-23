import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiBook } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchFavorites, removeFromFavorites } from '../../store/slices/favoritesSlice';
import { Card, List, Empty, Spin, Button, Typography, Row, Col } from '../common';
import './FavoriteBooks.css';

interface FavoriteBooksProps {
  limit?: number;
  showViewAllButton?: boolean;
  onRemove?: () => void;
}

const FavoriteBooks = ({ limit, showViewAllButton = false, onRemove }: FavoriteBooksProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { books: favorites, isLoading } = useAppSelector(state => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemoveFromFavorites = async (bookId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await dispatch(removeFromFavorites(bookId)).unwrap();
      // Вызываем колбэк, если он передан
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="favorites-loading-container">
        <Spin size="large" />
      </div>
    );
  }

  // Если указан лимит, ограничиваем количество отображаемых книг
  const displayedFavorites = limit ? favorites.slice(0, limit) : favorites;

  if (displayedFavorites.length === 0) {
    return (
      <div className="favorites-empty-container">
        <Empty 
          description="У вас пока нет избранных книг" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button 
          type="primary" 
          onClick={() => navigate('/books')}
          className="favorites-empty-button"
          icon={<FiBook />}
        >
          Перейти к каталогу книг
        </Button>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-grid">
        {displayedFavorites.map(book => (
          <div key={book.id} className="favorite-book-item">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/books/${book.id}`} className="favorite-book-link">
                <Card
                  className="favorite-book-card"
                  cover={
                    <div className="favorite-book-cover-container">
                      <img 
                        src={book.coverImageUrl || '/placeholder-cover.jpg'} 
                        alt={book.title}
                        className="favorite-book-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-cover.jpg';
                        }}
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <div className="favorite-book-title" style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {book.title}
                      </div>
                    }
                    description={
                      <div className="favorite-book-author" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {book.author}
                      </div>
                    }
                  />
                  <div className="favorite-book-actions">
                    <Button
                      type="text"
                      danger
                      icon={<FiTrash2 />}
                      onClick={(e) => handleRemoveFromFavorites(book.id, e)}
                    >
                      Удалить
                    </Button>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        ))}
      </div>
      
      {showViewAllButton && favorites.length > 0 && (
        <Row justify="center" className="favorites-view-all-row">
          <Col>
            <Button 
              type="primary" 
              onClick={() => navigate('/favorites')}
              className="favorites-view-all-button"
            >
              Показать все избранные книги
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FavoriteBooks; 
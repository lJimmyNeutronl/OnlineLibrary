import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Typography } from '../common';
import BookCard from './BookCard';
import { Book } from '@/types';
import './BookList.css';

const { Text, Paragraph } = Typography;

// Анимации для элементов страницы
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface BookListProps {
  books: Book[];
  viewMode: 'grid' | 'list';
  loading?: boolean;
  emptyText?: string;
  onRemoveFromFavorites?: (bookId: number) => void;
}

const BookList: React.FC<BookListProps> = ({ 
  books, 
  viewMode, 
  loading = false,
  emptyText = 'Книги не найдены',
  onRemoveFromFavorites
}) => {
  if (loading) {
    return null; // Загрузка обрабатывается на уровне родительского компонента
  }
  
  if (books.length === 0) {
    return null; // Пустой список обрабатывается на уровне родительского компонента
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {viewMode === 'grid' ? (
        <div className="book-grid">
          {books.map((book) => (
            <motion.div key={book.id} variants={fadeIn} className="motion-container">
              <BookCard
                id={book.id}
                title={book.title}
                author={book.author}
                coverImageUrl={book.coverImageUrl || '/placeholder.png'}
                publicationYear={book.publicationYear}
                showRating={true}
                rating={book.rating || 0}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {books.map((book) => (
            <motion.div key={book.id} variants={fadeIn}>
              <Link to={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="list-item-hover" style={{
                  display: 'flex',
                  padding: '16px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  backgroundColor: 'white'
                }}>
                  <div 
                    style={{ 
                      width: '100px', 
                      height: '150px', 
                      overflow: 'hidden',
                      borderRadius: '4px',
                      marginRight: '16px',
                      flexShrink: 0
                    }}
                  >
                    <img 
                      src={book.coverImageUrl || '/placeholder.png'} 
                      alt={book.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{book.title}</h3>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>{book.author}</Text>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <Text type="secondary">{book.publicationYear || 'Год не указан'} г.</Text>
                    </div>
                    <Paragraph 
                      style={{ color: '#666', marginBottom: 0 }}
                    >
                      {book.description && book.description.length > 120 
                        ? `${book.description.substring(0, 120)}...` 
                        : (book.description || 'Описание отсутствует')}
                    </Paragraph>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BookList; 
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Typography from '../common/Typography';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  coverImageUrl: string;
  publicationYear?: number;
  showRating?: boolean;
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
}) => {
  // Ограничиваем длину названия книги и автора
  const truncatedTitle = truncateText(title, 40);
  const truncatedAuthor = truncateText(author, 30);
  
  return (
    <div className="book-card-wrapper">
      <motion.div
        className="motion-container"
        whileHover={{ 
          y: -10,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
        }}
        transition={{ duration: 0.3 }}
        style={{ 
          borderRadius: '12px', 
          overflow: 'hidden', 
          background: 'white',
          border: '1px solid #eaeaea',
          height: '100%',
          marginBottom: '10px'
        }}
      >
        <Link to={`/books/${id}`} style={{ textDecoration: 'none' }}>
          <Card
            hoverable
            style={{ 
              width: '100%', 
              height: '100%',
              boxShadow: 'none',
              border: 'none'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <img
                src={coverImageUrl}
                alt={title}
                style={{
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              />
            </div>
            <div title={title} style={{ height: '42px', marginBottom: '5px' }}>
              <Title 
                level={5} 
                style={{ 
                  marginTop: 0, 
                  marginBottom: '5px', 
                  fontSize: '16px',
                }}
                className="text-ellipsis-2lines"
              >
                {truncatedTitle}
              </Title>
            </div>
            <div title={author}>
              <Text 
                style={{ 
                  color: '#666', 
                  display: 'block', 
                  fontSize: '14px',
                }}
                className="text-ellipsis"
              >
                {truncatedAuthor}
              </Text>
            </div>
            {publicationYear && (
              <Text style={{ color: '#999', fontSize: '12px' }}>
                {publicationYear}
              </Text>
            )}
            {showRating && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ 
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>
                  Рейтинг: 4.5
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
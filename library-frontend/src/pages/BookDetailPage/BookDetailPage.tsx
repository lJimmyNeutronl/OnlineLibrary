import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Row, 
  Col, 
  Breadcrumb, 
  Spin, 
  Empty 
} from '../../shared/ui';
import { FiArrowLeft } from 'react-icons/fi';
import { BookDetailContainer } from './BookDetailPage.styles';
import BookInfo from './components/BookInfo';
import BookActions from './components/BookActions';
import { useBookDetail } from './hooks/useBookDetail';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

/**
 * Страница детальной информации о книге
 */
const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { 
    book, 
    loading, 
    error, 
    isFavorite, 
    toggleFavorite, 
    startReading 
  } = useBookDetail(bookId);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !book) {
    return <Empty description="Книга не найдена" />;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <BookDetailContainer>
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/books">Книги</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: '16px' }}>
          <Link to="/books">
            <FiArrowLeft size={20} /> Назад к списку книг
          </Link>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <BookActions
              coverUrl={book.coverUrl}
              title={book.title}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onStartReading={startReading}
            />
          </Col>
          
          <Col xs={24} md={16}>
            <BookInfo book={book} />
          </Col>
        </Row>
      </BookDetailContainer>
    </motion.div>
  );
};

export default BookDetailPage; 
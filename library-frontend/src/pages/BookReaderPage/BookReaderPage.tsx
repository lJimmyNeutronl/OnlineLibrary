import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Typography, 
  Button, 
  Spin 
} from '../../shared/ui';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { useBookReader } from './hooks/useBookReader';
import ReaderControls from './components/ReaderControls';
import PaginationBar from './components/PaginationBar';
import { 
  ReaderContainer, 
  ReaderHeader, 
  HeaderTitle, 
  ReaderContent, 
  ReaderPanel,
  DocumentContainer
} from './BookReaderPage.styles';

const { Title, Paragraph } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

/**
 * Страница чтения книги
 */
const BookReaderPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { 
    book, 
    loading, 
    currentPage, 
    totalPages,
    handleBackToBook,
    goToPreviousPage,
    goToNextPage
  } = useBookReader(bookId);

  // Заглушки для кнопок управления читалкой
  const handleZoomIn = () => {};
  const handleZoomOut = () => {};
  const handleFullscreen = () => {};
  const handleAddToFavorite = () => {};

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ReaderContainer>
      <ReaderHeader>
        <HeaderTitle>
          <Button 
            type="text" 
            onClick={handleBackToBook}
            style={{ marginRight: '16px' }}
          >
            <AiOutlineArrowLeft size={18} /> Назад
          </Button>
          <h2>
            {book ? `Чтение: ${book.title}` : `Просмотр книги ${bookId}`}
          </h2>
        </HeaderTitle>
        
        <ReaderControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreen={handleFullscreen}
          onAddToFavorite={handleAddToFavorite}
        />
      </ReaderHeader>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <ReaderContent>
          <motion.div variants={slideUp}>
            <ReaderPanel>
              <Title level={2} style={{ marginBottom: '20px', textAlign: 'center' }}>
                Функционал чтения в разработке
              </Title>

              <DocumentContainer>
                <Paragraph style={{ marginBottom: '20px', textAlign: 'center' }}>
                  Для просмотра полной версии PDF-документа необходимо авторизоваться и перейти к полной версии страницы.
                </Paragraph>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <Button type="primary" onClick={handleBackToBook}>
                    Вернуться к информации о книге
                  </Button>
                </div>
              </DocumentContainer>

              <PaginationBar 
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
              />
            </ReaderPanel>
          </motion.div>
        </ReaderContent>
      </motion.div>
    </ReaderContainer>
  );
};

export default BookReaderPage; 
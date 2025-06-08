import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiGrid, FiList } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@hooks/reduxHooks';
import { fetchFavorites, removeFromFavorites } from '@store/slices/favoritesSlice';
import { Typography, Breadcrumb, Button, Row, Col, Divider, Spin, Empty } from '@components/common';
import AnimatedBackground from '@components/common/AnimatedBackground';
import BookList from '@components/book-card/BookList';
import { Book } from '@services/bookService';
import '@styles/common.css';
import styles from './FavoritesPage.module.css';

const { Title, Paragraph } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const FavoritesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const { books: favorites, isLoading } = useAppSelector(state => state.favorites);
  const isAuthenticated = !!token;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    // Проверка аутентификации
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Загрузка избранных книг
    dispatch(fetchFavorites());
  }, [isAuthenticated, navigate, dispatch]);

  // Преобразование избранных книг в формат, ожидаемый компонентом BookList
  const favoriteBooks: Book[] = favorites.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description || '',
    coverImageUrl: book.coverImageUrl || '',
    categories: []
  }));

  // Обработчик удаления из избранного
  const handleRemoveFromFavorites = async (bookId: number) => {
    try {
      await dispatch(removeFromFavorites(bookId)).unwrap();
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
    }
  };

  // Рендер содержимого страницы
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.favoritesLoadingContainer}>
          <Spin size="large" />
        </div>
      );
    }

    if (favorites.length === 0) {
      return (
        <div className={styles.favoritesEmptyContainer}>
          <Empty 
            description="У вас пока нет избранных книг" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button 
            type="primary" 
            onClick={() => navigate('/books')}
            className={styles.favoritesEmptyButton}
          >
            Перейти к каталогу книг
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.favoritesViewControls}>
          <div className={styles.viewModeSection}>
            <Button 
              icon={<FiGrid />} 
              onClick={() => setViewMode('grid')}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              className={styles.viewModeButton}
            />
            <Button 
              icon={<FiList />} 
              onClick={() => setViewMode('list')}
              type={viewMode === 'list' ? 'primary' : 'default'}
              className={styles.viewModeButton}
            />
          </div>
        </div>
        
        {/* Используем FavoritesBookList вместо BookList для поддержки удаления из избранного */}
        <FavoritesBookList 
          books={favoriteBooks} 
          viewMode={viewMode} 
          onRemoveFromFavorites={handleRemoveFromFavorites}
        />
      </>
    );
  };

  return (
    <AnimatedBackground className={styles.favoritesPageContainer}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className={styles.favoritesPageContent}
      >
        <Row className={styles.favoritesPageHeader}>
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item>
                <a href="/">Главная</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item style={{ color: '#8e54e9' }}>Избранное</Breadcrumb.Item>
            </Breadcrumb>
            
            <div className={styles.favoritesPageTitleRow}>
              <button 
                className="back-button"
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft size={20} className="back-button-icon" />
                Назад
              </button>
              <Title level={2} className={`${styles.favoritesPageTitle} gradient-text`}>
                <FiHeart className={styles.favoritesPageTitleIcon} /> Избранные книги
              </Title>
            </div>
          </Col>
        </Row>

        <Divider className={styles.favoritesPageDivider} />

        <motion.div variants={slideUp}>
          <Paragraph className="info-paragraph">
            Здесь собраны все книги, которые вы добавили в избранное. Вы можете вернуться к ним в любое время или удалить из списка.
          </Paragraph>
          
          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatedBackground>
  );
};

// Компонент-обертка для BookList с поддержкой удаления из избранного
interface FavoritesBookListProps {
  books: Book[];
  viewMode: 'grid' | 'list';
  onRemoveFromFavorites: (bookId: number) => void;
}

const FavoritesBookList: React.FC<FavoritesBookListProps> = ({ 
  books, 
  viewMode,
  onRemoveFromFavorites
}) => {
  // Используем BookList для отображения книг
  return (
    <BookList 
      books={books} 
      viewMode={viewMode} 
      loading={false}
      emptyText="У вас пока нет избранных книг"
      onRemoveFromFavorites={onRemoveFromFavorites}
    />
  );
};

export default FavoritesPage; 
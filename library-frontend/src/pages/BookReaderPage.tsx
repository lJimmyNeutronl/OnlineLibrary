import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AiOutlineArrowLeft, AiOutlineBook, AiOutlineInfoCircle, AiOutlineHeart } from 'react-icons/ai';
import { useAppSelector } from '../hooks/reduxHooks';
import ReaderSelector from '../components/readers/ReaderSelector';
import Button from '../components/common/Button';
import bookService from '../services/bookService';
import userService from '../services/userService';
import { getFavoritesFromStorage, saveFavoritesToStorage } from '../mocks/booksMock';
import './BookReaderPage.css';

// Проверка, есть ли методы работы с избранным, иначе используем моки
if (!bookService.getUserFavoriteBooks) {
  bookService.getUserFavoriteBooks = async function() {
    // Моковая имплементация для тестирования
    const favoriteIds = getFavoritesFromStorage();
    return favoriteIds.map(id => ({ id })) as any[];
  };
}

if (!bookService.addToFavorites) {
  bookService.addToFavorites = async function(bookId: number) {
    // Моковая имплементация для тестирования
    const favoriteIds = getFavoritesFromStorage();
    if (!favoriteIds.includes(bookId)) {
      favoriteIds.push(bookId);
      saveFavoritesToStorage(favoriteIds);
    }
  };
}

if (!bookService.removeFromFavorites) {
  bookService.removeFromFavorites = async function(bookId: number) {
    // Моковая имплементация для тестирования
    const favoriteIds = getFavoritesFromStorage();
    const updatedFavorites = favoriteIds.filter(id => id !== bookId);
    saveFavoritesToStorage(updatedFavorites);
  };
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const BookReaderPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  const [bookTitle, setBookTitle] = useState<string>('');
  const [isAddingToFavorites, setIsAddingToFavorites] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const hasStartedReading = useRef<boolean>(false);
  
  // Обработчик получения информации о количестве страниц из читалки
  const handleBookInfo = (info: { totalPages: number }) => {
    setTotalPages(info.totalPages);
  };
  
  // Проверка аутентификации и загрузка информации о книге
  useEffect(() => {
    // Проверка аутентификации
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/books/${bookId}/read` } });
      return;
    }

    // Автоматически добавляем книгу в историю чтения при открытии (только один раз)
    const startReading = async () => {
      if (!bookId || hasStartedReading.current) return;
      
      hasStartedReading.current = true;
      
      try {
        await userService.startReadingBook(parseInt(bookId));
        
        // Отправляем событие обновления профиля
        window.dispatchEvent(new CustomEvent('profileUpdate'));
      } catch (error) {
        console.error('Ошибка при добавлении книги в историю чтения:', error);
      }
    };

    startReading();

    // Загрузка информации о книге
    const loadBookInfo = async () => {
      try {
        if (!bookId) return;
        
        const book = await bookService.getBookById(parseInt(bookId));
        setBookTitle(book.title);
        
        // Проверка, добавлена ли книга в избранное
        try {
          const favorites = await bookService.getUserFavoriteBooks();
          setIsFavorite(favorites.some(favBook => favBook.id === parseInt(bookId)));
        } catch (error) {
          console.error('Ошибка при получении избранных книг:', error);
          // Используем локальное хранилище если API недоступно
          const favoriteIds = getFavoritesFromStorage();
          setIsFavorite(favoriteIds.includes(parseInt(bookId)));
        }
      } catch (error) {
        console.error('Ошибка при загрузке информации о книге:', error);
      }
    };
    
    loadBookInfo();
  }, [isAuthenticated, bookId, navigate]);
  
  // Добавление/удаление книги из избранного
  const handleToggleFavorite = async () => {
    if (!bookId) return;
    
    try {
      setIsAddingToFavorites(true);
      
      if (isFavorite) {
        // Удаление из избранного
        try {
          await bookService.removeFromFavorites(parseInt(bookId));
        } catch (error) {
          // Если API недоступно, используем локальное хранилище
          console.error('Ошибка при удалении из избранного, используем локальное хранилище:', error);
          const favoriteIds = getFavoritesFromStorage();
          const updatedFavorites = favoriteIds.filter(id => id !== parseInt(bookId));
          saveFavoritesToStorage(updatedFavorites);
        }
      } else {
        // Добавление в избранное
        try {
          await bookService.addToFavorites(parseInt(bookId));
        } catch (error) {
          // Если API недоступно, используем локальное хранилище
          console.error('Ошибка при добавлении в избранное, используем локальное хранилище:', error);
          const favoriteIds = getFavoritesFromStorage();
          if (!favoriteIds.includes(parseInt(bookId))) {
            favoriteIds.push(parseInt(bookId));
            saveFavoritesToStorage(favoriteIds);
          }
        }
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Ошибка при изменении статуса избранного:', error);
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="book-reader-page"
    >
      <div className="book-reader-header">
        <div className="book-reader-nav">
          <Button 
            type="text" 
            onClick={() => navigate(`/books/${bookId}`)}
            className="nav-button"
          >
            <AiOutlineArrowLeft /> Вернуться к книге
          </Button>
          <h2 className="book-title">
            {bookTitle || `Книга #${bookId}`}
          </h2>
        </div>
        <div className="book-reader-actions">
          <Button 
            type="text" 
            onClick={() => navigate(`/books/${bookId}`)} 
            className="action-button"
          >
            <AiOutlineInfoCircle />
            <span className="button-text">Информация</span>
          </Button>
          <Button 
            type="text" 
            onClick={handleToggleFavorite} 
            className={`action-button ${isFavorite ? 'favorite-active' : ''}`}
            disabled={isAddingToFavorites}
          >
            <AiOutlineHeart />
            <span className="button-text">{isFavorite ? 'В избранном' : 'В избранное'}</span>
          </Button>
        </div>
      </div>

      <div className="book-reader-content">
        {bookId && (
          <ReaderSelector 
            bookId={parseInt(bookId)} 
            onBookInfo={handleBookInfo}
          />
        )}
      </div>
    </motion.div>
  );
};

export default BookReaderPage;
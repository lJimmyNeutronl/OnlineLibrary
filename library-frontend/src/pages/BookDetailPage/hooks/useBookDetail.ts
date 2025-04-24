import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/reduxHooks';
import { useBooks } from '../../../features/books/hooks/useBooks';
import { Notification } from '../../../shared/ui';

/**
 * Хук для работы со страницей деталей книги
 */
export const useBookDetail = (bookId: string | undefined) => {
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  const { loadBookById, currentBook, isLoading, error } = useBooks();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Загрузка данных книги
  useEffect(() => {
    if (bookId) {
      loadBookById(parseInt(bookId));
    }
  }, [bookId, loadBookById]);

  // Обработка добавления/удаления из избранного
  const toggleFavorite = useCallback(() => {
    if (!isAuthenticated) {
      Notification.warning('Для добавления книги в избранное необходимо авторизоваться');
      return;
    }
    
    // В реальном приложении здесь будет API-запрос для добавления/удаления из избранного
    setIsFavorite(!isFavorite);
    Notification.success(isFavorite ? 'Книга удалена из избранного' : 'Книга добавлена в избранное');
  }, [isAuthenticated, isFavorite]);

  // Переход к чтению книги
  const startReading = useCallback(() => {
    if (!isAuthenticated) {
      Notification.warning('Для чтения книги необходимо авторизоваться');
      return;
    }
    
    if (bookId) {
      navigate(`/books/${bookId}/read`);
    }
  }, [isAuthenticated, bookId, navigate]);

  return {
    book: currentBook,
    loading: isLoading,
    error,
    isFavorite,
    toggleFavorite,
    startReading,
    isAuthenticated
  };
}; 
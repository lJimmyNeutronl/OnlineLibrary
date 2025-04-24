import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/reduxHooks';
import { useBooks } from '../../../features/books/hooks/useBooks';
import { Notification } from '../../../shared/ui';

/**
 * Хук для работы со страницей чтения книги
 */
export const useBookReader = (bookId: string | undefined) => {
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  const { loadBookById, currentBook, isLoading, error } = useBooks();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(10); // Mock data
  
  // Проверка аутентификации
  useEffect(() => {
    if (!isAuthenticated) {
      Notification.warning('Для чтения книги необходимо авторизоваться');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Загрузка данных книги
  useEffect(() => {
    if (bookId && isAuthenticated) {
      loadBookById(parseInt(bookId));
    }
  }, [bookId, loadBookById, isAuthenticated]);
  
  // Переход назад к информации о книге
  const handleBackToBook = useCallback(() => {
    if (bookId) {
      navigate(`/books/${bookId}`);
    }
  }, [bookId, navigate]);
  
  // Переход к предыдущей странице
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  // Переход к следующей странице
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  return {
    book: currentBook,
    loading: isLoading,
    error,
    currentPage,
    totalPages,
    isAuthenticated,
    handleBackToBook,
    goToPreviousPage,
    goToNextPage
  };
}; 
import { useState, useCallback, useEffect } from 'react';
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../store/slices/favoritesSlice';
import { useAppDispatch, useAppSelector } from './reduxHooks';

/**
 * Хук для управления избранными книгами
 */
export const useFavorites = (bookId?: number) => {
  const dispatch = useAppDispatch();
  const { books: favorites } = useAppSelector(state => state.favorites);
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Проверка статуса избранного при изменении bookId или favorites
  useEffect(() => {
    if (bookId && favorites.length > 0) {
      const isBookInFavorites = favorites.some(book => book.id === bookId);
      setIsFavorite(isBookInFavorites);
    }
  }, [bookId, favorites]);

  // Загрузка избранного при монтировании
  useEffect(() => {
    if (isAuthenticated && favorites.length === 0) {
      dispatch(fetchFavorites());
    }
  }, [isAuthenticated, favorites.length, dispatch]);

  const toggleFavorite = useCallback(async (
    targetBookId: number, 
    currentIsFavorite: boolean,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!isAuthenticated) {
      onError?.('Для добавления книги в избранное необходимо авторизоваться');
      return;
    }

    if (isUpdating) return;

    setIsUpdating(true);
    try {
      if (currentIsFavorite) {
        await dispatch(removeFromFavorites(targetBookId)).unwrap();
      } else {
        await dispatch(addToFavorites(targetBookId)).unwrap();
      }
      
      // Обновляем локальное состояние если это текущая книга
      if (targetBookId === bookId) {
        setIsFavorite(!currentIsFavorite);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      onError?.(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch, isUpdating, isAuthenticated, bookId]);

  // Упрощенная функция для текущей книги
  const toggleCurrentBookFavorite = useCallback(async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!bookId) {
      onError?.('ID книги не определен');
      return;
    }

    await toggleFavorite(bookId, isFavorite, onSuccess, onError);
  }, [bookId, isFavorite, toggleFavorite]);

  // Проверка, находится ли конкретная книга в избранном
  const isBookFavorite = useCallback((targetBookId: number) => {
    return favorites.some(book => book.id === targetBookId);
  }, [favorites]);

  return {
    toggleFavorite,
    toggleCurrentBookFavorite,
    isBookFavorite,
    isFavorite,
    isUpdating,
    favorites,
    isAuthenticated,
  };
}; 
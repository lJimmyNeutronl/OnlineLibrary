import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchProfile,
  updateProfile,
  addFavoriteBook,
  removeFavoriteBook,
  addBookmark,
  removeBookmark,
  updateReadingProgress,
  selectProfile,
  selectProfileLoading,
  selectProfileError
} from '../slice';
import { UpdateProfileData, AddFavoriteBookData, AddBookmarkData } from '../types';

/**
 * Хук для работы с профилем пользователя
 */
export const useProfile = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const isLoading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);

  // Загрузка профиля при монтировании компонента
  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  // Обновление данных профиля
  const handleUpdateProfile = (data: UpdateProfileData) => {
    return dispatch(updateProfile(data)).unwrap();
  };

  // Добавление книги в избранное
  const handleAddFavoriteBook = (data: AddFavoriteBookData) => {
    return dispatch(addFavoriteBook(data)).unwrap();
  };

  // Удаление книги из избранного
  const handleRemoveFavoriteBook = (id: number) => {
    return dispatch(removeFavoriteBook(id)).unwrap();
  };

  // Добавление закладки
  const handleAddBookmark = (data: AddBookmarkData) => {
    return dispatch(addBookmark(data)).unwrap();
  };

  // Удаление закладки
  const handleRemoveBookmark = (id: number) => {
    return dispatch(removeBookmark(id)).unwrap();
  };

  // Обновление прогресса чтения
  const handleUpdateReadingProgress = (
    bookId: number,
    page: number,
    percentage: number
  ) => {
    return dispatch(
      updateReadingProgress({ bookId, page, percentage })
    ).unwrap();
  };

  // Обновление профиля
  const refreshProfile = () => {
    return dispatch(fetchProfile()).unwrap();
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile: handleUpdateProfile,
    addFavoriteBook: handleAddFavoriteBook,
    removeFavoriteBook: handleRemoveFavoriteBook,
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark,
    updateReadingProgress: handleUpdateReadingProgress,
    refreshProfile
  };
}; 
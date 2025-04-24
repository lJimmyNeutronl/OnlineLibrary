// Экспорт компонентов
export { default as ProfilePage } from './components/ProfilePage';
export { default as ProfileInfo } from './components/ProfileInfo';
export { default as FavoriteBooks } from './components/FavoriteBooks';
export { default as ReadingHistoryList } from './components/ReadingHistoryList';

// Экспорт хуков
export { useProfile } from './hooks/useProfile';

// Экспорт типов
export * from './types';

// Экспорт API
export { profileApi } from './api';

// Экспорт вспомогательных функций
export * from './utils';

// Экспорт Redux slice
export {
  fetchProfile,
  updateProfile,
  addFavoriteBook,
  removeFavoriteBook,
  addBookmark,
  removeBookmark,
  updateReadingProgress,
  clearProfileError,
  clearProfile,
  selectProfile,
  selectProfileLoading,
  selectProfileError
} from './slice';
export { default as profileReducer } from './slice'; 
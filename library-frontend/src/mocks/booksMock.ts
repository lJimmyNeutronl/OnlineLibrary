import axios from 'axios';
import { mockBooks } from './booksData';

// Ключ для хранения избранных книг в localStorage
const FAVORITES_KEY = 'user_favorites';

// Получение избранных книг из localStorage
export const getFavoritesFromStorage = (): number[] => {
  try {
    const favoriteIds = localStorage.getItem(FAVORITES_KEY);
    return favoriteIds ? JSON.parse(favoriteIds) : [];
  } catch (error) {
    console.error('Ошибка при чтении избранного из localStorage:', error);
    return [];
  }
};

// Сохранение избранных книг в localStorage
export const saveFavoritesToStorage = (favoriteIds: number[]): void => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  } catch (error) {
    console.error('Ошибка при сохранении избранного в localStorage:', error);
  }
};

// Настройка мок-обработчиков API
export const setupFavoritesMocks = (): void => {
  // Получение избранных книг
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.config.url.includes('/favorites') && error.config.method === 'get') {
        const favoriteIds = getFavoritesFromStorage();
        const favorites = mockBooks.filter(book => favoriteIds.includes(book.id));
        return Promise.resolve({
          data: favorites,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
      return Promise.reject(error);
    }
  );

  // Добавление книги в избранное
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.config.url.includes('/favorites/') && error.config.method === 'post') {
        // Извлекаем ID книги из URL
        const bookId = parseInt(error.config.url.split('/').pop());
        const favoriteIds = getFavoritesFromStorage();
        
        // Добавляем книгу в избранное, если её там ещё нет
        if (!favoriteIds.includes(bookId)) {
          favoriteIds.push(bookId);
          saveFavoritesToStorage(favoriteIds);
        }
        
        return Promise.resolve({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
      return Promise.reject(error);
    }
  );

  // Удаление книги из избранного
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.config.url.includes('/favorites/') && error.config.method === 'delete') {
        // Извлекаем ID книги из URL
        const bookId = parseInt(error.config.url.split('/').pop());
        const favoriteIds = getFavoritesFromStorage();
        
        // Удаляем книгу из избранного
        const updatedFavorites = favoriteIds.filter(id => id !== bookId);
        saveFavoritesToStorage(updatedFavorites);
        
        return Promise.resolve({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
      return Promise.reject(error);
    }
  );
}; 
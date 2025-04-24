import { API_URL } from '../../app/constants';
import { 
  AddBookmarkData, 
  AddFavoriteBookData, 
  Bookmark, 
  FavoriteBook, 
  ReadingHistory, 
  UpdateProfileData, 
  UserProfile 
} from './types';

/**
 * API клиент для работы с профилем пользователя
 */
export const profileApi = {
  /**
   * Получение профиля пользователя
   */
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении профиля');
    }

    return await response.json();
  },

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Ошибка при обновлении профиля');
    }

    return await response.json();
  },

  /**
   * Получение истории чтения
   */
  async getReadingHistory(): Promise<ReadingHistory[]> {
    const response = await fetch(`${API_URL}/profile/reading-history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении истории чтения');
    }

    return await response.json();
  },

  /**
   * Обновление прогресса чтения
   */
  async updateReadingProgress(bookId: number, page: number, percentage: number): Promise<ReadingHistory> {
    const response = await fetch(`${API_URL}/profile/reading-history/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ lastPage: page, readPercentage: percentage })
    });

    if (!response.ok) {
      throw new Error('Ошибка при обновлении прогресса чтения');
    }

    return await response.json();
  },

  /**
   * Получение закладок
   */
  async getBookmarks(): Promise<Bookmark[]> {
    const response = await fetch(`${API_URL}/profile/bookmarks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении закладок');
    }

    return await response.json();
  },

  /**
   * Добавление закладки
   */
  async addBookmark(data: AddBookmarkData): Promise<Bookmark> {
    const response = await fetch(`${API_URL}/profile/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Ошибка при добавлении закладки');
    }

    return await response.json();
  },

  /**
   * Удаление закладки
   */
  async deleteBookmark(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/profile/bookmarks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при удалении закладки');
    }
  },

  /**
   * Получение избранных книг
   */
  async getFavoriteBooks(): Promise<FavoriteBook[]> {
    const response = await fetch(`${API_URL}/profile/favorites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении избранных книг');
    }

    return await response.json();
  },

  /**
   * Добавление книги в избранное
   */
  async addFavoriteBook(data: AddFavoriteBookData): Promise<FavoriteBook> {
    const response = await fetch(`${API_URL}/profile/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Ошибка при добавлении книги в избранное');
    }

    return await response.json();
  },

  /**
   * Удаление книги из избранного
   */
  async deleteFavoriteBook(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/profile/favorites/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка при удалении книги из избранного');
    }
  }
}; 
import API from './api';

// Интерфейсы
export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  registrationDate: string;
  lastLoginDate: string | null;
  roles: string[];
}

export interface UserProfileUpdateData {
  firstName: string;
  lastName: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface UserActivityEntry {
  action: string;
  timestamp: string;
  bookTitle?: string;
  bookId?: number;
}

export interface UserActivity {
  date: string;
  entries: UserActivityEntry[];
}

export interface ReadingHistoryItem {
  id: number;
  book: {
    id: number;
    title: string;
    author: string;
    coverImageUrl: string | null;
  };
  lastReadDate: string;
  lastReadPage: number;
  isCompleted: boolean;
}

export interface FavoriteBook {
  id: number;
  title: string;
  author: string;
  coverImageUrl: string | null;
  description: string | null;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

const userService = {
  // Получение информации о текущем пользователе
  async getCurrentUser(): Promise<User> {
    const response = await API.get('/users/me');
    return response.data;
  },

  // Обновление профиля пользователя
  async updateProfile(data: UserProfileUpdateData): Promise<User> {
    try {
      const response = await API.put('/users/update', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  },

  // Получение избранных книг пользователя
  async getFavorites(): Promise<FavoriteBook[]> {
    const response = await API.get('/users/favorites');
    return response.data;
  },

  // Добавление книги в избранное
  async addToFavorites(bookId: number): Promise<void> {
    await API.post(`/users/favorites/${bookId}`);
  },

  // Удаление книги из избранного
  async removeFromFavorites(bookId: number): Promise<void> {
    await API.delete(`/users/favorites/${bookId}`);
  },

  // Получение истории чтения пользователя
  async getReadingHistory(): Promise<ReadingHistoryItem[]> {
    const response = await API.get('/users/reading-history', {
      params: {
        page: 0,
        size: 1000, // Получаем большое количество для отображения всей истории
        sortBy: 'lastReadDate',
        direction: 'desc'
      }
    });
    
    // API возвращает Page<ReadingHistory>, нам нужен массив content
    return response.data.content || [];
  },

  // Обновление прогресса чтения (БЕЗ изменения статуса isCompleted)
  async updateReadingProgress(bookId: number, lastReadPage: number): Promise<ReadingHistoryItem> {
    const response = await API.post(`/users/reading-history/${bookId}`, null, {
      params: { lastReadPage } // НЕ передаем isCompleted!
    });
    
    return response.data;
  },

  // Начало чтения книги (добавление в историю чтения)
  async startReadingBook(bookId: number): Promise<ReadingHistoryItem> {
    try {
      // Сначала проверяем, есть ли уже эта книга в истории
      const history = await this.getReadingHistory();
      const existingItem = history.find(item => item.book.id === bookId);
      
      if (existingItem) {
        // Если книга уже в истории, НЕ отправляем запрос на сервер
        // Просто возвращаем существующие данные без изменений
        return existingItem;
      } else {
        // Если книги нет в истории, создаем новую запись как не прочитанную
        const response = await API.post(`/users/reading-history/${bookId}`, null, {
          params: { isCompleted: false }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Ошибка при обновлении истории чтения:', error);
      throw error;
    }
  },

  // Получение истории активности пользователя
  async getUserActivity(days = 7): Promise<UserActivity[]> {
    const response = await API.get('/users/activity', {
      params: { days }
    });
    return response.data;
  },
  
  // Смена пароля пользователя
  async changePassword(data: PasswordChangeData): Promise<ChangePasswordResponse> {
    try {
      const response = await API.post('/users/change-password', data);
      return { 
        success: true, 
        message: response.data.message || 'Пароль успешно изменен' 
      };
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      throw error;
    }
  },

  // Очистка истории чтения пользователя
  async clearReadingHistory(): Promise<void> {
    try {
      await API.delete('/users/reading-history');
    } catch (error) {
      console.error('Ошибка при очистке истории чтения:', error);
      throw new Error('Не удалось очистить историю чтения');
    }
  }
};

export default userService; 
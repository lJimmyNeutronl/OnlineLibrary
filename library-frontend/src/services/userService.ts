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
  firstName: string | null;
  lastName: string | null;
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
    const response = await API.put('/users/update', data);
    return response.data;
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
    const response = await API.get('/users/reading-history');
    return response.data;
  },

  // Обновление истории чтения
  async updateReadingHistory(bookId: number, isCompleted: boolean = false): Promise<ReadingHistoryItem> {
    const response = await API.post(`/users/reading-history/${bookId}`, null, {
      params: { isCompleted }
    });
    return response.data;
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
  }
};

export default userService; 
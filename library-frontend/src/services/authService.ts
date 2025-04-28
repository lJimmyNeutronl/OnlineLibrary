import API from './api';

// Обновлено с учетом структуры JwtResponse с бэкенда
interface LoginResponse {
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string;
    roles: string[];
  };
  token: string;
}

interface RegisterResponse {
  message: string;
}

const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    try {
      // Показываем, что метод запущен
      console.log('LOGIN МЕТОД ЗАПУЩЕН с данными:', { 
        email: credentials.email,
        password: credentials.password.substr(0, 1) + '***' // Показываем только первую букву пароля
      });
      
      // Пытаемся выполнить запрос
      const response = await API.post('/auth/signin', credentials);
      
      console.log('УСПЕХ ЗАПРОСА:', response.status);
      
      // Проверяем наличие данных
      const data = response.data || {};
      console.log('ДАННЫЕ ПОЛУЧЕНЫ:', !!data);
      
      // Проверяем, что получили токен
      if (!data.token) {
        console.error('ОШИБКА: Нет токена в ответе');
        throw new Error('Сервер не вернул токен авторизации');
      }
      
      // Формируем и возвращаем объект с данными
      const result = {
        user: {
          id: data.id || 0,
          email: data.email || '',
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          displayName: data.displayName || data.email || 'Пользователь',
          roles: Array.isArray(data.roles) ? data.roles : []
        },
        token: data.token
      };
      
      console.log('УСПЕШНЫЙ ВХОД:', result.user.email);
      return result;
    } catch (error: any) {
      console.error('!!ОШИБКА ВХОДА!!', error);
      
      // Логируем детали ошибки, если они есть
      if (error.response) {
        console.error('ДЕТАЛИ ОШИБКИ:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },

  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<RegisterResponse> {
    try {
      // Выполняем запрос на регистрацию
      const response = await API.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('[Auth] Ошибка регистрации:', error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  getCurrentUser(): LoginResponse['user'] | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // В реальном приложении здесь может быть декодирование JWT-токена
    // или запрос к /auth/me для получения текущего пользователя
    return null;
  },
  
  // Метод для получения данных пользователя через API
  async fetchCurrentUser(): Promise<LoginResponse['user']> {
    try {
      // Получаем данные текущего пользователя
      const response = await API.get('/users/me');
      const userData = response.data;
      
      // Проверка на наличие обязательных полей
      if (!userData || !userData.id) {
        throw new Error('Неверный формат данных пользователя');
      }
      
      // Формируем объект с данными пользователя
      const user = {
        id: userData.id,
        email: userData.email || '',
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        displayName: userData.displayName || userData.email || 'Пользователь',
        roles: Array.isArray(userData.roles) ? userData.roles : []
      };
      
      return user;
    } catch (error) {
      console.error('[Auth] Ошибка получения данных пользователя:', error);
      throw error;
    }
  }
};

export default authService; 
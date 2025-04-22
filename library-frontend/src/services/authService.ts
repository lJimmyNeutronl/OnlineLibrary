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
      const response = await API.post('/auth/signin', credentials);
      
      // Преобразуем ответ от бэкенда в формат, ожидаемый фронтендом
      const data = response.data;
      
      // Формируем объект пользователя из ответа
      const user = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        roles: data.roles
      };
      
      return {
        user: user,
        token: data.token
      };
    } catch (error) {
      console.error('Login error:', error);
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
      const response = await API.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
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
  }
};

export default authService; 
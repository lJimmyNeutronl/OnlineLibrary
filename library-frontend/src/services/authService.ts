import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    registrationDate: string;
    lastLoginDate: string;
    roles: string[];
  };
  token: string;
}

interface RegisterResponse extends LoginResponse {}

const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/signin`, credentials);
    return response.data;
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<RegisterResponse> {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
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
import API from './api';

// API routes
const AUTH_ROUTES = {
  signin: '/auth/signin',
  signup: '/auth/signup',
  me: '/users/me',
} as const;

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

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

// Helper functions
function mapUser(data: any): LoginResponse['user'] {
  return {
    id: data.id || 0,
    email: data.email || '',
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    displayName: data.displayName || data.email || 'Пользователь',
    roles: Array.isArray(data.roles) ? data.roles : [],
  };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await API.post(AUTH_ROUTES.signin, credentials);
      const data = response.data || {};
      
      if (!data.token) {
        throw new Error('Сервер не вернул токен авторизации');
      }
      
      return {
        user: mapUser(data),
        token: data.token
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Ошибка авторизации');
      }
      throw error;
    }
  },

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await API.post(AUTH_ROUTES.signup, userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Ошибка регистрации');
      }
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
  },
  
  async fetchCurrentUser(): Promise<LoginResponse['user']> {
    try {
      const response = await API.get(AUTH_ROUTES.me);
      const userData = response.data;
      
      if (!userData || !userData.id) {
        throw new Error('Неверный формат данных пользователя');
      }
      
      return mapUser(userData);
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Ошибка получения данных пользователя');
      }
      throw error;
    }
  }
};

export default authService; 
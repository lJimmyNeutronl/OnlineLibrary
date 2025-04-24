/**
 * Типы для функционала аутентификации
 */

/**
 * Данные формы входа
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Данные формы регистрации
 */
export interface RegisterFormData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

/**
 * Данные пользователя
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Данные для хука useAuth
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
} 
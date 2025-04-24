/**
 * Тип пользователя
 */
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  token?: string;
}

/**
 * Параметры для входа в систему
 */
export interface LoginParams {
  email: string;
  password: string;
}

/**
 * Параметры для регистрации
 */
export interface RegisterParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Ответ от сервера при аутентификации
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Состояние аутентификации
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  handleLogin: (data: LoginFormData) => Promise<void>;
  handleRegister: (data: RegisterFormData) => Promise<void>;
} 
import { axios } from '../../shared/api';
import { LoginFormData, RegisterFormData, AuthResponse, User } from './types';

// URL для API аутентификации
const AUTH_URL = '/auth';

/**
 * Функция для авторизации пользователя
 * @param loginData Данные для входа
 */
export const login = async (loginData: LoginFormData): Promise<AuthResponse> => {
  const response = await axios.post(`${AUTH_URL}/login`, loginData);
  return response.data;
};

/**
 * Функция для регистрации пользователя
 * @param registerData Данные для регистрации
 */
export const register = async (registerData: RegisterFormData): Promise<AuthResponse> => {
  const response = await axios.post(`${AUTH_URL}/register`, registerData);
  return response.data;
};

/**
 * Функция для выхода пользователя
 */
export const logout = async (): Promise<void> => {
  await axios.post(`${AUTH_URL}/logout`);
};

/**
 * Функция для получения информации о текущем пользователе
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await axios.get(`${AUTH_URL}/me`);
  return response.data;
}; 
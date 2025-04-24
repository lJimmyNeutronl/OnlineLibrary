import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/reduxHooks';
import { LoginFormData, RegisterFormData, AuthContextType } from '../types';
import { login as loginAPI, register as registerAPI } from '../api';
import { setUser, setToken, logout as logoutAction } from '../slice';

/**
 * Хук для работы с авторизацией
 */
export const useAuth = (): AuthContextType => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Авторизация пользователя
   */
  const login = useCallback(async (data: LoginFormData): Promise<void> => {
    try {
      const response = await loginAPI(data);
      
      // Сохраняем токен и пользователя в localStorage если включена опция rememberMe
      if (data.rememberMe) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
      }
      
      // Обновляем состояние Redux
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка авторизации';
      setLocalError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dispatch]);

  /**
   * Регистрация пользователя
   */
  const register = useCallback(async (data: RegisterFormData): Promise<void> => {
    try {
      // Создаем копию данных без confirmPassword для отправки на сервер
      const { confirmPassword, ...registerData } = data;
      
      const response = await registerAPI(registerData as any);
      
      // Сохраняем токен и пользователя в localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_info', JSON.stringify(response.user));
      
      // Обновляем состояние Redux
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
      setLocalError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dispatch]);

  /**
   * Выход пользователя
   */
  const logout = useCallback(() => {
    // Удаляем токен и пользователя из localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // Обновляем состояние Redux
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    isAuthenticated,
    isLoading,
    user,
    error: error || localError,
    login,
    register,
    logout,
    handleLogin: login,
    handleRegister: register
  };
};

export default useAuth; 
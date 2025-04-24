import axios from 'axios';

// Базовая конфигурация для API
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Создаем экземпляр axios с базовыми настройками
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запросов для добавления токена
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор ответов для обработки ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // При получении 401 - удаляем токен и информацию о пользователе
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      // Перенаправляем на страницу логина
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { axiosInstance as axios }; 
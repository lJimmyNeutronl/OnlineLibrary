import axios from 'axios';

// Базовый URL для всех API-запросов
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
console.log('[Auth Debug] API initialized with baseURL:', baseURL);

// Создаем экземпляр axios с настроенным baseURL
const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запросов для добавления токена авторизации
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор ответов для обработки ошибок
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обрабатываем 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Очищаем токен и перенаправляем на страницу входа
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API; 
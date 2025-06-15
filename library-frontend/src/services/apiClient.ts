import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик запросов для автоматического добавления токена аутентификации
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок ответов
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка ошибок аутентификации
    if (error.response && error.response.status === 401) {
      // Можно добавить перенаправление на страницу логина
      console.error('Authentication error');
    }
    return Promise.reject(error);
  }
);

export default apiClient; 
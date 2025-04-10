import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Базовый URL для API
const API_URL = 'http://localhost:8080/api';

// Создаем экземпляр axios с настройками по умолчанию
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Обработка ошибок авторизации (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Базовый URL для API
const API_URL = 'http://localhost:8080/api';

// Создаем экземпляр axios с базовым URL
const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик запросов для добавления заголовка авторизации
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки ошибок
API.interceptors.response.use(
  (response) => {
    // Если ответ успешный, просто возвращаем его
    return response;
  },
  (error) => {
    // Логируем подробности ошибки для отладки
    if (error.response) {
      // Ошибка от сервера
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config.url
      });
    } else if (error.request) {
      // Запрос был отправлен, но ответ не получен
      console.error('API Request Error (No Response):', error.request);
    } else {
      // Ошибка при настройке запроса
      console.error('API Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default API; 
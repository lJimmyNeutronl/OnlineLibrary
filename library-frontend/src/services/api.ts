import axios from 'axios';

// Определяем базовый URL из переменных окружения или используем значение по умолчанию
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
console.log('[Auth Debug] API initialized with baseURL:', baseURL);

// Создаем экземпляр axios с базовым URL и заголовками
const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов, который добавляет токен к каждому запросу
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов для обработки ошибок
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Проверка наличия ответа от сервера
    if (error.response) {
      const { status, config } = error.response;
      
      // Для отладки
      console.error(`API Error: ${status} on ${config.url}`, error.response.data);
      
      // Список эндпоинтов авторизации, для которых не нужно удалять токен
      const authEndpoints = [
        '/auth/signin',
        '/auth/signup',
        '/users/change-password'
      ];
      
      // Определяем, является ли текущий запрос авторизационным
      const isAuthEndpoint = authEndpoints.some(endpoint => 
        config.url && config.url.includes(endpoint)
      );
      
      // Обработка ошибки авторизации
      if (status === 401 && !isAuthEndpoint) {
        // Удаляем токен только для не-авторизационных эндпоинтов
        console.warn('Авторизация не действительна. Удаление токена.');
        localStorage.removeItem('token');
      }
    } else {
      // Ошибка без ответа сервера (сетевая ошибка)
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default API; 
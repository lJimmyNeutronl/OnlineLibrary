import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Базовый URL для API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Конфигурация для Axios
const config: AxiosRequestConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Создание экземпляра Axios
export const apiInstance: AxiosInstance = axios.create(config);

/**
 * Перехватчик запросов для добавления токена авторизации
 */
apiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Перехватчик ответов для обработки ошибок
 */
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Логирование ошибок API
    if (error.response) {
      // Ошибка от сервера
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });

      // Обработка 401 ошибки (Unauthorized)
      if (error.response.status === 401) {
        // Удаляем токен и перенаправляем на страницу входа
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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

// Базовый класс для API-клиентов
export abstract class BaseApi {
  protected api: AxiosInstance;

  constructor(api: AxiosInstance = apiInstance) {
    this.api = api;
  }

  protected async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  protected async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  protected async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  protected async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }

  protected async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }
}

export default apiInstance; 
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { STORAGE_KEYS } from './storage';

/**
 * Базовая конфигурация для HTTP-запросов
 */
export const httpConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Создает инстанс axios с базовой конфигурацией
 * @returns Инстанс axios
 */
export const createAxiosInstance = () => {
  const instance = axios.create(httpConfig);

  // Интерцептор запросов для добавления токена авторизации
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Интерцептор ответов для обработки ошибок
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Действия при получении 401 Unauthorized
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * HTTP-клиент для API-запросов
 */
export const httpClient = createAxiosInstance();

/**
 * Обрабатывает HTTP-ошибку и возвращает удобное сообщение
 * @param error Объект ошибки
 * @returns Объект с сообщением об ошибке и статусом
 */
export const handleHttpError = (error: unknown): { message: string; status?: number } => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    
    // Проверяем, содержит ли ответ JSON с сообщением об ошибке
    const responseData = axiosError.response?.data as { message?: string; error?: string } | undefined;
    const errorMessage = responseData?.message || responseData?.error || axiosError.message;
    
    // Возвращаем сообщение в зависимости от статуса
    if (status === 400) {
      return { message: `Ошибка в запросе: ${errorMessage}`, status };
    } else if (status === 401) {
      return { message: 'Требуется авторизация', status };
    } else if (status === 403) {
      return { message: 'Доступ запрещен', status };
    } else if (status === 404) {
      return { message: 'Ресурс не найден', status };
    } else if (status === 429) {
      return { message: 'Слишком много запросов. Пожалуйста, повторите позже', status };
    } else if (status && status >= 500) {
      return { message: 'Ошибка сервера. Пожалуйста, повторите позже', status };
    }
    
    return { message: errorMessage || 'Произошла ошибка при выполнении запроса', status };
  }
  
  return { message: 'Неизвестная ошибка' };
};

/**
 * Загружает файл на сервер
 * @param url URL для загрузки
 * @param file Файл для загрузки
 * @param onProgress Callback для отслеживания прогресса (0-100)
 * @param additionalFormData Дополнительные данные для формы
 * @returns Promise с ответом сервера
 */
export const uploadFile = async <T = any>(
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
  additionalFormData?: Record<string, string>
): Promise<AxiosResponse<T>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Добавляем дополнительные данные, если они есть
  if (additionalFormData) {
    Object.entries(additionalFormData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  // Если передан callback для отслеживания прогресса
  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      onProgress(percentCompleted);
    };
  }
  
  return httpClient.post<T>(url, formData, config);
};

/**
 * Скачивает файл с сервера
 * @param url URL для скачивания
 * @param filename Имя файла для сохранения
 * @param onProgress Callback для отслеживания прогресса (0-100)
 * @returns Promise, который разрешается после скачивания файла
 */
export const downloadFile = async (
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const config: AxiosRequestConfig = {
    responseType: 'blob',
  };
  
  // Если передан callback для отслеживания прогресса
  if (onProgress) {
    config.onDownloadProgress = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      onProgress(percentCompleted);
    };
  }
  
  const response = await httpClient.get(url, config);
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  // Очистка
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}; 
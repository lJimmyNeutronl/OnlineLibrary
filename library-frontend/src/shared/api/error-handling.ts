import { AxiosError } from 'axios';
import { apiInstance } from './base';

/**
 * Интерфейс для стандартизированного объекта ошибки API
 */
export interface ApiError {
  status: number | null;
  message: string;
  errors?: Record<string, string[]>;
  code: string;
}

/**
 * Функция для извлечения информации об ошибке из объекта AxiosError
 */
export const extractApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Ошибка с ответом от сервера
    const responseData = error.response.data as any;
    
    return {
      status: error.response.status,
      message: responseData.message || 'Произошла ошибка сервера',
      errors: responseData.errors,
      code: responseData.code || `ERROR_${error.response.status}`
    };
  } else if (error.request) {
    // Запрос был сделан, но ответа не получено
    return {
      status: null,
      message: 'Не удалось получить ответ от сервера. Проверьте соединение с интернетом.',
      code: 'NETWORK_ERROR'
    };
  } else {
    // Что-то произошло при настройке запроса
    return {
      status: null,
      message: error.message || 'Произошла непредвиденная ошибка',
      code: 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Функция для обработки ошибки формы
 * Преобразует ошибку API в формат, который можно использовать с формами
 */
export const processFormErrors = (apiError: ApiError): Record<string, string> => {
  const formErrors: Record<string, string> = {};
  
  // Добавляем основное сообщение об ошибке, если нет детализированных ошибок
  if (!apiError.errors || Object.keys(apiError.errors).length === 0) {
    formErrors._error = apiError.message;
    return formErrors;
  }
  
  // Преобразуем массивы ошибок в строки для каждого поля
  Object.entries(apiError.errors).forEach(([field, errorMessages]) => {
    formErrors[field] = errorMessages.join('. ');
  });
  
  return formErrors;
};

/**
 * Функция для получения сообщения об ошибке для отображения пользователю
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = extractApiError(error);
    return apiError.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка';
};

// Преобразование AxiosError в стандартизированную ApiError
export const mapAxiosError = (error: AxiosError): ApiError => {
  // Извлекаем статус и данные ответа
  const status = error.response?.status || 500;
  const responseData = error.response?.data as any;
  
  // Определяем сообщение об ошибке
  const message = 
    responseData?.message || 
    error.message || 
    `Ошибка запроса: ${status}`;
  
  // Определяем код ошибки
  const code = 
    responseData?.code || 
    `ERROR_${status}`;
  
  return {
    message,
    code,
    status
  };
};

// Настройка интерцепторов для глобальной обработки ошибок
apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Обработка различных статусов ошибок
      const status = error.response.status;
      
      // Обработка ошибки неавторизованного доступа
      if (status === 401) {
        // Очистка данных аутентификации
        localStorage.removeItem('token');
        // Можно добавить перенаправление на страницу входа
      }
      
      // Преобразуем ошибку в стандартный формат
      const apiError = mapAxiosError(error);
      
      // Можно добавить логирование
      console.error('API Error:', apiError);
    }
    
    // Передаем ошибку дальше, чтобы её можно было обработать в компонентах
    return Promise.reject(error);
  }
);

// Функция для обработки ошибок в компонентах
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return mapAxiosError(error);
  }
  
  // Для неизвестных ошибок
  return {
    message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
}; 
import { AuthProvider } from 'react-admin';
import axios from 'axios';

// Настройка axios для отправки токена в заголовках
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Перенаправляем на главную страницу, если токен недействителен
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
};

// Инициализируем перехватчики при загрузке модуля
setupAxiosInterceptors();

// Функция для получения данных пользователя из localStorage или Redux store
const getUserData = () => {
  // Сначала пытаемся получить из Redux store (если доступен)
  try {
    // @ts-ignore - получаем состояние из глобального window объекта
    const state = window.__REDUX_STORE__?.getState?.();
    if (state?.auth?.user) {
      return state.auth.user;
    }
  } catch (error) {
    // Игнорируем ошибку и продолжаем
  }

  // Если Redux store недоступен, получаем из localStorage
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя из localStorage:', error);
    }
  }

  return null;
};

// Функция проверки прав администратора
const isUserAdmin = (user: any) => {
  if (!user?.roles) return false;
  
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role: any) => {
    if (typeof role === 'string') {
      return role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN';
    }
    if (role?.name) {
      return role.name === 'ROLE_ADMIN' || role.name === 'ROLE_SUPERADMIN';
    }
    return false;
  });
};

const authProvider: AuthProvider = {
  // Вход в систему - теперь просто проверяем существующую авторизацию
  login: async () => {
    const token = localStorage.getItem('token');
    const user = getUserData();

    if (!token) {
      return Promise.reject(new Error('Необходимо войти в систему'));
    }

    if (!user) {
      return Promise.reject(new Error('Данные пользователя не найдены'));
    }

    if (!isUserAdmin(user)) {
      return Promise.reject(new Error('У вас нет прав доступа к админ-панели'));
    }

    return Promise.resolve();
  },

  // Выход из системы - перенаправляем на главную страницу
  logout: () => {
    // Не удаляем токен, просто перенаправляем на главную
    window.location.href = '/';
    return Promise.resolve();
  },

  // Проверка аутентификации
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = getUserData();
    
    if (!token) {
      return Promise.reject(new Error('Не авторизован'));
    }

    if (!user) {
      return Promise.reject(new Error('Данные пользователя не найдены'));
    }

    if (!isUserAdmin(user)) {
      return Promise.reject(new Error('Нет прав администратора'));
    }

    return Promise.resolve();
  },

  // Проверка ошибок аутентификации
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      // Перенаправляем на главную страницу вместо страницы входа админ-панели
      window.location.href = '/';
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // Получение разрешений пользователя
  getPermissions: () => {
    const user = getUserData();
    if (!user) {
      return Promise.reject(new Error('Пользователь не найден'));
    }

    const roles = Array.isArray(user.roles) ? user.roles : [];
    
    // Преобразуем роли в единый формат строк
    const permissions = roles.map((role: any) => {
      if (typeof role === 'string') return role;
      if (role?.name) return role.name;
      return '';
    }).filter(Boolean);
    
    return Promise.resolve(permissions);
  },

  // Получение личности пользователя
  getIdentity: () => {
    const user = getUserData();
    if (!user) {
      return Promise.reject(new Error('Пользователь не найден'));
    }

    return Promise.resolve({
      id: user.id,
      fullName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      avatar: undefined,
    });
  },
};

export default authProvider; 
// Константы для хранения токенов
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';

// Функция для получения access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Функция для установки access token
export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// Функция для получения refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Функция для установки refresh token
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

// Функция для получения информации о пользователе
export const getUserInfo = (): any => {
  const userInfo = localStorage.getItem(USER_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
};

// Функция для установки информации о пользователе
export const setUserInfo = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Функция для проверки аутентификации пользователя
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Функция для выхода пользователя
export const logout = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Функция для обновления токенов
export const updateTokens = (accessToken: string, refreshToken: string): void => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}; 
/**
 * Сохраняет значение в localStorage
 * @param key Ключ для хранения
 * @param value Значение для сохранения
 */
export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Ошибка при сохранении в localStorage:', error);
  }
};

/**
 * Получает значение из localStorage
 * @param key Ключ для получения
 * @param defaultValue Значение по умолчанию, если ключ не найден
 * @returns Значение из localStorage или defaultValue
 */
export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Ошибка при получении из localStorage:', error);
    return defaultValue;
  }
};

/**
 * Удаляет значение из localStorage
 * @param key Ключ для удаления
 */
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Ошибка при удалении из localStorage:', error);
  }
};

/**
 * Очищает весь localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Ошибка при очистке localStorage:', error);
  }
};

/**
 * Константы для ключей localStorage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  READING_PROGRESS: 'reading_progress',
  FAVORITES: 'favorites',
  LANGUAGE: 'language',
}; 
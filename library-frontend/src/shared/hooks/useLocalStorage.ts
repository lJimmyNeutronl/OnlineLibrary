import { useState, useEffect } from 'react';

/**
 * Хук для работы с localStorage
 * @param key Ключ для сохранения в localStorage
 * @param initialValue Начальное значение
 * @returns Кортеж [значение, функция установки значения]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Получаем значение из localStorage или используем initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Ошибка чтения из localStorage для ключа "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Функция для обновления значения в localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Ошибка записи в localStorage для ключа "${key}":`, error);
    }
  };

  // Слушаем изменения в localStorage (например, из других вкладок)
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue];
}

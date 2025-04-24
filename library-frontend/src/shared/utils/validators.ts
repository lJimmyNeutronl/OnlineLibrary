/**
 * Проверяет, является ли строка валидным email
 * @param email Строка для проверки
 * @returns true, если строка является валидным email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Проверяет, является ли строка пустой
 * @param value Строка для проверки
 * @returns true, если строка не пустая
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Проверяет, соответствует ли строка минимальной длине
 * @param value Строка для проверки
 * @param minLength Минимальная длина
 * @returns true, если строка соответствует минимальной длине
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Проверяет, соответствует ли строка максимальной длине
 * @param value Строка для проверки
 * @param maxLength Максимальная длина
 * @returns true, если строка соответствует максимальной длине
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Проверяет, соответствует ли строка требованиям к паролю
 * @param password Пароль для проверки
 * @returns true, если пароль соответствует требованиям
 */
export const isStrongPassword = (password: string): boolean => {
  // Минимум 8 символов, хотя бы одна цифра, одна заглавная и одна строчная буква
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Проверяет, совпадают ли два пароля
 * @param password Основной пароль
 * @param confirmPassword Подтверждение пароля
 * @returns true, если пароли совпадают
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Проверяет, является ли строка валидным URL
 * @param url Строка для проверки
 * @returns true, если строка является валидным URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Проверяет, является ли строка валидным телефонным номером
 * @param phone Строка для проверки
 * @returns true, если строка является валидным телефонным номером
 */
export const isValidPhone = (phone: string): boolean => {
  // Базовая проверка телефонного номера (может быть адаптирована под требования)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Проверяет, соответствует ли файл максимальному размеру
 * @param file Файл для проверки
 * @param maxSizeInMB Максимальный размер в MB
 * @returns true, если файл соответствует максимальному размеру
 */
export const hasValidFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Проверяет, соответствует ли файл разрешенным типам
 * @param file Файл для проверки
 * @param allowedTypes Массив разрешенных MIME-типов
 * @returns true, если тип файла разрешен
 */
export const hasValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Проверяет, соответствует ли файл разрешенным расширениям
 * @param fileName Имя файла
 * @param allowedExtensions Массив разрешенных расширений (без точки, например: 'jpg', 'png')
 * @returns true, если расширение файла разрешено
 */
export const hasValidFileExtension = (fileName: string, allowedExtensions: string[]): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.includes(extension);
};

/**
 * Проверяет, является ли значение положительным числом
 * @param value Значение для проверки
 * @returns true, если значение является положительным числом
 */
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value > 0;
};

/**
 * Проверяет, находится ли число в заданном диапазоне
 * @param value Число для проверки
 * @param min Минимальное значение
 * @param max Максимальное значение
 * @returns true, если число находится в заданном диапазоне
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
}; 
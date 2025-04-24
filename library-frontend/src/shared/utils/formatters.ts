/**
 * Форматирует дату в локализованную строку
 * @param date Дата или строка даты
 * @param options Опции форматирования
 * @returns Форматированная строка даты
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('ru-RU', options);
};

/**
 * Форматирует дату и время в локализованную строку
 * @param date Дата или строка даты
 * @returns Форматированная строка даты и времени
 */
export const formatDateTime = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Форматирует число как денежное значение
 * @param value Число для форматирования
 * @param currency Валюта (по умолчанию RUB)
 * @returns Форматированная строка с валютой
 */
export const formatCurrency = (
  value: number,
  currency: string = 'RUB'
): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Сокращает текст до указанной длины
 * @param text Исходный текст
 * @param maxLength Максимальная длина
 * @returns Сокращенный текст с многоточием, если необходимо
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Форматирует размер файла в читаемый формат
 * @param bytes Размер файла в байтах
 * @param decimals Количество десятичных знаков
 * @returns Форматированная строка размера файла (например, "1.5 MB")
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Форматирует число с разделителями тысяч
 * @param value Число для форматирования
 * @returns Форматированное число с разделителями тысяч
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ru-RU').format(value);
};

/**
 * Форматирует процентное значение
 * @param value Число для форматирования (0-1)
 * @param decimals Количество десятичных знаков
 * @returns Форматированное процентное значение
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Форматирует продолжительность в минутах в часы и минуты
 * @param minutes Количество минут
 * @returns Форматированная строка продолжительности (например, "1 ч 30 мин")
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) return `${mins} мин`;
  if (mins === 0) return `${hours} ч`;
  
  return `${hours} ч ${mins} мин`;
}; 
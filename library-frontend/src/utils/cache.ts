// Время жизни кэша в миллисекундах (5 минут)
export const CACHE_TTL = 5 * 60 * 1000;

/**
 * Проверяет актуальность кэшированных данных
 * @param cache - кэшированные данные
 * @param timestamp - временная метка последнего обновления
 * @returns кэшированные данные если они актуальны, иначе null
 */
export function getCached<T>(cache: T | null, timestamp: number): T | null {
  return cache && Date.now() - timestamp < CACHE_TTL ? cache : null;
}

/**
 * Проверяет, является ли временная метка актуальной
 * @param timestamp - временная метка для проверки
 * @returns true если кэш актуален, иначе false
 */
export function isValidCache(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Обновляет кэш и временную метку
 * @param data - данные для кэширования
 * @returns объект с данными и текущей временной меткой
 */
export function updateCache<T>(data: T): { data: T; timestamp: number } {
  return {
    data,
    timestamp: Date.now()
  };
} 
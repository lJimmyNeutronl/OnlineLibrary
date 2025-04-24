import { useState, useEffect } from 'react';

/**
 * Хук для проверки соответствия медиа-запросу
 * @param query Медиа-запрос CSS
 * @returns Булево значение, указывающее, соответствует ли текущий экран медиа-запросу
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Проверяем поддержку window и matchMedia
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Устанавливаем начальное значение
    setMatches(mediaQuery.matches);
    
    // Функция для обновления состояния при изменении размера экрана
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Подписываемся на изменения медиа-запроса
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Для старых браузеров
      mediaQuery.addListener(handler);
    }
    
    // Отписываемся при размонтировании компонента
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Для старых браузеров
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);
  
  return matches;
}

/**
 * Объект с общими медиа-запросами для разных размеров экрана
 */
export const MediaQueries = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px) and (max-width: 767px)',
  md: '(min-width: 768px) and (max-width: 991px)',
  lg: '(min-width: 992px) and (max-width: 1199px)',
  xl: '(min-width: 1200px)',
  smDown: '(max-width: 767px)',
  mdDown: '(max-width: 991px)',
  lgDown: '(max-width: 1199px)',
  smUp: '(min-width: 576px)',
  mdUp: '(min-width: 768px)',
  lgUp: '(min-width: 992px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
};

/**
 * Хуки для общих медиа-запросов
 */
export const useIsMobile = () => useMediaQuery(MediaQueries.smDown);
export const useIsTablet = () => useMediaQuery(MediaQueries.md);
export const useIsDesktop = () => useMediaQuery(MediaQueries.lgUp);
export const useIsDarkMode = () => useMediaQuery(MediaQueries.darkMode);

export default useMediaQuery; 
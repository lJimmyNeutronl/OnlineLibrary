import { useEffect, RefObject } from 'react';

/**
 * Хук для отслеживания кликов вне элемента
 * @param ref Ссылка на элемент React
 * @param callback Функция, которая будет вызвана при клике вне элемента
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, callback]);
} 
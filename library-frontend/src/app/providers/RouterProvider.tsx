import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Интерфейс для провайдера маршрутизации
 */
interface RouterProviderProps {
  /**
   * Дочерние компоненты
   */
  children: ReactNode;
}

/**
 * Провайдер для настройки React Router
 */
export const RouterProvider = ({ children }: RouterProviderProps) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export default RouterProvider; 
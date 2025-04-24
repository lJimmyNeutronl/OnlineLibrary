import { ReactNode } from 'react';
import StoreProvider from './StoreProvider';
import RouterProvider from './RouterProvider';
import { AuthProvider } from '../../features/auth';

/**
 * Интерфейс для корневого провайдера
 */
interface AppProvidersProps {
  /**
   * Дочерние компоненты
   */
  children: ReactNode;
}

/**
 * Компонент, объединяющий все провайдеры приложения
 * Упрощает подключение провайдеров в корневом компоненте
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <StoreProvider>
      <AuthProvider>
        <RouterProvider>{children}</RouterProvider>
      </AuthProvider>
    </StoreProvider>
  );
};

export default AppProviders; 
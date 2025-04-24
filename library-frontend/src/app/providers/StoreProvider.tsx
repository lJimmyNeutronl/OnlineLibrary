import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';

/**
 * Интерфейс для провайдера Redux store
 */
interface StoreProviderProps {
  /**
   * Дочерние компоненты
   */
  children: ReactNode;
}

/**
 * Провайдер для доступа к Redux store
 */
export const StoreProvider = ({ children }: StoreProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider; 
import React, { createContext, ReactNode, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthContextType } from '../types';

// Создаем контекст аутентификации
const AuthContext = createContext<AuthContextType | null>(null);

// Хук для использования контекста аутентификации
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext должен использоваться внутри AuthProvider');
  }
  return context;
};

// Пропсы для провайдера аутентификации
interface AuthProviderProps {
  children: ReactNode;
}

// Провайдер контекста аутентификации
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Используем хук аутентификации
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}; 
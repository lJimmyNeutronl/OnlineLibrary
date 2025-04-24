import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * Компонент для защиты маршрутов, требующих авторизации
 * Перенаправляет на страницу входа, если пользователь не авторизован
 * Если указаны allowedRoles, то проверяет наличие соответствующей роли у пользователя
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuthContext();
  const location = useLocation();

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если указаны роли и у пользователя нет ни одной из разрешенных ролей
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasAllowedRole) {
      // Перенаправление на страницу "доступ запрещен" или главную
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Если пользователь авторизован и имеет нужные роли, разрешаем доступ
  return <Outlet />;
}; 
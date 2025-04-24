import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../features/auth';

/**
 * Интерфейс для параметров защищенного маршрута
 */
interface ProtectedRouteProps {
  /**
   * Требуемая роль для доступа к маршруту
   */
  requiredRole?: string;
}

/**
 * Компонент для защиты маршрутов, требующих аутентификации
 * 
 * Если пользователь не аутентифицирован, перенаправляет на страницу входа.
 * Если указана requiredRole и у пользователя нет этой роли, перенаправляет на страницу 403.
 * В противном случае рендерит вложенные маршруты через Outlet.
 */
export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuthContext();
  const location = useLocation();

  // Если пользователь не аутентифицирован
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если указана роль и у пользователя нет этой роли
  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 
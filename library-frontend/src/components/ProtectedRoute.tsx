import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { loadCurrentUser } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user, isLoading, error } = useAppSelector(state => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Проверяем наличие токена напрямую из localStorage
  const localToken = localStorage.getItem('token');
  
  useEffect(() => {
    const checkAuth = async () => {
      // Если нет токена вообще - сразу считаем проверку выполненной
      if (!localToken) {
        console.log('Защищенный маршрут: нет токена, требуется вход');
        setAuthChecked(true);
        return;
      }
      
      // Если есть токен, но нет данных пользователя и не идет загрузка
      if (localToken && !user && !isLoading && !authChecked) {
        console.log('Защищенный маршрут: токен есть, загружаем данные пользователя');
        try {
          await dispatch(loadCurrentUser()).unwrap();
          console.log('Защищенный маршрут: данные пользователя успешно загружены');
        } catch (error) {
          console.error('Защищенный маршрут: ошибка загрузки данных пользователя', error);
        } finally {
          setAuthChecked(true);
        }
      } else if (user) {
        // Если пользователь уже загружен
        setAuthChecked(true);
      }
    };
    
    if (!authChecked) {
      checkAuth();
    }
  }, [localToken, user, isLoading, authChecked, dispatch]);
  
  // Показываем индикатор загрузки, пока проверяем аутентификацию
  if (isLoading || !authChecked) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <div className="spinner" style={{
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #4c6ef5',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          animation: 'spin 1s linear infinite',
          marginRight: '12px'
        }}></div>
        Загрузка...
      </div>
    );
  }
  
  // Если проверка завершена и нет токена или пользователя - перенаправляем на вход
  if (authChecked && (!localToken || !user)) {
    console.log('Защищенный маршрут: перенаправление на страницу входа');
    return <Navigate to="/login" replace />;
  }
  
  // Если аутентификация прошла успешно - показываем защищенный контент
  console.log('Защищенный маршрут: доступ разрешен');
  return <>{children}</>;
};

export default ProtectedRoute; 
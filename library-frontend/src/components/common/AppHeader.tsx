import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../store/slices/authSlice';
import { 
  FiHome, 
  FiBookOpen, 
  FiGrid, 
  FiUser, 
  FiLogIn, 
  FiLogOut,
  FiHeart,
  FiSettings
} from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import logoImg from '../../assets/images/image.png';

const AppHeader = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;

  // Проверка, является ли пользователь администратором
  const isAdmin = user?.roles?.some((role: string) => 
    role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN'
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Общие стили для кнопок навигации
  const navLinkStyle = {
    color: 'white',
    margin: '0 5px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  };

  // Общие стили для иконок навигации
  const iconStyle = {
    marginRight: '8px',
    fontSize: '20px'
  };

  return (
    <header className="app-header" style={{ 
      position: 'fixed', 
      zIndex: 999, 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(90deg, #3b5bdb 0%, #4c6ef5 100%)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '0 24px',
      height: '64px',
      color: 'white',
      top: 0,
      left: 0,
      right: 0,
      margin: 0
    }}>
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img 
            src={logoImg} 
            alt="LitCloud Logo" 
            style={{ 
              height: '48px', 
              marginRight: '12px',
              filter: 'brightness(0) invert(1)'
            }} 
          />
          <span style={{ fontWeight: 'bold', fontSize: '22px', letterSpacing: '0.5px' }}>LitCloud</span>
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <nav className="main-nav" style={{ display: 'flex', marginRight: '24px' }}>
          <Link 
            to="/" 
            className="nav-link"
            style={navLinkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FiHome style={iconStyle} /> Главная
          </Link>
          <Link 
            to="/books" 
            className="nav-link"
            style={navLinkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FiBookOpen style={iconStyle} /> Книги
          </Link>
          <Link 
            to="/categories" 
            className="nav-link"
            style={navLinkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FiGrid style={iconStyle} /> Категории
          </Link>
        </nav>
        
        <div className="auth-buttons" style={{ display: 'flex', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              <button 
                className="btn-header"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate('/favorites')}
              >
                <AiFillHeart style={{ ...iconStyle, marginRight: 0, color: '#ff4d4f', fontSize: '22px' }} />
              </button>
              
              {/* Кнопка админ-панели (показывать только для администраторов) */}
              {isAdmin && (
                <button 
                  className="btn-header"
                  style={{ 
                    background: 'transparent', 
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => window.open('/admin', '_blank')}
                  title="Админ-панель"
                >
                  <FiSettings style={iconStyle} /> Админ
                </button>
              )}
              
              <button 
                className="btn-header"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate('/profile')}
              >
                <FiUser style={iconStyle} /> Профиль
              </button>
              <button 
                className="btn-header"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={handleLogout}
              >
                <FiLogOut style={iconStyle} /> Выйти
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-header"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate('/login')}
              >
                <FiLogIn style={iconStyle} /> Войти
              </button>
              <button 
                className="btn-register"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onClick={() => navigate('/register')}
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader; 
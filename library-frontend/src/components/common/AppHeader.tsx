import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../store/slices/authSlice';
import { AiOutlineHome, AiOutlineBook, AiOutlineUser, AiOutlineLogin, AiOutlineLogout } from 'react-icons/ai';
import logoImg from '../../assets/images/image.png';

const AppHeader = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  const [selectedKey, setSelectedKey] = useState('home');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="app-header" style={{ 
      position: 'fixed', 
      zIndex: 999, 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--primary-color, #3769f5)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      padding: '0 20px',
      height: '64px',
      color: 'white',
      top: 0,
      left: 0,
      right: 0,
      margin: 0
    }}>
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
          <img 
            src={logoImg} 
            alt="LitCloud Logo" 
            style={{ 
              height: '48px', 
              marginRight: '10px',
              filter: 'brightness(0) invert(1)'
            }} 
          />
          <span style={{ fontWeight: 'bold', fontSize: '20px' }}>LitCloud</span>
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <nav className="main-nav" style={{ display: 'flex', marginRight: '20px' }}>
          <Link 
            to="/" 
            className={`nav-link ${selectedKey === 'home' ? 'active' : ''}`}
            onClick={() => setSelectedKey('home')}
            style={{ 
              color: 'white', 
              margin: '0 10px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              backgroundColor: selectedKey === 'home' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
          >
            <AiOutlineHome style={{ marginRight: '5px' }} /> Главная
          </Link>
          <Link 
            to="/books" 
            className={`nav-link ${selectedKey === 'books' ? 'active' : ''}`}
            onClick={() => setSelectedKey('books')}
            style={{ 
              color: 'white', 
              margin: '0 10px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              backgroundColor: selectedKey === 'books' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
          >
            <AiOutlineBook style={{ marginRight: '5px' }} /> Книги
          </Link>
          <Link 
            to="/categories" 
            className={`nav-link ${selectedKey === 'categories' ? 'active' : ''}`}
            onClick={() => setSelectedKey('categories')}
            style={{ 
              color: 'white', 
              margin: '0 10px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              backgroundColor: selectedKey === 'categories' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
          >
            <AiOutlineBook style={{ marginRight: '5px' }} /> Категории
          </Link>
        </nav>
        
        <div className="auth-buttons" style={{ display: 'flex', gap: '10px' }}>
          {isAuthenticated ? (
            <>
              <button 
                className="btn btn-text"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
                onClick={() => navigate('/profile')}
              >
                <AiOutlineUser style={{ marginRight: '5px' }} /> Профиль
              </button>
              <button 
                className="btn btn-text"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
                onClick={handleLogout}
              >
                <AiOutlineLogout style={{ marginRight: '5px' }} /> Выйти
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-text"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
                onClick={() => navigate('/login')}
              >
                <AiOutlineLogin style={{ marginRight: '5px' }} /> Войти
              </button>
              <button 
                className="btn btn-primary"
                style={{ 
                  background: '#fff', 
                  border: 'none',
                  color: '#3769f5',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '6px 12px'
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
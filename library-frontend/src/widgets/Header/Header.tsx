import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks/reduxHooks';
import { logout } from '../../features/auth/slice';
import { 
  FiHome, 
  FiBookOpen, 
  FiGrid, 
  FiUser, 
  FiLogIn, 
  FiLogOut 
} from 'react-icons/fi';
import logoImg from '../../assets/images/image.png';
import { 
  HeaderContainer, 
  LogoContainer, 
  LogoImage, 
  LogoText,
  NavigationContainer,
  NavLink,
  AuthButtonsContainer,
  HeaderButton,
  RegisterButton,
  IconWrapper
} from './Header.styles';

/**
 * Компонент Header - шапка приложения
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Функция для генерации инициалов пользователя
  const getUserInitials = (): string => {
    if (!user) return '?';
    
    let initials = '';
    if (user.firstName) {
      initials += user.firstName.charAt(0);
    }
    if (user.lastName) {
      initials += user.lastName.charAt(0);
    }
    
    return initials || user.email.charAt(0).toUpperCase();
  };

  const getUserFullName = (): string => {
    if (!user) return 'Пользователь';
    
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    
    return user.email;
  };

  return (
    <HeaderContainer>
      <LogoContainer>
        <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <LogoImage src={logoImg} alt="LitCloud Logo" />
          <LogoText>LitCloud</LogoText>
        </Link>
      </LogoContainer>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavigationContainer>
          <NavLink to="/">
            <IconWrapper><FiHome /></IconWrapper> Главная
          </NavLink>
          <NavLink to="/books">
            <IconWrapper><FiBookOpen /></IconWrapper> Книги
          </NavLink>
          <NavLink to="/categories">
            <IconWrapper><FiGrid /></IconWrapper> Категории
          </NavLink>
        </NavigationContainer>
        
        <AuthButtonsContainer>
          {isAuthenticated ? (
            <>
              <HeaderButton onClick={() => navigate('/profile')}>
                <IconWrapper><FiUser /></IconWrapper> Профиль
              </HeaderButton>
              <HeaderButton onClick={handleLogout}>
                <IconWrapper><FiLogOut /></IconWrapper> Выйти
              </HeaderButton>
            </>
          ) : (
            <>
              <HeaderButton onClick={() => navigate('/login')}>
                <IconWrapper><FiLogIn /></IconWrapper> Войти
              </HeaderButton>
              <RegisterButton onClick={() => navigate('/register')}>
                Регистрация
              </RegisterButton>
            </>
          )}
        </AuthButtonsContainer>
      </div>
    </HeaderContainer>
  );
};

export default Header; 
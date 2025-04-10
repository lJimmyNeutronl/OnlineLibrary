import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Input, Button, Space } from 'antd';
import { 
  HomeOutlined, 
  BookOutlined, 
  UserOutlined, 
  LoginOutlined, 
  LogoutOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../store/authSlice';

const { Header } = Layout;
const { Search } = Input;

const AppHeader = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const [selectedKey, setSelectedKey] = useState('home');

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Header style={{ 
      position: 'fixed', 
      zIndex: 1, 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div className="logo" style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
        <Link to="/" style={{ color: 'white' }}>Онлайн-библиотека</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
          style={{ flex: 1, minWidth: 200 }}
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link to="/">Главная</Link>
          </Menu.Item>
          <Menu.Item key="books" icon={<BookOutlined />}>
            <Link to="/books">Книги</Link>
          </Menu.Item>
          <Menu.Item key="categories" icon={<BookOutlined />}>
            <Link to="/categories">Категории</Link>
          </Menu.Item>
        </Menu>
        
        <Search
          placeholder="Поиск книг..."
          onSearch={handleSearch}
          style={{ width: 250, margin: '0 16px' }}
        />
        
        <Space>
          {isAuthenticated ? (
            <>
              <Button 
                type="text" 
                icon={<UserOutlined />} 
                style={{ color: 'white' }}
                onClick={() => navigate('/profile')}
              >
                Профиль
              </Button>
              <Button 
                type="text" 
                icon={<LogoutOutlined />} 
                style={{ color: 'white' }}
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button 
                type="text" 
                icon={<LoginOutlined />} 
                style={{ color: 'white' }}
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
              <Button 
                type="primary" 
                onClick={() => navigate('/register')}
              >
                Регистрация
              </Button>
            </>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader; 
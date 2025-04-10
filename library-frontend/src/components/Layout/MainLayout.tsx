import { Layout, Menu } from 'antd';
import { HomeOutlined, BookOutlined, AppstoreOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Главная</Link>,
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: <Link to="/books">Книги</Link>,
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/categories">Категории</Link>,
    },
    ...(user ? [
      {
        key: 'logout',
        icon: <LoginOutlined />,
        label: <a onClick={() => dispatch(logout())}>Выйти</a>,
      }
    ] : [
      {
        key: '/login',
        icon: <LoginOutlined />,
        label: <Link to="/login">Войти</Link>,
      },
      {
        key: '/register',
        icon: <UserAddOutlined />,
        label: <Link to="/register">Регистрация</Link>,
      }
    ])
  ];

  return (
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <Header 
        style={{ 
          position: 'fixed', 
          top: 0,
          left: 0,
          zIndex: 100, 
          width: '100%', 
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          background: '#4096ff'
        }}
      >
        <div style={{ 
          paddingLeft: '16px',
          paddingRight: '16px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div className="logo" style={{ 
            color: 'white', 
            fontSize: '20px', 
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            Онлайн-библиотека
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ 
              flex: 1, 
              display: 'flex',
              justifyContent: 'flex-end',
              background: 'transparent',
              border: 'none'
            }}
          />
        </div>
      </Header>
      <Content style={{ marginTop: 64, width: '100%', padding: 0 }}>
        <Outlet />
      </Content>
      <Footer style={{ 
        textAlign: 'center', 
        padding: '16px 0',
        background: '#f0f2f5'
      }}>
        Онлайн-библиотека ©{new Date().getFullYear()} Все права защищены
      </Footer>
    </Layout>
  );
};

export default MainLayout; 
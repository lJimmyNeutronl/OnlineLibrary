import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Typography, 
  Breadcrumb, 
  Statistic, 
  Card, 
  Row, 
  Col,
  message
} from 'antd';
import { 
  DashboardOutlined,
  BookOutlined,
  FileAddOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAppSelector } from '../../hooks/reduxHooks';

const { Title } = Typography;
const { Header, Sider, Content } = Layout;

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalCategories: number;
  recentlyAddedBooks: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    totalCategories: 0,
    recentlyAddedBooks: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedKey, setSelectedKey] = useState<string>('dashboard');

  useEffect(() => {
    // Проверка прав доступа
    if (!isAuthenticated || !isAdmin) {
      message.error('У вас нет прав доступа к панели администратора');
      navigate('/');
      return;
    }
    
    // Имитация загрузки статистики
    setLoading(true);
    setTimeout(() => {
      setStats({
        totalBooks: 547,
        totalUsers: 312,
        totalCategories: 15,
        recentlyAddedBooks: 24
      });
      setLoading(false);
    }, 1000);
  }, [isAuthenticated, isAdmin, navigate]);

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
    switch (key) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'books':
        navigate('/admin/books');
        break;
      case 'add-book':
        navigate('/admin/books/add');
        break;
      case 'categories':
        navigate('/admin/categories');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        navigate('/admin');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Перенаправление выполняется в useEffect
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            Панель администратора
          </Title>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Дашборд',
              onClick: () => handleMenuClick('dashboard')
            },
            {
              key: 'books',
              icon: <BookOutlined />,
              label: 'Управление книгами',
              onClick: () => handleMenuClick('books')
            },
            {
              key: 'add-book',
              icon: <FileAddOutlined />,
              label: 'Добавить книгу',
              onClick: () => handleMenuClick('add-book')
            },
            {
              key: 'categories',
              icon: <AppstoreOutlined />,
              label: 'Категории',
              onClick: () => handleMenuClick('categories')
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: 'Пользователи',
              onClick: () => handleMenuClick('users')
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Настройки',
              onClick: () => handleMenuClick('settings')
            }
          ]}
        />
      </Sider>
      
      <Layout style={{ marginLeft: 250 }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Главная</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/admin">Админ-панель</Link>
            </Breadcrumb.Item>
            {selectedKey !== 'dashboard' && (
              <Breadcrumb.Item>
                {selectedKey === 'books' && 'Управление книгами'}
                {selectedKey === 'add-book' && 'Добавление книги'}
                {selectedKey === 'categories' && 'Категории'}
                {selectedKey === 'users' && 'Пользователи'}
                {selectedKey === 'settings' && 'Настройки'}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
          
          <div>
            <span style={{ marginRight: '8px' }}>
              {user?.firstName} {user?.lastName}
            </span>
            <Link to="/profile">
              <UserOutlined /> Профиль
            </Link>
          </div>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {selectedKey === 'dashboard' ? (
            <>
              <Title level={2}>Обзор библиотеки</Title>
              
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Всего книг"
                      value={stats.totalBooks}
                      loading={loading}
                      prefix={<BookOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Всего пользователей"
                      value={stats.totalUsers}
                      loading={loading}
                      prefix={<UserOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Категорий"
                      value={stats.totalCategories}
                      loading={loading}
                      prefix={<AppstoreOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Добавлено за месяц"
                      value={stats.recentlyAddedBooks}
                      loading={loading}
                      prefix={<FileAddOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Быстрые действия">
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <Card.Grid style={{ width: '20%', textAlign: 'center' }} onClick={() => navigate('/admin/books/add')}>
                        <FileAddOutlined style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                        Добавить книгу
                      </Card.Grid>
                      <Card.Grid style={{ width: '20%', textAlign: 'center' }} onClick={() => navigate('/admin/categories/add')}>
                        <AppstoreOutlined style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                        Добавить категорию
                      </Card.Grid>
                      <Card.Grid style={{ width: '20%', textAlign: 'center' }} onClick={() => navigate('/admin/users')}>
                        <UserOutlined style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                        Управление пользователями
                      </Card.Grid>
                      <Card.Grid style={{ width: '20%', textAlign: 'center' }} onClick={() => navigate('/admin/books')}>
                        <BookOutlined style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                        Управление книгами
                      </Card.Grid>
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard; 
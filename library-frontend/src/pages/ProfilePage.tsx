import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBook, FiHeart, FiClock, FiSettings, FiLogOut, FiEdit } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { logout } from '../store/slices/authSlice';

// Импортируем наши пользовательские компоненты
import Typography from '../components/common/Typography';
import Row from '../components/common/Row';
import Col from '../components/common/Col';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Tabs, { TabPane } from '../components/common/Tabs';
import List from '../components/common/List';
import Tag from '../components/common/Tag';
import Divider from '../components/common/Divider';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import Empty from '../components/common/Empty';
import Spin from '../components/common/Spin';
import message from '../components/common/message';
import Statistic from '../components/common/Statistic';
import Progress from '../components/common/Progress';

const { Title, Paragraph, Text } = Typography;

// Интерфейс для категории
interface Category {
  id: number;
  name: string;
}

interface FavoriteBook {
  id: number;
  title: string;
  author: string;
  coverImageUrl: string;
  addedDate: string;
  categories: Category[];
}

interface ReadingHistoryItem {
  id: number;
  book: {
    id: number;
    title: string;
    author: string;
    coverImageUrl: string;
    pageCount: number;
  };
  lastReadPage: number;
  lastReadDate: string;
  isCompleted: boolean;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('info');

  useEffect(() => {
    // Проверка аутентификации
    if (!isAuthenticated) {
      message.error('Для доступа к личному кабинету необходимо авторизоваться');
      navigate('/login');
      return;
    }
    
    // Загрузка данных только при переключении на соответствующую вкладку
    if (activeTab === 'favorites') {
      loadFavorites();
    } else if (activeTab === 'history') {
      loadReadingHistory();
    }
  }, [isAuthenticated, navigate, activeTab]);

  const loadFavorites = () => {
    setLoadingFavorites(true);
    // Имитация загрузки избранных книг с сервера
    setTimeout(() => {
      const mockFavorites: FavoriteBook[] = [
        {
          id: 1,
          title: 'Властелин колец',
          author: 'Дж. Р. Р. Толкин',
          coverImageUrl: 'https://picsum.photos/200/300?random=1',
          addedDate: '2023-09-15',
          categories: [{ id: 1, name: 'Фантастика' }]
        },
        {
          id: 2,
          title: 'Гарри Поттер и философский камень',
          author: 'Дж. К. Роулинг',
          coverImageUrl: 'https://picsum.photos/200/300?random=2',
          addedDate: '2023-10-20',
          categories: [{ id: 1, name: 'Фантастика' }]
        },
        {
          id: 3,
          title: 'Преступление и наказание',
          author: 'Ф. М. Достоевский',
          coverImageUrl: 'https://picsum.photos/200/300?random=3',
          addedDate: '2023-11-05',
          categories: [{ id: 6, name: 'Классика' }]
        }
      ];
      
      setFavorites(mockFavorites);
      setLoadingFavorites(false);
    }, 1000);
  };

  const loadReadingHistory = () => {
    setLoadingHistory(true);
    // Имитация загрузки истории чтения с сервера
    setTimeout(() => {
      const mockHistory: ReadingHistoryItem[] = [
        {
          id: 1,
          book: {
            id: 1,
            title: 'Война и мир',
            author: 'Л. Н. Толстой',
            coverImageUrl: 'https://picsum.photos/200/300?random=4',
            pageCount: 1225
          },
          lastReadPage: 384,
          lastReadDate: '2023-11-10T14:30:00',
          isCompleted: false
        },
        {
          id: 2,
          book: {
            id: 2,
            title: 'Мастер и Маргарита',
            author: 'М. А. Булгаков',
            coverImageUrl: 'https://picsum.photos/200/300?random=5',
            pageCount: 480
          },
          lastReadPage: 480,
          lastReadDate: '2023-10-25T20:15:00',
          isCompleted: true
        },
        {
          id: 3,
          book: {
            id: 3,
            title: '1984',
            author: 'Джордж Оруэлл',
            coverImageUrl: 'https://picsum.photos/200/300?random=6',
            pageCount: 328
          },
          lastReadPage: 152,
          lastReadDate: '2023-11-15T09:45:00',
          isCompleted: false
        }
      ];
      
      setReadingHistory(mockHistory);
      setLoadingHistory(false);
    }, 1000);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    message.success('Вы успешно вышли из системы');
    navigate('/login');
  };

  const getReadingProgress = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !user) {
    return null; // Перенаправление выполняется в useEffect
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="profile-container"
      style={{ padding: '24px 0' }}
    >
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/">Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Личный кабинет</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar size={100} icon={<FiUser />} />
              <Title level={3} style={{ marginTop: '16px', marginBottom: '4px' }}>
                {user.firstName} {user.lastName}
              </Title>
              <Text type="secondary">{user.email}</Text>
            </div>
            
            <Divider />
            
            <div>
              <Paragraph>
                <Text strong>Дата регистрации:</Text> {formatDate(user.registrationDate)}
              </Paragraph>
              <Paragraph>
                <Text strong>Последний вход:</Text> {formatDateTime(user.lastLoginDate || user.registrationDate)}
              </Paragraph>
              <Paragraph>
                <Text strong>Роли:</Text> {user.roles?.map(role => (
                  <Tag key={role} color="blue" style={{ marginRight: '4px' }}>
                    {role === 'ROLE_ADMIN' ? 'Администратор' : role === 'ROLE_USER' ? 'Пользователь' : role}
                  </Tag>
                ))}
              </Paragraph>
            </div>
            
            <Divider />
            
            <div>
              <Button
                type="primary"
                icon={<FiEdit />}
                style={{ marginBottom: '12px', width: '100%' }}
                onClick={() => navigate('/profile/edit')}
              >
                Редактировать профиль
              </Button>
              
              <Button
                danger
                icon={<FiLogOut />}
                style={{ width: '100%' }}
                onClick={handleLogout}
              >
                Выйти из аккаунта
              </Button>
            </div>
          </Card>
          
          <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: '16px' }}>
              Статистика
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Книг в избранном" 
                  value={favorites.length} 
                  prefix={<FiHeart />} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Прочитано книг" 
                  value={readingHistory.filter(item => item.isCompleted).length} 
                  prefix={<FiBook />} 
                />
              </Col>
              <Col span={24}>
                <Statistic 
                  title="В процессе чтения" 
                  value={readingHistory.filter(item => !item.isCompleted).length} 
                  prefix={<FiClock />} 
                />
              </Col>
            </Row>
            
            {user.roles?.includes('ROLE_ADMIN') && (
              <>
                <Divider />
                <Button
                  type="primary"
                  icon={<FiSettings />}
                  style={{ width: '100%' }}
                  onClick={() => navigate('/admin')}
                >
                  Панель администратора
                </Button>
              </>
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane tab="Информация" key="info">
                <div style={{ minHeight: '300px' }}>
                  <Title level={4}>Добро пожаловать в личный кабинет!</Title>
                  <Paragraph>
                    Здесь вы можете управлять своей учетной записью, просматривать избранные книги и отслеживать историю чтения.
                  </Paragraph>
                  
                  <Divider />
                  
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card 
                        hoverable 
                        style={{ borderRadius: '8px' }}
                        onClick={() => setActiveTab('favorites')}
                      >
                        <Card.Meta
                          avatar={<Avatar icon={<FiHeart />} style={{ backgroundColor: '#ff4d4f' }} />}
                          title="Избранные книги"
                          description="Просмотр книг, добавленных в избранное"
                        />
                      </Card>
                    </Col>
                    
                    <Col span={24}>
                      <Card 
                        hoverable 
                        style={{ borderRadius: '8px' }}
                        onClick={() => setActiveTab('history')}
                      >
                        <Card.Meta
                          avatar={<Avatar icon={<FiClock />} style={{ backgroundColor: '#1890ff' }} />}
                          title="История чтения"
                          description="Просмотр ваших прочитанных и текущих книг"
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>
              
              <TabPane tab={<span><FiHeart /> Избранное</span>} key="favorites">
                <div style={{ minHeight: '300px' }}>
                  {loadingFavorites ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin size="large" />
                    </div>
                  ) : favorites.length === 0 ? (
                    <Empty 
                      description="У вас пока нет избранных книг" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button type="primary" onClick={() => navigate('/books')}>
                        Перейти к каталогу книг
                      </Button>
                    </Empty>
                  ) : (
                    <List
                      itemLayout="horizontal"
                      dataSource={favorites}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button key="read" type="link" onClick={() => navigate(`/books/${item.id}/read`)}>
                              Читать
                            </Button>,
                            <Button key="view" type="link" onClick={() => navigate(`/books/${item.id}`)}>
                              Подробнее
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                src={item.coverImageUrl} 
                                size={64} 
                                shape="square" 
                                style={{ borderRadius: '4px' }}
                              />
                            }
                            title={<Link to={`/books/${item.id}`}>{item.title}</Link>}
                            description={
                              <div>
                                <div>{item.author}</div>
                                <div>
                                  <Text type="secondary">Добавлено: {formatDate(item.addedDate)}</Text>
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                  {item.categories.map((category: Category) => (
                                    <Tag color="blue" key={category.id} style={{ marginRight: '4px' }}>
                                      {category.name}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              </TabPane>
              
              <TabPane tab={<span><FiClock /> История чтения</span>} key="history">
                <div style={{ minHeight: '300px' }}>
                  {loadingHistory ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin size="large" />
                    </div>
                  ) : readingHistory.length === 0 ? (
                    <Empty 
                      description="У вас пока нет истории чтения" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button type="primary" onClick={() => navigate('/books')}>
                        Начать читать
                      </Button>
                    </Empty>
                  ) : (
                    <List
                      itemLayout="horizontal"
                      dataSource={readingHistory}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button 
                              key="continue" 
                              type="primary"
                              onClick={() => navigate(`/books/${item.book.id}/read`)}
                            >
                              {item.isCompleted ? 'Перечитать' : 'Продолжить'}
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                src={item.book.coverImageUrl} 
                                size={64} 
                                shape="square" 
                                style={{ borderRadius: '4px' }}
                              />
                            }
                            title={<Link to={`/books/${item.book.id}`}>{item.book.title}</Link>}
                            description={
                              <div>
                                <div>{item.book.author}</div>
                                <div>
                                  <Text type="secondary">
                                    Последнее чтение: {formatDateTime(item.lastReadDate)}
                                  </Text>
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                  <Progress 
                                    percent={getReadingProgress(item.lastReadPage, item.book.pageCount)} 
                                    size="small"
                                    status={item.isCompleted ? 'success' : 'active'}
                                  />
                                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    Прогресс: {item.lastReadPage} из {item.book.pageCount} страниц
                                    {item.isCompleted && <Tag color="success" style={{ marginLeft: '8px' }}>Прочитано</Tag>}
                                  </div>
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default ProfilePage; 
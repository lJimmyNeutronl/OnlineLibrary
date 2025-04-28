import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBook, FiHeart, FiClock, FiSettings, FiLogOut, FiEdit, FiActivity, FiCalendar } from 'react-icons/fi';
import { FaBook, FaBookOpen, FaBookReader, FaPencilAlt, FaGraduationCap, FaFeatherAlt, FaUserEdit, FaKey, FaSignOutAlt } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { logout } from '../store/slices/authSlice';
import userService, { FavoriteBook as FavoriteBookType, ReadingHistoryItem as ReadingHistoryItemType, UserActivity as UserActivityType } from '../services/userService';

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

// Импортируем стили
import '../App.css';

const { Title, Paragraph, Text } = Typography;

// Интерфейс для категории
interface Category {
  id: number;
  name: string;
}

// Используем типы из userService
type FavoriteBook = FavoriteBookType;
type ReadingHistoryItem = ReadingHistoryItemType;
type UserActivity = UserActivityType;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

// Вспомогательная функция для создания фиктивных данных активности
const getLastNDays = (n: number) => {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    result.push(date.toISOString().split('T')[0]);
  }
  
  return result;
};

// Стили для анимаций фоновых элементов - как на главной странице
const floatAnimation = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [0, -15, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

const rotateAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 60,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1, opacity: 0.05 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.05, 0.08, 0.05],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

// Анимация для значков на фоне
const iconVariants = {
  animate: {
    y: [0, -10, 0],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    }
  }
};

// Определение типа для иконки фона
interface BackgroundIcon {
  icon: React.ReactNode;
  top: string;
  left: string;
  delay: number;
}

// Массив иконок для фона
const backgroundIcons: BackgroundIcon[] = [
  { icon: <FiBook size={24} />, top: '15%', left: '10%', delay: 0 },
  { icon: <FiHeart size={24} />, top: '25%', left: '85%', delay: 0.5 },
  { icon: <FiUser size={24} />, top: '75%', left: '15%', delay: 1 },
  { icon: <FiClock size={24} />, top: '65%', left: '80%', delay: 1.5 },
  { icon: <FiBook size={24} />, top: '45%', left: '5%', delay: 2 },
  { icon: <FiHeart size={24} />, top: '35%', left: '92%', delay: 2.5 },
  { icon: <FiClock size={24} />, top: '85%', left: '50%', delay: 3 },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  // Получаем примерную дату регистрации и последнего входа (заглушки)
  const registrationDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 2); // Примерно 2 месяца назад
    return date.toISOString();
  }, []);
  
  const lastLoginDate = useMemo(() => {
    const date = new Date();
    date.setHours(date.getHours() - 12); // 12 часов назад
    return date.toISOString();
  }, []);
  
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('info');

  useEffect(() => {
    // Проверка аутентификации
    if (!isAuthenticated) {
      message.error('Для доступа к личному кабинету необходимо авторизоваться');
      navigate('/login');
      return;
    }
    
    // Загружаем данные при монтировании компонента
      loadFavorites();
      loadReadingHistory();
  }, [isAuthenticated, navigate]);

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const data = await userService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Ошибка загрузки избранных книг:', error);
      message.error('Не удалось загрузить избранные книги');
      
      // Фиктивные данные для демонстрации
      setFavorites([
        {
          id: 1,
          title: 'Великий Гэтсби',
          author: 'Ф. Скотт Фитцджеральд',
          coverImageUrl: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
          description: 'История о баснословно богатом Джее Гэтсби и его любви к прекрасной Дэйзи Бьюкенен.',
          isbn: '9780743273565',
          publicationYear: 1925,
          publisher: 'Scribner',
          language: 'Английский',
          pageCount: 180,
          categories: [{ id: 1, name: 'Классика' }],
        },
        {
          id: 2,
          title: 'Убить пересмешника',
          author: 'Харпер Ли',
          coverImageUrl: 'https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UF1000,1000_QL80_.jpg',
          description: 'Незабываемый роман о детстве в сонном южном городке и кризисе совести, который его потряс.',
          isbn: '9780060935467',
          publicationYear: 1960,
          publisher: 'Harper Perennial',
          language: 'Английский',
          pageCount: 336,
          categories: [{ id: 2, name: 'Художественная литература' }],
        },
        {
          id: 3,
          title: '1984',
          author: 'Джордж Оруэлл',
          coverImageUrl: 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg',
          description: 'Леденящий антиутопический роман о борьбе человека за сохранение своей человечности в тоталитарном обществе.',
          isbn: '9780451524935',
          publicationYear: 1949,
          publisher: 'Signet Classic',
          language: 'Английский',
          pageCount: 328,
          categories: [{ id: 3, name: 'Антиутопия' }],
        },
        {
          id: 4,
          title: 'Гордость и предубеждение',
          author: 'Джейн Остин',
          coverImageUrl: 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',
          description: 'Вечный роман о любви, исследующий темы класса, брака и недоразумений.',
          isbn: '9780141439518',
          publicationYear: 1813,
          publisher: 'Penguin Classics',
          language: 'Английский',
          pageCount: 480,
          categories: [{ id: 4, name: 'Роман' }],
        }
      ] as any);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadReadingHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await userService.getReadingHistory();
      // Проверяем формат данных и устанавливаем соответствующим образом
      if (Array.isArray(data)) {
        setReadingHistory(data); // Если сервер вернул массив
      } else if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
        // @ts-ignore - игнорируем ошибку типа, так как мы проверяем существование поля content
        setReadingHistory(data.content); // Если сервер вернул объект с полем content
      } else {
        console.error('Неверный формат данных истории чтения:', data);
        setReadingHistory([]); // Устанавливаем пустой массив в случае ошибки
      }
    } catch (error) {
      console.error('Ошибка загрузки истории чтения:', error);
      message.error('Не удалось загрузить историю чтения');
      
      // Фиктивные данные для демонстрации
      setReadingHistory([
        {
          id: 1,
          book: {
            id: 1,
            title: 'Великий Гэтсби',
            author: 'Ф. Скотт Фитцджеральд',
            coverImageUrl: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
          },
          lastReadDate: new Date().toISOString(),
          lastReadPage: 120,
          isCompleted: false
        },
        {
          id: 2,
          book: {
            id: 2,
            title: 'Убить пересмешника',
            author: 'Харпер Ли',
            coverImageUrl: 'https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UF1000,1000_QL80_.jpg',
          },
          lastReadDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 дня назад
          lastReadPage: 336,
          isCompleted: true
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const data = await userService.getUserActivity(7); // Загружаем активность за последние 7 дней
      setActivities(data);
    } catch (error) {
      console.error('Ошибка загрузки истории активности:', error);
      
      // В случае ошибки используем фиктивные данные для демонстрации
      const days = getLastNDays(7);
      const mockActivities: UserActivity[] = days.map(date => {
        const actionCount = Math.floor(Math.random() * 6);
        const actions = [];
        
        for (let i = 0; i < actionCount; i++) {
          const actionTypes = ['read', 'favorite', 'login', 'other'];
          const type = actionTypes[Math.floor(Math.random() * actionTypes.length)] as 'read' | 'favorite' | 'login' | 'other';
          
          const hours = Math.floor(Math.random() * 24);
          const minutes = Math.floor(Math.random() * 60);
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          const timestamp = `${date}T${timeStr}:00`;
          
          let description = '';
          let bookTitle;
          let bookId;
          
          if (type === 'read') {
            const books = [
              { id: 1, title: 'Война и мир' },
              { id: 2, title: 'Мастер и Маргарита' },
              { id: 3, title: '1984' },
              { id: 4, title: 'Преступление и наказание' }
            ];
            const book = books[Math.floor(Math.random() * books.length)];
            bookTitle = book.title;
            bookId = book.id;
            description = `Чтение книги "${bookTitle}"`;
          } else if (type === 'favorite') {
            const books = [
              { id: 5, title: 'Гарри Поттер' },
              { id: 6, title: 'Властелин колец' },
              { id: 7, title: 'Гордость и предубеждение' }
            ];
            const book = books[Math.floor(Math.random() * books.length)];
            bookTitle = book.title;
            bookId = book.id;
            description = `Добавление книги "${bookTitle}" в избранное`;
          } else if (type === 'login') {
            description = 'Вход в систему';
          } else {
            description = 'Другое действие в системе';
          }
          
          actions.push({
            id: i + 1,
            type,
            bookId,
            bookTitle,
            timestamp,
            description
          });
        }
        
        return {
          date,
          count: actionCount,
          actions: actions.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        };
      });
      
      setActivities(mockActivities);
    } finally {
      setLoadingActivities(false);
    }
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

  // Получение русского названия дня недели
  const getDayOfWeekName = (dateString: string) => {
    const date = new Date(dateString);
    const options = { weekday: 'long' as const };
    return date.toLocaleDateString('ru-RU', options).charAt(0).toUpperCase() + 
           date.toLocaleDateString('ru-RU', options).slice(1);
  };

  // Получение форматированной даты для отображения (день месяца + месяц)
  const getShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Рендеринг активности
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'read':
        return <FiBook style={{ color: '#1890ff' }} />;
      case 'favorite':
        return <FiHeart style={{ color: '#ff4d4f' }} />;
      case 'login':
        return <FiUser style={{ color: '#52c41a' }} />;
      default:
        return <FiActivity style={{ color: '#faad14' }} />;
    }
  };

  // Получение времени из timestamp
  const getTimeFromTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !user) {
    return null; // Перенаправление выполняется в useEffect
  }

  // Расчет статистических данных
  const readBooksCount = readingHistory.filter(item => item.isCompleted).length;
  const inProgressCount = readingHistory.filter(item => !item.isCompleted).length;
  const favoritesCount = favorites.length;

  return (
    <div className="profile-page-wrapper" style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Декоративные элементы, как на главной странице */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          top: '-150px',
          right: '-100px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.08,
          transform: 'rotate(15deg)',
        }}
      >
        <FaBookOpen size={300} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          bottom: '-100px',
          left: '-100px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.06,
        }}
      >
        <FaGraduationCap size={250} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pulseAnimation}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          top: '30%',
          right: '10%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FaPencilAlt size={150} color="#3769f5" />
      </motion.div>
      
      {/* Новый декоративный элемент в левом углу */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          top: '15%',
          left: '5%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.07,
          transform: 'rotate(-10deg)',
        }}
      >
        <FaFeatherAlt size={120} color="#8e54e9" />
      </motion.div>
      
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="profile-container"
      >
      <Row gutter={[32, 32]}>
          {/* Левая колонка - профиль пользователя */}
        <Col xs={24} md={8}>
            <div className="profile-user-section">
              <Avatar size={150} icon={<FiUser />} style={{ backgroundColor: '#6c5ce7', color: '#fff' }} />
              <Title level={2} className="profile-username">
                {user.firstName} {user.lastName}
              </Title>
              <Text type="secondary" className="profile-email">{user.email}</Text>
              
              <div className="profile-buttons-grid">
                <motion.div
                  className="profile-action-card"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px rgba(108, 92, 231, 0.2)' }}
                  transition={{ duration: 0.3 }}
                onClick={() => navigate('/profile/edit')}
              >
                  <div className="profile-action-icon">
                    <FaUserEdit size={22} />
                  </div>
                  <div className="profile-action-text">Редактировать профиль</div>
                </motion.div>
                
                <motion.div
                  className="profile-action-card"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px rgba(255, 118, 117, 0.2)' }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate('/profile/change-password')}
                >
                  <div className="profile-action-icon" style={{ backgroundColor: 'rgba(255, 118, 117, 0.15)', color: '#ff7675' }}>
                    <FaKey size={22} />
                  </div>
                  <div className="profile-action-text">Сменить пароль</div>
                </motion.div>
                
                <motion.div
                  className="profile-action-card"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px rgba(99, 110, 114, 0.15)' }}
                  transition={{ duration: 0.3 }}
                onClick={handleLogout}
              >
                  <div className="profile-action-icon" style={{ backgroundColor: 'rgba(99, 110, 114, 0.1)', color: '#636e72' }}>
                    <FaSignOutAlt size={22} />
                  </div>
                  <div className="profile-action-text">Выйти</div>
                </motion.div>
              </div>
            </div>
          </Col>
          
          {/* Правая колонка - статистика и избранные книги */}
          <Col xs={24} md={16}>
            {/* Статистика */}
            <Row className="stats-card">
              <Col span={8} className="stats-item">
                <motion.div 
                  whileHover={{ translateY: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stats-icon">
                    <FaBookReader size={24} />
                  </div>
                  <h2 className="stats-number">{readBooksCount}</h2>
                  <div className="stats-label">ПРОЧИТАНО</div>
                </motion.div>
              </Col>
              <Col span={8} className="stats-item">
                <motion.div 
                  whileHover={{ translateY: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stats-icon" style={{ backgroundColor: 'rgba(255, 118, 117, 0.12)', color: '#ff7675' }}>
                    <FaBookOpen size={24} />
                  </div>
                  <h2 className="stats-number">{inProgressCount}</h2>
                  <div className="stats-label">В ПРОЦЕССЕ</div>
                </motion.div>
              </Col>
              <Col span={8} className="stats-item">
                <motion.div 
                  whileHover={{ translateY: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stats-icon" style={{ backgroundColor: 'rgba(142, 84, 233, 0.12)', color: '#8e54e9' }}>
                    <FiHeart size={24} />
                  </div>
                  <h2 className="stats-number">{favoritesCount}</h2>
                  <div className="stats-label">ИЗБРАННОЕ</div>
                </motion.div>
              </Col>
            </Row>
            
            {/* Избранные книги */}
            <div className="favorites-section">
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                margin: '20px 0',
                textAlign: 'center'
              }}>
                <div style={{ 
                  flex: 1, 
                  height: '1px',
                  background: 'linear-gradient(to right, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3))'
                }}></div>
                <Title level={3} style={{ 
                  margin: '0 20px', 
                  background: 'linear-gradient(135deg, #6c5ce7 0%, #8e54e9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}>
                  Избранные книги
                </Title>
                <div style={{ 
                  flex: 1, 
                  height: '1px',
                  background: 'linear-gradient(to left, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3))'
                }}></div>
                </div>
              
                  {loadingFavorites ? (
                <div className="loading-container">
                      <Spin size="large" />
                    </div>
                  ) : favorites.length === 0 ? (
                <div className="empty-favorites">
                    <Empty 
                      description="У вас пока нет избранных книг" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/books')}
                    className="profile-btn profile-btn-primary"
                    style={{ marginTop: '24px' }}
                    icon={<FiBook style={{ marginRight: '8px' }} />}
                  >
                        Перейти к каталогу книг
                      </Button>
                </div>
              ) : (
                <>
                  <Row gutter={[16, 24]}>
                    {favorites.map(book => (
                      <Col key={book.id} xs={12} sm={8} md={6}>
                        <motion.div 
                          className="book-item"
                          onClick={() => navigate(`/books/${book.id}`)}
                          whileHover={{ 
                            y: -10,
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="book-cover-container">
                            <img 
                              src={book.coverImageUrl || ''} 
                              alt={book.title} 
                              className="book-cover-image"
                            />
                            <div className="book-cover-overlay">
                              <FiHeart size={24} />
                                </div>
                              </div>
                          <div className="book-title">
                            {book.title.length > 20 ? book.title.substring(0, 18) + '...' : book.title}
                          </div>
                          <div className="book-author">
                            {book.author}
                </div>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                  
                  {favorites.length > 0 && (
                    <div className="catalog-button-container">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                            <Button 
                              type="primary"
                          onClick={() => navigate('/books')}
                          className="profile-btn-primary"
                          style={{ 
                            borderRadius: '50px',
                            padding: '0 25px',
                            height: '44px',
                            background: 'linear-gradient(135deg, #6c5ce7 0%, #8e54e9 100%)',
                            boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
                            border: 'none'
                          }}
                          icon={<FiBook style={{ marginRight: '8px' }} />}
                        >
                          Перейти к каталогу книг
                        </Button>
                      </motion.div>
                              </div>
                      )}
                </>
                  )}
                </div>
        </Col>
      </Row>
    </motion.div>
    </div>
  );
};

export default ProfilePage; 
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBook, FiHeart } from 'react-icons/fi';
import { FaBookOpen, FaBookReader, FaUserEdit, FaKey, FaSignOutAlt } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '@hooks/reduxHooks';
import { logout } from '@store/slices/authSlice';
import userService, { 
  FavoriteBook, 
  ReadingHistoryItem
} from '@services/userService';
import BookCarousel from '@components/book-card/BookCarousel';

// Импортируем наши пользовательские компоненты
import { 
  Typography,
  Row,
  Col,
  Avatar,
  Button,
  Empty,
  Spin,
  message
} from '@components/common';
import AnimatedBackground from '@components/common/AnimatedBackground';
import { fadeIn } from '@styles/animations';

const { Title, Text } = Typography;

// Компонент для отображения секции профиля
interface ProfileSectionProps {
  title: string;
  loading: boolean;
  emptyText: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  title, 
  loading,  
  children 
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-section">
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
        <Title level={3} className="gradient-text-purple" style={{ 
          margin: '0 20px',
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}>
          {title}
        </Title>
        <div style={{ 
          flex: 1, 
          height: '1px',
          background: 'linear-gradient(to left, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3))'
        }}></div>
      </div>
      
      {children}
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const [profileData, setProfileData] = useState({
    favorites: [] as FavoriteBook[],
    readingHistory: [] as ReadingHistoryItem[]
  });
  
  const [loading, setLoading] = useState({
    favorites: true,
    readingHistory: true
  });

  // Форматирование даты
  const formatDate = (iso: string) => 
    new Date(iso).toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

  // Загрузка всех данных профиля
  useEffect(() => {
    if (!isAuthenticated) {
      message.error('Для доступа к личному кабинету необходимо авторизоваться');
      navigate('/login');
      return;
    }

    const loadAllData = async () => {
      try {
        const [favorites, history] = await Promise.all([
          userService.getFavorites(),
          userService.getReadingHistory()
        ]);

        setProfileData({
          favorites: Array.isArray(favorites) ? favorites : [],
          readingHistory: Array.isArray(history) ? history : []
        });
      } catch (error) {
        console.error('Ошибка загрузки данных профиля:', error);
        message.error('Не удалось загрузить данные профиля');
      } finally {
        setLoading({
          favorites: false,
          readingHistory: false
        });
      }
    };

    loadAllData();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Расчет статистических данных
  const stats = useMemo(() => ({
    readBooksCount: profileData.readingHistory.filter(item => item.isCompleted).length,
    inProgressCount: profileData.readingHistory.filter(item => !item.isCompleted).length,
    favoritesCount: profileData.favorites.length
  }), [profileData]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AnimatedBackground>
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
                  <h2 className="stats-number">{stats.readBooksCount}</h2>
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
                  <h2 className="stats-number">{stats.inProgressCount}</h2>
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
                  <h2 className="stats-number">{stats.favoritesCount}</h2>
                  <div className="stats-label">ИЗБРАННОЕ</div>
                </motion.div>
              </Col>
            </Row>
            
            {/* Избранные книги */}
            <ProfileSection
              title="Избранные книги"
              loading={loading.favorites}
              emptyText="У вас пока нет избранных книг"
            >
              {profileData.favorites.length === 0 ? (
                <div className="favorites-empty-container">
                  <Empty 
                    description="У вас пока нет избранных книг" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/books')}
                    className="favorites-empty-button"
                    icon={<FiBook />}
                  >
                    Перейти к каталогу книг
                  </Button>
                </div>
              ) : (
                <>
                  <BookCarousel 
                    books={profileData.favorites}
                    className="profile-favorites-carousel"
                  />
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Button 
                      type="primary" 
                      onClick={() => navigate('/favorites')}
                      className="view-all-favorites-button"
                    >
                      Посмотреть все избранные книги
                    </Button>
                  </div>
                </>
              )}
            </ProfileSection>

            {/* История чтения */}
            <ProfileSection
              title="История чтения"
              loading={loading.readingHistory}
              emptyText="У вас пока нет истории чтения"
            >
              {profileData.readingHistory.length === 0 ? (
                <Empty 
                  description="У вас пока нет истории чтения" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div className="reading-history-list">
                  {profileData.readingHistory.map((item) => (
                    <div key={item.id} className="reading-history-item">
                      <Link to={`/books/${item.book.id}`}>
                        <h3>{item.book.title}</h3>
                      </Link>
                      <Text type="secondary">
                        Последнее чтение: {formatDate(item.lastReadDate)}
                      </Text>
                      {item.isCompleted && (
                        <Text type="success">Прочитано</Text>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ProfileSection>
          </Col>
        </Row>
      </motion.div>
    </AnimatedBackground>
  );
};

export default ProfilePage; 
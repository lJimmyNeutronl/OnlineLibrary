import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBook, FiHeart } from 'react-icons/fi';
import { FaBookOpen, FaBookReader, FaUserEdit, FaKey, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '@hooks/reduxHooks';
import { logout } from '@store/slices/authSlice';
import userService, { 
  FavoriteBook, 
  ReadingHistoryItem
} from '@services/userService';
import BookCarousel from '@components/book-card/BookCarousel';

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
import styles from './ProfilePage.module.css';

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
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionDividerLeft}></div>
        <Title level={3} className={styles.sectionTitle}>
          {title}
        </Title>
        <div className={styles.sectionDividerRight}></div>
      </div>
      
      {children}
    </div>
  );
};

// Мемоизированный компонент для статистического элемента
const StatsItem = memo<{
  icon: React.ReactNode;
  value: number;
  label: string;
  iconClassName: string;
}>(({ icon, value, label, iconClassName }) => (
  <motion.div 
    whileHover={{ 
      translateY: -5,
      transition: { 
        duration: 0.2, 
        ease: "easeOut",
        type: "tween" // Используем tween вместо spring для лучшей производительности
      }
    }}
    initial={{ translateY: 0 }}
    style={{
      // Принудительное создание композитного слоя
      willChange: 'transform',
      transform: 'translateZ(0)'
    }}
  >
    <div className={iconClassName}>
      {icon}
    </div>
    <h2 className={styles.statsNumber}>{value}</h2>
    <div className={styles.statsLabel}>{label}</div>
  </motion.div>
));

StatsItem.displayName = 'StatsItem';

const ProfilePage = memo(() => {
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

  // Форматирование даты - мемоизируем функцию
  const formatDate = useCallback((iso: string) => 
    new Date(iso).toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), []);

  // Функция для обновления данных профиля
  const refreshProfileData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      console.log('ProfilePage: Начинаем обновление данных профиля...');
      setLoading({ favorites: true, readingHistory: true });
      
      const [favorites, history] = await Promise.all([
        userService.getFavorites(),
        userService.getReadingHistory()
      ]);

      console.log('ProfilePage: Получены новые данные:', {
        favorites: favorites.length,
        history: history.length,
        completedBooks: history.filter(item => item.isCompleted).length,
        inProgressBooks: history.filter(item => !item.isCompleted).length
      });

      setProfileData({
        favorites: Array.isArray(favorites) ? favorites : [],
        readingHistory: Array.isArray(history) ? history : []
      });
      
      console.log('ProfilePage: Данные профиля успешно обновлены');
    } catch (error) {
      console.error('Ошибка загрузки данных профиля:', error);
      message.error('Не удалось загрузить данные профиля');
    } finally {
      setLoading({
        favorites: false,
        readingHistory: false
      });
    }
  }, [isAuthenticated]);

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

  // Отдельный useEffect для слушателя событий обновления профиля
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;

    const handleProfileUpdate = () => {
      console.log('Получено событие обновления профиля');
      
      // Очищаем предыдущий таймер если он есть
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Добавляем дебаунсинг для предотвращения частых обновлений
      timeoutId = setTimeout(() => {
        refreshProfileData();
      }, 300); // Уменьшаем задержку с 500 до 300мс
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdate', handleProfileUpdate);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, refreshProfileData]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Обработчик очистки истории чтения
  const handleClearReadingHistory = useCallback(async () => {
    if (!window.confirm('Вы уверены, что хотите очистить всю историю чтения? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, readingHistory: true }));
      
      await userService.clearReadingHistory();
      
      // Обновляем локальное состояние
      setProfileData(prev => ({
        ...prev,
        readingHistory: []
      }));
      
      message.success('История чтения успешно очищена');
      
      // Отправляем событие обновления профиля для обновления других компонентов
      window.dispatchEvent(new CustomEvent('profileUpdate'));
    } catch (error) {
      console.error('Ошибка при очистке истории чтения:', error);
      message.error('Не удалось очистить историю чтения. Попробуйте еще раз.');
    } finally {
      setLoading(prev => ({ ...prev, readingHistory: false }));
    }
  }, []);

  // Расчет статистических данных с оптимизацией
  const stats = useMemo(() => {
    // Кэшируем результаты фильтрации для избежания повторных вычислений
    let readBooksCount = 0;
    let inProgressCount = 0;
    
    // Используем один проход по массиву вместо трех отдельных filter()
    for (const item of profileData.readingHistory) {
      if (item.isCompleted) {
        readBooksCount++;
      } else {
        inProgressCount++;
      }
    }
    
    return {
      readBooksCount,
      inProgressCount,
      favoritesCount: profileData.favorites.length
    };
  }, [profileData.readingHistory, profileData.favorites.length]);

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
              <Avatar size={150} icon={<FiUser />} className={styles.userAvatar} />
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
                  <div className={`profile-action-icon ${styles.actionIconWarning}`}>
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
                  <div className={`profile-action-icon ${styles.actionIconNeutral}`}>
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
            <Row className={styles.statsCard}>
              <Col span={8} className="stats-item">
                <StatsItem 
                  icon={<FaBookReader size={24} />}
                  value={stats.readBooksCount}
                  label="ПРОЧИТАНО"
                  iconClassName={styles.statsIcon}
                />
              </Col>
              <Col span={8} className="stats-item">
                <StatsItem 
                  icon={<FaBookOpen size={24} />}
                  value={stats.inProgressCount}
                  label="В ПРОЦЕССЕ"
                  iconClassName={styles.statsIconWarning}
                />
              </Col>
              <Col span={8} className="stats-item">
                <StatsItem 
                  icon={<FiHeart size={24} />}
                  value={stats.favoritesCount}
                  label="ИЗБРАННОЕ"
                  iconClassName={styles.statsIconPurple}
                />
              </Col>
            </Row>
            
            {/* Избранные книги */}
            <ProfileSection
              title="Избранные книги"
              loading={loading.favorites}
              emptyText="У вас пока нет избранных книг"
            >
              {profileData.favorites.length === 0 ? (
                <div className={styles.favoritesEmptyContainer}>
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
                  <div className={styles.viewAllButton}>
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
                <div className={styles.historyEmptyContainer}>
                  <Empty 
                    description="У вас пока нет истории чтения" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/books')}
                    className="history-empty-button"
                    icon={<FiBook />}
                  >
                    Найти книги для чтения
                  </Button>
                </div>
              ) : (
                <>
                  <BookCarousel 
                    books={profileData.readingHistory.map(item => ({
                      id: item.book.id,
                      title: item.book.title,
                      author: item.book.author,
                      coverImageUrl: item.book.coverImageUrl,
                      rating: 0, // Рейтинг можно добавить позже если нужно
                      description: null
                    }))}
                    className="profile-history-carousel"
                  />
                  {/* Показываем кнопку очистки только если есть история чтения */}
                  {profileData.readingHistory.length > 0 && (
                    <div className={styles.clearHistoryButton}>
                      <Button 
                        type="primary" 
                        onClick={handleClearReadingHistory}
                        className="clear-history-button"
                        icon={<FaTrash />}
                        disabled={loading.readingHistory}
                      >
                        {loading.readingHistory ? 'Очистка...' : 'Очистить историю чтения'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </ProfileSection>
          </Col>
        </Row>
      </motion.div>
    </AnimatedBackground>
  );
});

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage; 
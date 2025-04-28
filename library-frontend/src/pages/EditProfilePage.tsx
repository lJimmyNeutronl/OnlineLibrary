import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaArrowLeft, FaSave, FaUserEdit } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { loadCurrentUser } from '../store/slices/authSlice';
import userService, { UserProfileUpdateData } from '../services/userService';

// Импортируем наши пользовательские компоненты
import Typography from '../components/common/Typography';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Form from '../components/common/Form';
import message from '../components/common/message';
import Breadcrumb from '../components/common/Breadcrumb';
import BreadcrumbItem from '../components/common/BreadcrumbItem';

// Стили
import '../App.css';

const { Title, Paragraph } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  // Состояния формы
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Загружаем текущие данные пользователя при монтировании компонента
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email);
    }
  }, [user]);
  
  // Если пользователь не авторизован, то перенаправляем его
  if (!user) {
    return null; // Будет перенаправлен через ProtectedRoute
  }
  
  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Подготавливаем данные для обновления
      const profileData: UserProfileUpdateData = {
        firstName: firstName || null,
        lastName: lastName || null
      };
      
      // Отправляем запрос на обновление профиля
      await userService.updateProfile(profileData);
      
      // Обновляем данные пользователя в Redux
      dispatch(loadCurrentUser());
      
      // Показываем сообщение об успешном обновлении
      message.success('Профиль успешно обновлен');
      
      // Перенаправляем на страницу профиля
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      message.error('Не удалось обновить профиль. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="profile-page-wrapper" style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Декоративные элементы, как на странице профиля */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={{
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
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          top: '10%',
          right: '-50px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.07,
        }}
      >
        <FaUserEdit size={250} color="#3769f5" />
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="profile-container"
      >
        {/* Хлебные крошки */}
        <Breadcrumb style={{ margin: '16px 0' }}>
          <BreadcrumbItem onClick={() => navigate('/')}>
            Главная
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate('/profile')}>
            Профиль
          </BreadcrumbItem>
          <BreadcrumbItem>Редактирование профиля</BreadcrumbItem>
        </Breadcrumb>
        
        {/* Основной контент */}
        <div className="edit-profile-section">
          <Title level={2} style={{ 
            background: 'linear-gradient(135deg, #6c5ce7 0%, #8e54e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaUserEdit /> Редактирование профиля
          </Title>
          
          <div className="edit-form-container" style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div className="user-avatar-container" style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div className="user-avatar" style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#6c5ce7',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
              }}>
                <FaUser size={48} />
              </div>
            </div>
            
            <Form onSubmit={handleSubmit}>
              <Form.Item label="Email" required>
                <Input
                  type="email"
                  value={email}
                  disabled
                  prefix={<span style={{color: '#aaa'}}>@</span>}
                  style={{ backgroundColor: '#f9f9f9' }}
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Email нельзя изменить</small>
              </Form.Item>
              
              <Form.Item label="Имя">
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Введите ваше имя"
                />
              </Form.Item>
              
              <Form.Item label="Фамилия">
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Введите вашу фамилию"
                />
              </Form.Item>
              
              <div className="form-actions" style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '32px'
              }}>
                <Button 
                  type="default"
                  onClick={() => navigate('/profile')}
                  icon={<FaArrowLeft />}
                >
                  Вернуться
                </Button>
                
                <Button 
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                  icon={<FaSave />}
                >
                  {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfilePage; 
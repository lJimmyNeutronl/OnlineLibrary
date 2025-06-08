import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaArrowLeft, FaSave, FaUserEdit } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '@hooks/reduxHooks';
import { loadCurrentUser } from '@store/slices/authSlice';
import userService, { UserProfileUpdateData } from '@services/userService';

import { 
  Typography, 
  Button, 
  Input, 
  message, 
  Breadcrumb
} from '@components/common';
import Form from '@components/common/Form';
import AnimatedBackground from '@components/common/AnimatedBackground';

// Импортируем анимации
import { fadeIn } from '@styles/animations';

// Импортируем стили
import styles from './EditProfilePage.module.css';

const { Title, Paragraph } = Typography;

const EditProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  // Объединенное состояние формы
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Загружаем текущие данные пользователя при монтировании компонента
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email
      });
    }
  }, [user]);
  
  // Если пользователь не авторизован, перенаправляем на страницу логина
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Подготавливаем данные для обновления
      const profileData: UserProfileUpdateData = {
        firstName: form.firstName || '',
        lastName: form.lastName || ''
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
      message.error('Не удалось обновить профиль. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AnimatedBackground>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className={styles.profileContainer}
      >
        {/* Хлебные крошки */}
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/profile">Профиль</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item style={{ color: '#8e54e9' }}>Редактирование профиля</Breadcrumb.Item>
        </Breadcrumb>
        
        {/* Основной контент */}
        <div className={styles.editProfileSection}>
          <Title level={2} className={styles.title}>
            <FaUserEdit /> Редактирование профиля
          </Title>
          
          <div className={styles.formContainer}>
            <div className={styles.userAvatar}>
              <FaUser size={48} />
            </div>
            
            <Form onSubmit={handleSubmit}>
              {/* Упрощенное отображение email */}
              <div className={styles.emailDisplay}>
                <Paragraph className={styles.emailLabel}>Email:</Paragraph>
                <Paragraph>{form.email}</Paragraph>
                <Paragraph className={styles.emailHint}>Email нельзя изменить</Paragraph>
              </div>
              
              <Form.Item label="Имя">
                <Input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Введите ваше имя"
                />
              </Form.Item>
              
              <Form.Item label="Фамилия">
                <Input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Введите вашу фамилию"
                />
              </Form.Item>
              
              <div className={styles.formActions}>
                <Button 
                  onClick={() => navigate('/profile')} 
                  icon={<FaArrowLeft />}
                >
                  Назад
                </Button>
                
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isSubmitting} 
                  icon={<FaSave />}
                >
                  Сохранить
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </motion.div>
    </AnimatedBackground>
  );
};

export default EditProfilePage; 
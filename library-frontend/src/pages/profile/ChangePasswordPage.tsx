import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaKey, FaArrowLeft, FaSave, FaLock, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '@hooks/reduxHooks';
import userService, { PasswordChangeData } from '@services/userService';
import { logout } from '@store/slices/authSlice';
import { validatePasswordChange } from '@utils/validation';

// Импортируем пользовательские компоненты и утилиты
import { Typography, Button, Input, message } from '@components/common';
import Breadcrumb, { BreadcrumbItem } from '@components/common/Breadcrumb';
import Form from '@components/common/Form';
import AnimatedBackground from '@components/common/AnimatedBackground';

// Импортируем CSS-модуль
import styles from './ChangePasswordPage.module.css';

const { Title, Paragraph } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  // Состояния формы
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Состояния для показа/скрытия паролей
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Состояния для валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Проверка, был ли изменен хотя бы один пароль
  const isFormTouched = currentPassword || newPassword || confirmPassword;
  
  // Проверка введенных данных перед отправкой
  const validateForm = (): boolean => {
    const validationErrors = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmPassword
    });
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
    
      // Подготавливаем данные для обновления пароля
      const passwordData: PasswordChangeData = {
        currentPassword,
        newPassword
      };
      
      // Отправляем запрос на смену пароля
      const response = await userService.changePassword(passwordData);
      
      if (response.success) {
        // Показываем сообщение об успешной смене пароля
        message.success('Пароль успешно изменен. Пожалуйста, войдите снова.');
        
        // Очищаем форму
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Выходим из аккаунта
        dispatch(logout());
        
        // Перенаправляем на страницу входа
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        // Обрабатываем конкретную ошибку
        if (response.message && response.message.toLowerCase().includes('текущий пароль')) {
          setErrors({ 
            ...errors, 
            currentPassword: 'Текущий пароль указан неверно' 
          });
        } else {
          message.error(response.message || 'Ошибка при смене пароля');
        }
      }
    } catch (error: any) {
      console.error('Ошибка при смене пароля:', error);
      
      // Пытаемся извлечь сообщение об ошибке из ответа API
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.toLowerCase().includes('текущий пароль')) {
          setErrors({
            ...errors,
            currentPassword: 'Текущий пароль указан неверно'
          });
        } else {
          message.error(errorMessage);
        }
      } else {
        message.error('Не удалось изменить пароль. Пожалуйста, проверьте введенные данные.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [currentPassword, newPassword, confirmPassword, dispatch, navigate, errors]);
  
  // Если пользователь не авторизован, то перенаправляем его
  if (!user) {
    return null; // Будет перенаправлен через ProtectedRoute
  }
  
  return (
    <AnimatedBackground>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className={styles.container}
      >
        {/* Хлебные крошки */}
        <Breadcrumb style={{ margin: '16px 0' }}>
          <BreadcrumbItem onClick={() => navigate('/')}>
            Главная
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => navigate('/profile')}>
            Профиль
          </BreadcrumbItem>
          <BreadcrumbItem>Смена пароля</BreadcrumbItem>
        </Breadcrumb>
      
        {/* Основной контент */}
        <div className={styles.changePasswordSection}>
          <Title level={2} className={styles.title}>
            <FaKey /> Смена пароля
          </Title>
          
          <div className={styles.formContainer}>
            <div className={styles.keyIconContainer}>
              <div className={styles.keyIconCircle}>
                <FaLock size={48} />
              </div>
            </div>
            
            {/* Информационное сообщение о требованиях к паролю */}
            <div className={styles.requirementsBlock}>
              <div className={styles.requirementsTitle}>
                <FaInfoCircle style={{ marginRight: '8px' }} /> 
                <strong>Требования к паролю:</strong>
              </div>
              <ul className={styles.requirementsList}>
                <li>Минимум 6 символов</li>
                <li>Использование только латинских букв (a-z, A-Z)</li>
                <li>Допускаются цифры и специальные символы</li>
                <li>Кириллические символы (а-я, А-Я) не допускаются</li>
              </ul>
            </div>
            
            <Form onSubmit={handleSubmit}>
              <Form.Item 
                label="Текущий пароль" 
                required
                validateStatus={errors.currentPassword ? 'error' : undefined}
                help={errors.currentPassword}
              >
                <Input
                  type={showPassword.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  suffix={
                    showPassword.current ? (
                      <FaEyeSlash 
                        onClick={() => setShowPassword(prev => ({ ...prev, current: false }))} 
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <FaEye 
                        onClick={() => setShowPassword(prev => ({ ...prev, current: true }))} 
                        style={{ cursor: 'pointer' }}
                      />
                    )
                  }
                />
              </Form.Item>
              
              <Form.Item 
                label="Новый пароль" 
                required
                validateStatus={errors.newPassword ? 'error' : undefined}
                help={errors.newPassword}
              >
                <Input
                  type={showPassword.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    // Очищаем ошибку при изменении поля
                    if (errors.newPassword) {
                      setErrors({...errors, newPassword: ''});
                    }
                  }}
                  placeholder="Введите новый пароль"
                  suffix={
                    showPassword.new ? (
                      <FaEyeSlash 
                        onClick={() => setShowPassword(prev => ({ ...prev, new: false }))} 
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <FaEye 
                        onClick={() => setShowPassword(prev => ({ ...prev, new: true }))} 
                        style={{ cursor: 'pointer' }}
                      />
                    )
                  }
                />
              </Form.Item>
              
              <Form.Item 
                label="Подтверждение пароля" 
                required
                validateStatus={errors.confirmPassword ? 'error' : undefined}
                help={errors.confirmPassword}
              >
                <Input
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    // Очищаем ошибку при изменении поля
                    if (errors.confirmPassword) {
                      setErrors({...errors, confirmPassword: ''});
                    }
                  }}
                  placeholder="Подтвердите новый пароль"
                  suffix={
                    showPassword.confirm ? (
                      <FaEyeSlash 
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: false }))} 
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <FaEye 
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: true }))} 
                        style={{ cursor: 'pointer' }}
                      />
                    )
                  }
                />
              </Form.Item>
              
              <div className={styles.formActions}>
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
                  disabled={isSubmitting || !isFormTouched}
                  icon={<FaSave />}
                  style={{
                    backgroundColor: '#ff7675',
                    borderColor: '#ff7675'
                  }}
                >
                  {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </motion.div>
    </AnimatedBackground>
  );
};

export default ChangePasswordPage; 
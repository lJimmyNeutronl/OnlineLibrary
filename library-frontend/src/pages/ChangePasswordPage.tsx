import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaKey, FaArrowLeft, FaSave, FaLock, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import userService, { PasswordChangeData } from '../services/userService';
import { logout } from '../store/slices/authSlice';

// Импортируем наши пользовательские компоненты
import Typography from '../components/common/Typography';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Form from '../components/common/Form';
import message from '../components/common/message';
import Breadcrumb, { BreadcrumbItem } from '../components/common/Breadcrumb';

// Стили
import '../App.css';

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
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // Состояния для валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Функция для проверки на наличие кириллических символов
  const containsCyrillic = (text: string): boolean => {
    return /[а-яА-ЯёЁ]/.test(text);
  };
  
  // Функция для проверки на допустимые символы (буквы латинского алфавита, цифры и спецсимволы)
  const hasValidChars = (text: string): boolean => {
    // Разрешены латинские буквы, цифры и специальные символы
    return /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(text);
  };
  
  // Проверка введенных данных перед отправкой
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Пароль должен содержать не менее 6 символов';
    } else if (containsCyrillic(newPassword)) {
      newErrors.newPassword = 'Пароль не должен содержать кириллические символы';
    } else if (!hasValidChars(newPassword)) {
      newErrors.newPassword = 'Пароль должен содержать только латинские буквы, цифры и специальные символы';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите новый пароль';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
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
  };
  
  // Если пользователь не авторизован, то перенаправляем его
  if (!user) {
    return null; // Будет перенаправлен через ProtectedRoute
  }
  
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
        <FaKey size={250} color="#ff7675" />
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
          <BreadcrumbItem>Смена пароля</BreadcrumbItem>
      </Breadcrumb>
      
        {/* Основной контент */}
        <div className="change-password-section">
          <Title level={2} style={{ 
            background: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaKey /> Смена пароля
              </Title>
          
          <div className="password-form-container" style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div className="key-icon-container" style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div className="key-icon-circle" style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#ff7675',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
              }}>
                <FaLock size={48} />
              </div>
            </div>
            
            {/* Информационное сообщение о требованиях к паролю */}
            <div className="password-requirements requirements-block">
              <div className="requirements-title">
                <FaInfoCircle style={{ marginRight: '8px' }} /> 
                <strong>Требования к паролю:</strong>
              </div>
              <ul className="requirements-list">
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
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  suffix={
                    showCurrentPassword ? (
                      <FaEyeSlash 
                        onClick={() => setShowCurrentPassword(false)} 
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <FaEye 
                        onClick={() => setShowCurrentPassword(true)} 
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
                  type={showNewPassword ? 'text' : 'password'}
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
                    showNewPassword ? (
                      <FaEyeSlash 
                        onClick={() => setShowNewPassword(false)} 
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <FaEye 
                        onClick={() => setShowNewPassword(true)} 
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
                  type={showConfirmPassword ? 'text' : 'password'}
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
                    showConfirmPassword ? (
                      <FaEyeSlash 
                        onClick={() => setShowConfirmPassword(false)} 
                        style={{ cursor: 'pointer' }}
                />
                    ) : (
                      <FaEye 
                        onClick={() => setShowConfirmPassword(true)} 
                        style={{ cursor: 'pointer' }}
                      />
                    )
                  }
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
    </div>
  );
};

export default ChangePasswordPage; 
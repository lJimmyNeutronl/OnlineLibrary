import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { AiOutlineUser, AiOutlineLock, AiOutlineMail } from 'react-icons/ai';
import { FaBookOpen, FaGraduationCap, FaBook, FaBookmark } from 'react-icons/fa';

interface LoginFormValues {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

// Стили для анимаций фоновых элементов
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

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: authError, token, user } = useSelector((state: RootState) => state.auth);
  
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState('');

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (token && user) {
      navigate('/');
    }
  }, [token, user, navigate]);

  // Устанавливаем ошибку аутентификации из Redux
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Очищаем ошибку поля при вводе
    if (errors[name as keyof ValidationErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // Очищаем общую ошибку при изменении полей
    if (formError) {
      setFormError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;
    
    // Валидация email
    if (!formValues.email) {
      newErrors.email = 'Email обязателен';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Некорректный email';
      isValid = false;
    }
    
    // Валидация пароля
    if (!formValues.password) {
      newErrors.password = 'Пароль обязателен';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сбрасываем ошибки
    setFormError('');
    
    // Валидируем форму
    if (!validateForm()) {
      return;
    }
    
    try {
      // Отправляем запрос на авторизацию
      const result = await dispatch(login({ 
        email: formValues.email, 
        password: formValues.password 
      })).unwrap();
      
      // Сохраняем JWT-токен в localStorage
      localStorage.setItem('token', result.token);
      
      // Перенаправляем на главную страницу
      navigate('/');
    } catch (error: any) {
      // Обрабатываем ошибку
      if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('Ошибка входа. Проверьте email и пароль');
      }
    }
  };

  // Общие стили для форм
  const formContainerStyle = {
    background: 'white',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    padding: '28px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  };

  const inputContainerStyle = {
    display: 'flex', 
    alignItems: 'center', 
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    padding: '0 11px',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    width: '100%',
    height: '40px', 
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
    boxShadow: '0 2px 4px rgba(55, 105, 245, 0.15)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Декоративные элементы, связанные с книгами */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          top: '-100px',
          right: '-50px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.08,
          transform: 'rotate(15deg)',
        }}
      >
        <FaBookOpen size={250} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          bottom: '-80px',
          left: '-80px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.06,
        }}
      >
        <FaGraduationCap size={200} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pulseAnimation}
        style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          bottom: '20%',
          right: '15%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FaBook size={130} color="#3769f5" />
      </motion.div>

      <motion.div 
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.05, 1],
          transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          top: '20%',
          left: '10%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.08,
        }}
      >
        <FaBook size={160} color="#3769f5" />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          padding: '0 16px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <motion.div variants={slideUp}>
          <div 
            style={formContainerStyle}
          >
            <h2 style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              fontWeight: 600,
              color: '#333',
              background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.8rem'
            }}>Вход в систему</h2>
            
            {formError && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#fff2f0', 
                border: '1px solid #ffccc7',
                color: '#f5222d', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Email
                </label>
                <div style={inputContainerStyle}>
                  <AiOutlineMail style={{ color: errors.email ? '#f5222d' : '#3769f5' }} />
                  <input 
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    required
                    placeholder="Ваш email"
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '12px 11px',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  />
                </div>
                {errors.email && (
                  <div style={{ color: '#f5222d', fontSize: '14px', marginTop: '4px' }}>
                    {errors.email}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 500,
                  color: '#333'
                }}>
                  Пароль
                </label>
                <div style={inputContainerStyle}>
                  <AiOutlineLock style={{ color: errors.password ? '#f5222d' : '#3769f5' }} />
                  <input 
                    type="password"
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    required
                    placeholder="Ваш пароль"
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '12px 11px',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  />
                </div>
                {errors.password && (
                  <div style={{ color: '#f5222d', fontSize: '14px', marginTop: '4px' }}>
                    {errors.password}
                  </div>
                )}
              </div>
              
              <Button 
                type="primary" 
                disabled={isLoading}
                style={buttonStyle}
                fontSize="15px"
                fontWeight={600}
                size="large"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button 
                  type="link" 
                  onClick={() => navigate('/register')} 
                  style={{ color: '#3769f5' }}
                >
                  Нет аккаунта? Зарегистрироваться
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { AiOutlineUser, AiOutlineLock, AiOutlineMail } from 'react-icons/ai';
import { FaBookOpen, FaGraduationCap, FaBook, FaBookmark } from 'react-icons/fa';

// Импортируем стили из нашего модуля стилей
import {
  formPageContainerStyle,
  formContainerStyle,
  formTitleStyle,
  inputContainerStyle,
  inputStyle,
  errorMessageStyle,
  labelStyle,
  primaryButtonStyle,
  fadeIn,
  slideUp,
  floatAnimation,
  rotateAnimation,
  pulseAnimation,
  topRightDecorativeStyle,
  bottomLeftDecorativeStyle,
  bottomRightDecorativeStyle,
  decorativeColors
} from '../styles';

interface LoginFormValues {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

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

  return (
    <div style={formPageContainerStyle}>
      {/* Декоративные элементы, связанные с книгами */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={topRightDecorativeStyle}
      >
        <FaBookOpen size={250} color={decorativeColors.primary} />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        style={bottomLeftDecorativeStyle}
      >
        <FaGraduationCap size={200} color={decorativeColors.primary} />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pulseAnimation}
        style={bottomRightDecorativeStyle}
      >
        <FaBook size={130} color={decorativeColors.primary} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', width: '100%', maxWidth: '460px', zIndex: 1 }}
      >
        <motion.div variants={fadeIn}>
          <div style={formContainerStyle}>
            <h2 style={formTitleStyle}>Вход</h2>

            {/* Форма входа */}
            <form onSubmit={handleSubmit}>
              {formError && (
                <div style={{ 
                  marginBottom: '16px', 
                  padding: '10px', 
                  color: '#f5222d', 
                  backgroundColor: '#fff1f0', 
                  border: '1px solid #ffccc7',
                  borderRadius: '8px'
                }}>
                  {formError}
                </div>
              )}

              <motion.div variants={slideUp}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>
                    Email
                  </label>
                  <div style={{
                    ...inputContainerStyle,
                    border: `1px solid ${errors.email ? '#f5222d' : '#d9d9d9'}`,
                  }}>
                    <AiOutlineMail style={{ color: errors.email ? '#f5222d' : '#3769f5' }} />
                    <input 
                      type="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleChange}
                      required
                      placeholder="Ваш email"
                      style={inputStyle}
                    />
                  </div>
                  {errors.email && (
                    <div style={errorMessageStyle}>
                      {errors.email}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>
                    Пароль
                  </label>
                  <div style={{
                    ...inputContainerStyle,
                    border: `1px solid ${errors.password ? '#f5222d' : '#d9d9d9'}`,
                  }}>
                    <AiOutlineLock style={{ color: errors.password ? '#f5222d' : '#3769f5' }} />
                    <input 
                      type="password"
                      name="password"
                      value={formValues.password}
                      onChange={handleChange}
                      required
                      placeholder="Ваш пароль"
                      style={inputStyle}
                    />
                  </div>
                  {errors.password && (
                    <div style={errorMessageStyle}>
                      {errors.password}
                    </div>
                  )}
                </div>

                <Button 
                  type="primary" 
                  disabled={isLoading}
                  style={primaryButtonStyle}
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
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 
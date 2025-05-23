import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { AiOutlineUser, AiOutlineLock, AiOutlineMail } from 'react-icons/ai';
import AnimatedBackground from '../components/common/AnimatedBackground';

// Импортируем стили из нашего модуля стилей
import {
  formContainerStyle,
  formTitleStyle,
  inputContainerStyle,
  inputStyle,
  errorMessageStyle,
  labelStyle,
  primaryButtonStyle,
  fadeIn,
  slideUp
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

  // Функция для перехода на главную страницу
  const navigateToHome = () => {
    console.log('Выполняем переход на главную страницу');
    
    // Сначала пробуем через React Router
    try {
      navigate('/', { replace: true });
      console.log('Переход через React Router успешен');
    } catch (error) {
      console.error('Ошибка при переходе через React Router:', error);
      
      // Если не получилось, пробуем напрямую через window.location
      try {
        window.location.href = '/';
        console.log('Переход через window.location успешен');
      } catch (redirectError) {
        console.error('Ошибка при переходе через window.location:', redirectError);
      }
    }
  };

  // Обновляем обработчик логина
  const handleSubmit = async (e: React.FormEvent) => {
    // Предотвращаем стандартное поведение формы
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    console.log('Форма отправлена, предотвращаем стандартное поведение');
    
    // Очищаем предыдущие ошибки
    setFormError('');
    setErrors({});
    
    // Проверяем правильность заполнения формы
    if (!validateForm()) {
      console.log('Валидация формы не пройдена');
      return;
    }
    
    try {
      console.log('Попытка входа для пользователя:', formValues.email);
      
      // Отправляем запрос на авторизацию через Redux
      const result = await dispatch(login({ 
        email: formValues.email, 
        password: formValues.password 
      })).unwrap();
      
      console.log('Успешный вход, переход на главную страницу');
      
      // Проверяем наличие пользователя и токена
      if (result.user && result.token) {
        // Переходим на главную страницу
        navigateToHome();
      } else {
        // Если по какой-то причине не получили данные пользователя
        console.error('Нет данных пользователя в ответе после входа');
        setFormError('Ошибка входа: не получены данные пользователя');
      }
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
      
      // Устанавливаем сообщение об ошибке
      if (typeof error === 'string') {
        setFormError(error);
      } else if (error?.message) {
        setFormError(error.message);
      } else {
        setFormError('Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  // Обработчик кнопки входа
  const handleLoginClick = (e: React.MouseEvent) => {
    console.log('1. Кнопка входа нажата');
    
    try {
      // Пробуем вызвать handleSubmit напрямую
      handleSubmit(e as unknown as React.FormEvent);
    } catch (error) {
      console.error('Ошибка при вызове handleSubmit из кнопки:', error);
      
      // Пробуем отправить форму другим способом
      try {
        const form = document.querySelector('form');
        if (form) {
          console.log('Попытка вызвать form.submit()');
          // @ts-ignore
          form.submit();
        } else {
          console.error('Форма не найдена для отправки');
          
          // Если все способы не работают, пробуем выполнить вход напрямую
          console.log('Прямой вызов login через Redux');
          dispatch(login({
            email: formValues.email,
            password: formValues.password
          }));
        }
      } catch (submitError) {
        console.error('Ошибка при попытке отправить форму:', submitError);
      }
    }
  };

  return (
    <AnimatedBackground>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        width: '100%'
      }}>
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
            <form id="loginForm" onSubmit={handleSubmit}>
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

                {/* Стандартная кнопка HTML вместо компонента */}
                <button 
                  type="submit"
                  disabled={isLoading}
                  onClick={handleLoginClick}
                  style={{
                    width: '100%',
                    backgroundColor: '#3769f5',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(55, 105, 245, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isLoading ? 'Вход...' : 'Войти'}
                </button>
              </motion.div>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={() => navigate('/register')} 
                style={{ color: '#3769f5' }}
              >
                Нет аккаунта? Зарегистрироваться
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </AnimatedBackground>
  );
};

export default LoginPage; 
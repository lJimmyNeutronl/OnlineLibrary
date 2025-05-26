import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@store/slices/authSlice';
import { AppDispatch, RootState } from '@store/index';
import { motion } from 'framer-motion';
import Button from '@components/common/Button';
import {AiOutlineLock, AiOutlineMail } from 'react-icons/ai';
import AnimatedBackground from '@components/common/AnimatedBackground';

// Импортируем стили из нашего модуля стилей
import {
  formContainerStyle,
  formTitleStyle,
  inputContainerStyle,
  inputStyle,
  errorMessageStyle,
  labelStyle,
  fadeIn,
  slideUp
} from '@styles/index';
import { loginButtonStyle } from '@styles/buttons';
import styles from './LoginPage.module.css';

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
    
    if (!formValues.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formValues.password) {
      newErrors.password = 'Пароль обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Очищаем предыдущие ошибки
    setFormError('');
    setErrors({});
    
    // Проверяем правильность заполнения формы
    if (!validateForm()) {
      return;
    }
    
    try {
      // Отправляем запрос на авторизацию через Redux
      const result = await dispatch(login({ 
        email: formValues.email, 
        password: formValues.password 
      })).unwrap();
      
      // Проверяем наличие пользователя и токена
      if (result.user && result.token) {
        // Переходим на главную страницу
        navigate('/');
      } else {
        setFormError('Ошибка входа: не получены данные пользователя');
      }
    } catch (error: any) {
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

  return (
    <AnimatedBackground>
      <div className={styles.loginContainer}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.loginFormWrapper}
        >
          <motion.div variants={fadeIn}>
            <div style={formContainerStyle}>
              <h2 style={formTitleStyle}>Вход</h2>

              <form id="loginForm" onSubmit={handleSubmit}>
                {formError && (
                  <div className={styles.errorMessage}>
                    {formError}
                  </div>
                )}

                <motion.div variants={slideUp}>
                  <div className={styles.inputWrapper}>
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

                  <div className={styles.passwordWrapper}>
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

                  <button 
                    type="submit"
                    disabled={isLoading}
                    style={loginButtonStyle}
                  >
                    {isLoading ? 'Вход...' : 'Войти'}
                  </button>
                </motion.div>
              </form>

              <div className={styles.registerLink}>
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
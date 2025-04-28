import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { AiOutlineUser, AiOutlineLock, AiOutlineMail, AiOutlineIdcard, AiOutlineArrowRight } from 'react-icons/ai';
import { FaBookOpen, FaGraduationCap, FaPencilAlt, FaFeatherAlt, FaBook } from 'react-icons/fa';

// Импортируем стили из нашего модуля стилей
import {
  formPageContainerStyle,
  formContainerStyle,
  formTitleStyle,
  inputContainerStyle,
  inputStyle,
  errorMessageStyle,
  labelStyle,
  infoDisplayStyle,
  primaryButtonStyle,
  backButtonStyle,
  fadeIn,
  slideUp,
  slideRight,
  floatAnimation,
  rotateAnimation,
  pulseAnimation,
  topRightDecorativeStyle,
  bottomLeftDecorativeStyle,
  bottomRightDecorativeStyle,
  decorativeColors
} from '../styles';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: authError, token, user } = useSelector((state: RootState) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1); // 1 - персональная информация, 2 - пароль
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Функция для проверки на наличие кириллических символов
  const containsCyrillic = (text: string): boolean => {
    return /[а-яА-ЯёЁ]/.test(text);
  };
  
  // Функция для проверки на допустимые символы (буквы латинского алфавита, цифры и спецсимволы)
  const hasValidChars = (text: string): boolean => {
    // Разрешены латинские буквы, цифры и специальные символы
    return /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(text);
  };

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

  // Перенаправление после успешной регистрации
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);

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

  const validateStep1 = (): boolean => {
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
    
    // Имя и фамилия теперь необязательные
    
    setErrors(newErrors);
    return isValid;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;
    
    // Валидация пароля
    if (!formValues.password) {
      newErrors.password = 'Пароль обязателен';
      isValid = false;
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
      isValid = false;
    } else if (containsCyrillic(formValues.password)) {
      newErrors.password = 'Пароль не должен содержать кириллические символы';
      isValid = false;
    } else if (!hasValidChars(formValues.password)) {
      newErrors.password = 'Пароль должен содержать только латинские буквы, цифры и специальные символы';
      isValid = false;
    }
    
    // Проверка подтверждения пароля
    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
      isValid = false;
    } else if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сбрасываем ошибки
    setFormError('');
    
    // Валидируем форму в зависимости от текущего шага
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    // Для шага 2 проверяем пароли и регистрируем
    if (!validateStep2()) {
      return;
    }
    
    console.log('Attempting registration with:', { 
      email: formValues.email,
      password: formValues.password.length > 0 ? '***' : '', // Не логируем сам пароль в целях безопасности
      firstName: formValues.firstName || undefined,
      lastName: formValues.lastName || undefined
    });
    
    try {
      // Отправляем запрос на регистрацию через Redux
      await dispatch(register({ 
        email: formValues.email, 
        password: formValues.password,
        firstName: formValues.firstName,
        lastName: formValues.lastName
      })).unwrap();
      
      // Устанавливаем флаг успешной регистрации
      setRegistrationSuccess(true);
      
      // Очищаем форму
      setFormValues({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
      });
      
      // Показываем сообщение об успешной регистрации
      setFormError('');
      
      console.log('Registration successful');
    } catch (error: any) {
      // Ошибка будет обработана в extraReducers в authSlice
      console.error('Registration failed:', error);
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
            <h2 style={formTitleStyle}>Регистрация</h2>

            {registrationSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h3 style={{ color: '#52c41a', marginBottom: '16px' }}>Регистрация успешна!</h3>
                <p style={{ marginBottom: '24px' }}>
                  Вы успешно зарегистрировались. Теперь вы можете войти в систему.
                </p>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/login')}
                  style={primaryButtonStyle}
                >
                  Перейти к входу
                </Button>
              </div>
            ) : (
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
            
                {currentStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial="hidden"
                    animate="visible"
                    variants={slideUp}
                  >
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>
                  Имя
                </label>
                <div style={{ 
                          ...inputContainerStyle,
                          border: `1px solid ${errors.firstName ? '#f5222d' : '#d9d9d9'}`,
                        }}>
                          <AiOutlineUser style={{ color: errors.firstName ? '#f5222d' : '#3769f5' }} />
                  <input 
                    type="text"
                            name="firstName"
                            value={formValues.firstName}
                            onChange={handleChange}
                    placeholder="Ваше имя"
                            style={inputStyle}
                  />
                </div>
                        {errors.firstName && (
                          <div style={errorMessageStyle}>
                            {errors.firstName}
                          </div>
                        )}
              </div>

                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>
                  Фамилия
                </label>
                <div style={{ 
                          ...inputContainerStyle,
                          border: `1px solid ${errors.lastName ? '#f5222d' : '#d9d9d9'}`,
                        }}>
                          <AiOutlineUser style={{ color: errors.lastName ? '#f5222d' : '#3769f5' }} />
                  <input 
                    type="text"
                            name="lastName"
                            value={formValues.lastName}
                            onChange={handleChange}
                    placeholder="Ваша фамилия"
                            style={inputStyle}
                          />
                        </div>
                        {errors.lastName && (
                          <div style={errorMessageStyle}>
                            {errors.lastName}
                          </div>
                        )}
                </div>
              </div>

                    <div style={{ marginBottom: '24px' }}>
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

                    <Button 
                      type="primary"
                      onClick={handleNextStep}
                      style={primaryButtonStyle}
                      fontSize="15px"
                      fontWeight={600}
                      size="large"
                    >
                      <span>Продолжить</span> <AiOutlineArrowRight style={{ marginLeft: '8px', fontSize: '14px' }} />
                    </Button>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial="hidden"
                    animate="visible"
                    variants={slideRight}
                  >
                    {/* Отображаем введенный email */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>
                        Email
                      </label>
                      <div style={infoDisplayStyle}>
                        {formValues.email}
                      </div>
                    </div>
                    
                    {/* Информационное сообщение о требованиях к паролю */}
                    <div style={{
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: 'rgba(55, 105, 245, 0.05)',
                      borderRadius: '8px',
                      borderLeft: '4px solid #3769f5',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#3769f5' }}>
                        <AiOutlineIdcard style={{ marginRight: '8px' }} /> 
                        <strong>Требования к паролю:</strong>
                      </div>
                      <ul style={{ marginLeft: '24px', padding: 0 }}>
                        <li>Минимум 6 символов</li>
                        <li>Использование только латинских букв (a-z, A-Z)</li>
                        <li>Допускаются цифры и специальные символы</li>
                        <li>Кириллические символы (а-я, А-Я) не допускаются</li>
                      </ul>
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
                    
                    <div style={{ marginBottom: '24px' }}>
                      <label style={labelStyle}>
                        Подтверждение пароля
                      </label>
                      <div style={{ 
                        ...inputContainerStyle,
                        border: `1px solid ${errors.confirmPassword ? '#f5222d' : '#d9d9d9'}`,
                      }}>
                        <AiOutlineLock style={{ color: errors.confirmPassword ? '#f5222d' : '#3769f5' }} />
                        <input 
                          type="password"
                          name="confirmPassword"
                          value={formValues.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Подтвердите пароль"
                          style={inputStyle}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <div style={errorMessageStyle}>
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
              
                    <Button 
                      type="primary" 
                      disabled={isLoading || registrationSuccess}
                      style={primaryButtonStyle}
                      fontSize="15px"
                      fontWeight={600}
                      size="large"
                      htmlType="submit"
                    >
                      {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>

                    {/* Кнопка "Назад" в стиле Cursor */}
                    <div style={{ 
                      marginTop: '16px', 
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Button 
                        type="link" 
                        onClick={handlePrevStep} 
                        style={backButtonStyle}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="#3769f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Назад
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Перемещаем ссылку "Уже есть аккаунт? Войти" только для первого шага */}
                {currentStep === 1 && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button 
                  type="link" 
                  onClick={() => navigate('/login')} 
                  style={{ color: '#3769f5' }}
                >
                  Уже есть аккаунт? Войти
                </Button>
              </div>
                )}
            </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { AiOutlineUser, AiOutlineLock, AiOutlineMail, AiOutlineIdcard, AiOutlineArrowRight } from 'react-icons/ai';
import { FaBookOpen, FaGraduationCap, FaPencilAlt, FaFeatherAlt, FaBook } from 'react-icons/fa';

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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

// Анимация для перехода между шагами
const slideRight = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
  exit: { x: 20, opacity: 0, transition: { duration: 0.4 } }
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
      newErrors.password = 'Пароль должен быть не менее 6 символов';
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
    
    try {
      // Отправляем запрос на регистрацию (confirmPassword теперь не нужен, дублируем password)
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
      
    } catch (error: any) {
      // Обрабатываем ошибку
      if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('Ошибка регистрации. Возможно, такой email уже существует');
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

  const titleStyle = {
    textAlign: 'center' as const, 
    marginBottom: '24px',
    fontWeight: 600,
    color: '#333',
    background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    fontSize: '1.8rem'
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
          top: '20%',
          right: '15%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FaPencilAlt size={130} color="#3769f5" />
      </motion.div>

      <motion.div 
        initial={{ rotate: -15, x: 0 }}
        animate={{
          rotate: [-15, -10, -15],
          x: [0, 10, 0],
          transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }}
        style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          top: '15%',
          left: '10%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.07,
        }}
      >
        <FaFeatherAlt size={170} color="#3769f5" />
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
          bottom: '20%',
          right: '10%',
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
          maxWidth: '450px', 
          padding: '0 16px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <motion.div variants={slideUp}>
          <div style={formContainerStyle}>
            <h2 style={titleStyle}>Регистрация</h2>

            {registrationSuccess ? (
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f6ffed', 
                border: '1px solid #b7eb8f',
                color: '#52c41a', 
                borderRadius: '8px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Регистрация прошла успешно! Сейчас вы будете перенаправлены на страницу входа.
              </div>
            ) : formError ? (
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
            ) : null}
            
            <form onSubmit={handleSubmit} noValidate>
              {currentStep === 1 ? (
                <motion.div
                  key="step1"
                  initial="hidden"
                  animate="visible"
                  variants={slideRight}
                >
                  {/* Шаг 1: Личная информация */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                        fontWeight: 500,
                        color: '#333'
                }}>
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
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '12px 11px',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  />
                </div>
                      {errors.firstName && (
                        <div style={{ color: '#f5222d', fontSize: '14px', marginTop: '4px' }}>
                          {errors.firstName}
                        </div>
                      )}
              </div>

                    <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                        fontWeight: 500,
                        color: '#333'
                }}>
                  Фамилия
                </label>
                <div style={{ 
                        ...inputContainerStyle,
                        border: `1px solid ${errors.lastName ? '#f5222d' : '#d9d9d9'}`,
                      }}>
                        <AiOutlineIdcard style={{ color: errors.lastName ? '#f5222d' : '#3769f5' }} />
                  <input 
                    type="text"
                          name="lastName"
                          value={formValues.lastName}
                          onChange={handleChange}
                    placeholder="Ваша фамилия"
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '12px 11px',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  />
                      </div>
                      {errors.lastName && (
                        <div style={{ color: '#f5222d', fontSize: '14px', marginTop: '4px' }}>
                          {errors.lastName}
                        </div>
                      )}
                </div>
              </div>

                  <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                      fontWeight: 500,
                      color: '#333'
                }}>
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

                  <Button 
                    type="primary"
                    onClick={handleNextStep}
                    style={buttonStyle}
                    fontSize="15px"
                    fontWeight={600}
                    size="large"
                  >
                    <span>Продолжить</span> <AiOutlineArrowRight style={{ marginLeft: '8px', fontSize: '14px' }} />
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial="hidden"
                  animate="visible"
                  variants={slideRight}
                >
                  {/* Шаг 2: Пароль */}
                  {/* Отображаем введенный email */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      fontWeight: 500,
                      color: '#333'
                    }}>
                      Email
                    </label>
                    <div style={{ 
                      padding: '12px 16px',
                      backgroundColor: '#f5f7fa',
                      borderRadius: '8px',
                      color: '#3769f5',
                      fontSize: '16px'
                    }}>
                      {formValues.email}
                    </div>
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
                  disabled={isLoading || registrationSuccess}
                  style={buttonStyle}
                  fontSize="15px"
                  fontWeight={600}
                  size="large"
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
                      style={{ 
                        color: '#3769f5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
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
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 
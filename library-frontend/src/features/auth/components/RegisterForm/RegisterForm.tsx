import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineMail, AiOutlineLock, AiOutlineUser, AiOutlineIdcard, AiOutlineArrowRight } from 'react-icons/ai';
import Button from '../../../../shared/ui/Button';
import { FormStyles } from '../../../../shared/ui/Form';
import { fadeIn, slideRight, slideUp } from '../../../../shared/utils';
import { useAuth } from '../../hooks/useAuth';
import { RegisterFormData } from '../../types';

// Используем импортированные стили
const {
  formContainerStyle,
  formHeaderStyle: formTitleStyle,
  formGroupStyle: inputContainerStyle,
  formInputStyle: inputStyle,
  formErrorStyle: errorMessageStyle,
  formLabelStyle: labelStyle,
} = FormStyles;

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Компонент формы регистрации
 */
export const RegisterForm: React.FC = () => {
  const { isLoading, error: authError, handleRegister } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1); // 1 - персональная информация, 2 - пароль
  const [formValues, setFormValues] = useState<RegisterFormData & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState('');

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
    
    // Имя и фамилия необязательные
    
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
    
    // Проверка совпадения паролей
    if (formValues.password !== formValues.confirmPassword) {
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
    
    // Отправляем запрос на регистрацию через хук useAuth
    const registerData = {
      email: formValues.email,
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      firstName: formValues.firstName || undefined,
      lastName: formValues.lastName || undefined
    };
    
    await handleRegister(registerData);
  };

  return (
    <motion.div variants={fadeIn}>
      <div style={formContainerStyle}>
        <h2 style={formTitleStyle}>Регистрация</h2>

        {/* Шаг регистрации */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '24px'
        }}>
          <div style={{ 
            width: '48%', 
            height: '4px', 
            backgroundColor: currentStep >= 1 ? '#3769f5' : '#e8e8e8', 
            borderRadius: '2px'
          }} />
          <div style={{ 
            width: '48%', 
            height: '4px', 
            backgroundColor: currentStep >= 2 ? '#3769f5' : '#e8e8e8', 
            borderRadius: '2px'
          }} />
        </div>

        {/* Форма регистрации */}
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

          {/* Шаг 1: Личные данные */}
          {currentStep === 1 && (
            <>
              <motion.div variants={slideUp}>
                <div style={inputContainerStyle}>
                  <label htmlFor="email" style={labelStyle}>
                    Email <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <AiOutlineMail style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#3769f5'
                    }} />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleChange}
                      placeholder="Введите email"
                      style={{
                        ...inputStyle,
                        borderColor: errors.email ? '#f5222d' : inputStyle.borderColor,
                        paddingLeft: '40px'
                      }}
                    />
                  </div>
                  {errors.email && <div style={errorMessageStyle}>{errors.email}</div>}
                </div>
              </motion.div>

              <motion.div variants={slideUp}>
                <div style={inputContainerStyle}>
                  <label htmlFor="firstName" style={labelStyle}>
                    Имя (необязательно)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <AiOutlineUser style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#3769f5'
                    }} />
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formValues.firstName}
                      onChange={handleChange}
                      placeholder="Введите имя"
                      style={{
                        ...inputStyle,
                        borderColor: errors.firstName ? '#f5222d' : inputStyle.borderColor,
                        paddingLeft: '40px'
                      }}
                    />
                  </div>
                  {errors.firstName && <div style={errorMessageStyle}>{errors.firstName}</div>}
                </div>
              </motion.div>

              <motion.div variants={slideUp}>
                <div style={inputContainerStyle}>
                  <label htmlFor="lastName" style={labelStyle}>
                    Фамилия (необязательно)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <AiOutlineIdcard style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#3769f5'
                    }} />
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formValues.lastName}
                      onChange={handleChange}
                      placeholder="Введите фамилию"
                      style={{
                        ...inputStyle,
                        borderColor: errors.lastName ? '#f5222d' : inputStyle.borderColor,
                        paddingLeft: '40px'
                      }}
                    />
                  </div>
                  {errors.lastName && <div style={errorMessageStyle}>{errors.lastName}</div>}
                </div>
              </motion.div>

              <motion.div 
                variants={slideUp}
                style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}
              >
                <Button 
                  type="primary" 
                  onClick={handleNextStep}
                  icon={<AiOutlineArrowRight />}
                >
                  Далее
                </Button>
              </motion.div>
            </>
          )}

          {/* Шаг 2: Пароль */}
          {currentStep === 2 && (
            <>
              <motion.div variants={slideRight}>
                <div style={inputContainerStyle}>
                  <label htmlFor="password" style={labelStyle}>
                    Пароль <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <AiOutlineLock style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#3769f5'
                    }} />
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formValues.password}
                      onChange={handleChange}
                      placeholder="Введите пароль (не менее 6 символов)"
                      style={{
                        ...inputStyle,
                        borderColor: errors.password ? '#f5222d' : inputStyle.borderColor,
                        paddingLeft: '40px'
                      }}
                    />
                  </div>
                  {errors.password && <div style={errorMessageStyle}>{errors.password}</div>}
                </div>
              </motion.div>

              <motion.div variants={slideRight}>
                <div style={inputContainerStyle}>
                  <label htmlFor="confirmPassword" style={labelStyle}>
                    Подтверждение пароля <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <AiOutlineLock style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#3769f5'
                    }} />
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      placeholder="Повторите пароль"
                      style={{
                        ...inputStyle,
                        borderColor: errors.confirmPassword ? '#f5222d' : inputStyle.borderColor,
                        paddingLeft: '40px'
                      }}
                    />
                  </div>
                  {errors.confirmPassword && <div style={errorMessageStyle}>{errors.confirmPassword}</div>}
                </div>
              </motion.div>

              <motion.div 
                variants={slideUp}
                style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}
              >
                <Button 
                  type="default" 
                  onClick={handlePrevStep}
                >
                  Назад
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={isLoading}
                >
                  Зарегистрироваться
                </Button>
              </motion.div>
            </>
          )}
        </form>
      </div>
    </motion.div>
  );
}; 
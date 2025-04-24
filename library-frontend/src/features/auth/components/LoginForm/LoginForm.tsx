import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Typography } from '../../../../shared/ui';
import { LoginFormContainer, FormGroup, FormFooter } from './LoginForm.styles';
import { useAuth } from '../../hooks/useAuth';
import { LoginFormData } from '../../types';

/**
 * Компонент формы авторизации
 */
const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  // Функция для валидации полей
  const validateField = (name: keyof LoginFormData, value: string): string => {
    if (name === 'email') {
      if (!value) return 'Пожалуйста, введите email';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Пожалуйста, введите корректный email';
    } else if (name === 'password') {
      if (!value) return 'Пожалуйста, введите пароль';
      if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
    }
    return '';
  };

  const { isLoading, error: authError, handleLogin } = useAuth();

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: fieldValue 
    }));

    // Валидация поля
    if (type !== 'checkbox') {
      const error = validateField(name as keyof LoginFormData, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем все поля на ошибки перед отправкой
    const errors: Partial<Record<keyof LoginFormData, string>> = {};
    let hasErrors = false;
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'rememberMe') {
        const error = validateField(key as keyof LoginFormData, value as string);
        if (error) {
          errors[key as keyof LoginFormData] = error;
          hasErrors = true;
        }
      }
    });
    
    setFormErrors(errors);
    
    // Если ошибок нет, отправляем форму
    if (!hasErrors) {
      await handleLogin(formData);
    }
  };

  return (
    <LoginFormContainer>
      <Typography.Title level={2}>Авторизация</Typography.Title>
      {authError && (
        <div className="error-message">{authError}</div>
      )}
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Введите email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="password">Пароль</label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Введите пароль"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
          />
        </FormGroup>
        <FormGroup>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Запомнить меня
          </label>
        </FormGroup>
        <FormGroup>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            disabled={isLoading}
            block
          >
            Войти
          </Button>
        </FormGroup>
        <FormFooter>
          <Typography.Text>
            Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
          </Typography.Text>
        </FormFooter>
      </form>
    </LoginFormContainer>
  );
};

export default LoginForm; 
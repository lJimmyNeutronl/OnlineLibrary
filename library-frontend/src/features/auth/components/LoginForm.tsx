import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { LoginFormData } from '../types';

/**
 * Компонент формы входа
 */
export const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Состояние формы
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData);
      // Перенаправление на предыдущую страницу или на главную
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Ошибка обрабатывается в useAuth
    }
  };
  
  return (
    <div className="login-form">
      <h2>Вход в систему</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}; 
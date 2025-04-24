import { CSSProperties } from 'react';

// Базовые стили кнопок
export const baseButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: 'none',
  outline: 'none',
};

// Стиль для основных кнопок приложения (вход, регистрация и т.д.)
export const primaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  width: '100%',
  height: '40px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
  boxShadow: '0 2px 4px rgba(55, 105, 245, 0.15)',
};

// Стиль для дополнительных кнопок
export const secondaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  width: '100%',
  height: '40px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 500,
  backgroundColor: '#fff',
  color: '#3769f5',
  border: '1px solid #3769f5',
};

// Кнопка "назад" в стиле Cursor
export const backButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  color: '#3769f5',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'transparent',
  padding: 0,
};

// Кнопка в виде ссылки
export const linkButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: 'transparent',
  color: '#3769f5',
  padding: 0,
  height: 'auto',
}; 
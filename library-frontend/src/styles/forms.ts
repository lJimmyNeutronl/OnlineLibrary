import { CSSProperties } from 'react';

// Базовый стиль для контейнеров форм
export const formContainerStyle: CSSProperties = {
  background: 'white',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  borderRadius: '16px',
  padding: '28px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

// Стиль для контейнера полей ввода с иконкой
export const inputContainerStyle: CSSProperties = {
  display: 'flex', 
  alignItems: 'center', 
  border: '1px solid #d9d9d9',
  borderRadius: '8px',
  padding: '0 11px',
  transition: 'all 0.3s ease'
};

// Стиль для контейнера с ошибкой валидации
export const inputContainerErrorStyle: CSSProperties = {
  ...inputContainerStyle,
  border: '1px solid #f5222d',
};

// Стиль для полей ввода
export const inputStyle: CSSProperties = {
  border: 'none',
  outline: 'none',
  padding: '12px 11px',
  width: '100%',
  fontSize: '16px'
};

// Стиль для текста сообщений об ошибках
export const errorMessageStyle: CSSProperties = {
  color: '#f5222d',
  fontSize: '14px',
  marginTop: '4px'
};

// Стиль для заголовков форм
export const formTitleStyle: CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
  fontWeight: 600,
  color: '#333',
  background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '1.8rem'
};

// Стиль для меток полей формы
export const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 500,
  color: '#333'
};

// Стиль для контейнера формы с фоном
export const formPageContainerStyle: CSSProperties = {
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  minHeight: 'calc(100vh - 64px)',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px 0',
  position: 'relative',
  overflow: 'hidden'
};

// Стиль для отображения информации (email на втором шаге)
export const infoDisplayStyle: CSSProperties = {
  padding: '12px 16px',
  backgroundColor: '#f5f7fa',
  borderRadius: '8px',
  color: '#3769f5',
  fontSize: '16px'
}; 
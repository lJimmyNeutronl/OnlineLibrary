import { CSSProperties } from 'react';

// Основной контейнер формы
export const formContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  padding: '24px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

// Заголовок формы
export const formHeaderStyle: CSSProperties = {
  marginBottom: '24px',
  textAlign: 'center',
  fontSize: '24px',
  fontWeight: 600,
  color: '#333',
};

// Группа полей
export const formGroupStyle: CSSProperties = {
  marginBottom: '16px',
};

// Метка поля
export const formLabelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
};

// Поле ввода
export const formInputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '16px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  transition: 'border-color 0.3s',
};

// Поле ввода в фокусе
export const formInputFocusStyle: CSSProperties = {
  borderColor: '#3f51b5',
  outline: 'none',
  boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)',
};

// Сообщение об ошибке
export const formErrorStyle: CSSProperties = {
  marginTop: '4px',
  fontSize: '12px',
  color: '#f44336',
};

// Текст подсказки
export const formHelpTextStyle: CSSProperties = {
  marginTop: '4px',
  fontSize: '12px',
  color: '#757575',
}; 
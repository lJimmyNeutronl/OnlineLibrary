import React, { ReactNode } from 'react';
import { baseButtonStyle } from './styles';

export interface ButtonProps {
  children: ReactNode;
  type?: 'primary' | 'default' | 'text' | 'link';
  size?: 'small' | 'middle' | 'large';
  icon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  danger?: boolean;
  block?: boolean;
  fontSize?: string | number;
  fontWeight?: number | string;
  htmlType?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

/**
 * Универсальный компонент кнопки с разными вариантами отображения
 */
const Button: React.FC<ButtonProps> = ({
  children,
  type = 'default',
  size = 'middle',
  icon,
  onClick,
  style,
  className = '',
  disabled = false,
  danger = false,
  block = false,
  fontSize,
  fontWeight,
  htmlType = 'button',
  loading = false
}) => {
  // Базовые стили кнопки
  const baseStyle: React.CSSProperties = {
    ...baseButtonStyle,
    fontWeight: fontWeight || 400,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: disabled ? 0.6 : 1,
    width: block ? '100%' : 'auto',
    ...style
  };

  // Стили для разных типов кнопок
  const typeStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: danger ? '#ff4d4f' : 'var(--primary-color, #3769f5)',
      color: '#fff',
      border: 'none',
      boxShadow: danger ? '0 2px 4px rgba(255, 77, 79, 0.2)' : '0 2px 4px rgba(55, 105, 245, 0.2)'
    },
    default: {
      backgroundColor: '#fff',
      color: danger ? '#ff4d4f' : 'rgba(0, 0, 0, 0.65)',
      border: `1px solid ${danger ? '#ff4d4f' : '#d9d9d9'}`
    },
    text: {
      backgroundColor: 'transparent',
      color: danger ? '#ff4d4f' : 'rgba(0, 0, 0, 0.65)',
      border: 'none'
    },
    link: {
      backgroundColor: 'transparent',
      color: danger ? '#ff4d4f' : 'var(--primary-color, #3769f5)',
      border: 'none',
      boxShadow: 'none'
    }
  };

  // Стили для разных размеров кнопок
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      height: '24px',
      padding: '0 7px',
      fontSize: fontSize || '12px',
      borderRadius: '4px'
    },
    middle: {
      height: '32px',
      padding: '4px 15px',
      fontSize: fontSize || '14px',
      borderRadius: '4px'
    },
    large: {
      height: '40px',
      padding: '6px 16px',
      fontSize: fontSize || '16px',
      borderRadius: '4px'
    }
  };

  // Комбинирование всех стилей
  const combinedStyle = {
    ...baseStyle,
    ...typeStyles[type],
    ...sizeStyles[size]
  };

  // Индикатор загрузки
  const loadingIcon = loading ? (
    <span
      style={{
        display: 'inline-block',
        width: '1em',
        height: '1em',
        marginRight: children ? '8px' : 0,
        borderRadius: '50%',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.3) currentColor',
        animation: 'spin 1s linear infinite',
      }}
    />
  ) : null;

  return (
    <button
      className={`btn btn-${type} btn-${size} ${danger ? 'btn-danger' : ''} ${className}`}
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled || loading}
      type={htmlType}
    >
      {loadingIcon || (icon && <span style={{ marginRight: children ? '8px' : 0 }}>{icon}</span>)}
      {children}
    </button>
  );
};

// Добавляем глобальные стили для анимации загрузки
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default Button; 
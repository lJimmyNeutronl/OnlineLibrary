import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  type?: 'primary' | 'default' | 'text' | 'link';
  size?: 'small' | 'middle' | 'large';
  icon?: ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  danger?: boolean;
  block?: boolean;
}

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
  block = false
}) => {
  // Базовые стили кнопки
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
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
      fontSize: '12px',
      borderRadius: '4px'
    },
    middle: {
      height: '32px',
      padding: '4px 15px',
      fontSize: '14px',
      borderRadius: '4px'
    },
    large: {
      height: '40px',
      padding: '6px 16px',
      fontSize: '16px',
      borderRadius: '4px'
    }
  };

  // Комбинирование всех стилей
  const combinedStyle = {
    ...baseStyle,
    ...typeStyles[type],
    ...sizeStyles[size]
  };

  return (
    <button
      className={`btn btn-${type} btn-${size} ${danger ? 'btn-danger' : ''} ${className}`}
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span style={{ marginRight: children ? '8px' : 0 }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 
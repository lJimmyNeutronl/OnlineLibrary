import React from 'react';

interface ButtonProps {
  children?: React.ReactNode;
  type?: 'default' | 'primary' | 'text' | 'link';
  size?: 'small' | 'middle' | 'large';
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  block?: boolean;
  fontSize?: string;
  fontWeight?: number;
  htmlType?: 'button' | 'submit' | 'reset';
}

// Базовые стили кнопки
const baseButtonStyle: React.CSSProperties = {
  outline: 'none',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
  userSelect: 'none',
  touchAction: 'manipulation',
  lineHeight: 1.5,
  fontWeight: 400,
  border: '1px solid transparent'
};

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'default',
  size = 'middle',
  icon,
  onClick,
  style,
  className = '',
  disabled = false,
  loading = false,
  danger = false,
  block = false,
  fontSize,
  fontWeight,
  htmlType = 'button'
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
    <span style={{ 
      display: 'inline-block', 
      marginRight: children ? '8px' : 0,
      width: '14px',
      height: '14px',
      border: '2px solid currentColor',
      borderRightColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></span>
  ) : null;

  // Добавляем глобальные стили для анимации
  React.useEffect(() => {
    // Проверяем, есть ли уже стиль с ключом spin-animation
    if (loading && !document.getElementById('spin-animation')) {
      const style = document.createElement('style');
      style.id = 'spin-animation';
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, [loading]);

  return (
    <button
      className={`btn btn-${type} btn-${size} ${danger ? 'btn-danger' : ''} ${className}`}
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled || loading}
      type={htmlType}
    >
      {loadingIcon}
      {icon && !loading && <span style={{ marginRight: children ? '8px' : 0 }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 
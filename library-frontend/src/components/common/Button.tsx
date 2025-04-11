import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'primary' | 'default' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'default',
  size = 'medium',
  icon,
  onClick,
  className = '',
  style
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: '4px 12px', fontSize: '14px' };
      case 'large':
        return { padding: '12px 24px', fontSize: '18px' };
      default:
        return { padding: '8px 16px', fontSize: '16px' };
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'primary':
        return {
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          '&:hover': {
            background: 'var(--primary-hover)'
          }
        };
      case 'text':
        return {
          background: 'transparent',
          color: 'var(--text-color)',
          border: 'none',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.04)'
          }
        };
      default:
        return {
          background: 'white',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          '&:hover': {
            borderColor: 'var(--primary-color)',
            color: 'var(--primary-color)'
          }
        };
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`custom-button ${className}`}
      style={{
        ...getSizeStyles(),
        ...getTypeStyles(),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--border-radius)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        gap: '8px',
        ...style
      }}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button; 
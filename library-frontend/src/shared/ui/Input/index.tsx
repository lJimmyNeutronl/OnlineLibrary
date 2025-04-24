import React, { InputHTMLAttributes, ReactNode, KeyboardEvent } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix' | 'size'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: 'small' | 'default' | 'large';
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  onPressEnter?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  prefix,
  suffix,
  size = 'default',
  className = '',
  inputClassName = '',
  disabled = false,
  onPressEnter,
  ...props
}) => {
  // Определение стилей в зависимости от размера
  const getInputStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return { height: '24px', padding: '0 8px', fontSize: '14px' };
      case 'large':
        return { height: '40px', padding: '0 16px', fontSize: '16px' };
      case 'default':
      default:
        return { height: '32px', padding: '0 12px', fontSize: '14px' };
    }
  };

  const inputStyles = getInputStyles();
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onPressEnter) {
      onPressEnter();
    }
    
    // Вызываем оригинальный обработчик, если он есть
    if (props.onKeyDown) {
      props.onKeyDown(e as any);
    }
  };

  return (
    <div className={`input-wrapper ${className}`} style={{ marginBottom: error ? '24px' : '16px' }}>
      {label && (
        <div 
          className="input-label" 
          style={{ 
            marginBottom: '8px',
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.85)'
          }}
        >
          {label}
        </div>
      )}
      <div 
        className={`input-container ${error ? 'error' : ''}`} 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`,
          borderRadius: '2px',
          transition: 'all 0.3s',
          position: 'relative',
          ...inputStyles
        }}
      >
        {prefix && (
          <div className="input-prefix" style={{ padding: '0 8px' }}>
            {prefix}
          </div>
        )}
        <input
          className={`input ${inputClassName}`}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            height: '100%',
            fontSize: 'inherit',
          }}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {suffix && (
          <div className="input-suffix" style={{ padding: '0 8px' }}>
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <div 
          className="input-error" 
          style={{ 
            color: '#ff4d4f',
            fontSize: '12px',
            marginTop: '4px',
            lineHeight: 1.5
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Input; 
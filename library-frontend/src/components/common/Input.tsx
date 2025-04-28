import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  size?: 'small' | 'middle' | 'large';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  size = 'middle',
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  allowClear = false,
  className = '',
  style = {},
  ...rest
}) => {
  const [value, setValue] = React.useState(rest.value || rest.defaultValue || '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Обработка изменения значения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (rest.onChange) {
      rest.onChange(e);
    }
  };

  // Очистка поля ввода
  const handleClear = () => {
    setValue('');
    if (inputRef.current) {
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: true,
        value: { value: '' }
      });
      inputRef.current.dispatchEvent(event);
      
      // Фокусируемся на поле ввода после очистки
      inputRef.current.focus();
    }
  };

  // Определение размеров в зависимости от props size
  const getInputSize = () => {
    switch (size) {
      case 'small':
        return { height: '24px', fontSize: '14px', paddingLeft: '7px', paddingRight: '7px' };
      case 'large':
        return { height: '40px', fontSize: '16px', paddingLeft: '11px', paddingRight: '11px' };
      default:
        return { height: '32px', fontSize: '14px', paddingLeft: '11px', paddingRight: '11px' };
    }
  };

  // Базовые стили для input
  const baseStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    margin: 0,
    fontVariant: 'tabular-nums',
    listStyle: 'none',
    fontFeatureSettings: 'tnum',
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    minWidth: 0,
    color: 'rgba(0, 0, 0, 0.85)',
    backgroundColor: '#fff',
    backgroundImage: 'none',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    transition: 'all 0.3s',
    ...getInputSize(),
    ...style
  };

  // Модифицируем стили в зависимости от того, есть ли prefix/suffix
  const inputStyle: React.CSSProperties = {
    ...baseStyle
  };

  if (prefix) {
    inputStyle.paddingLeft = '30px';
  }

  if (suffix || (allowClear && value)) {
    inputStyle.paddingRight = '30px';
  }

  if (rest.disabled) {
    inputStyle.backgroundColor = '#f5f5f5';
    inputStyle.borderColor = '#d9d9d9';
    inputStyle.color = 'rgba(0, 0, 0, 0.25)';
    inputStyle.cursor = 'not-allowed';
  }

  return (
    <div 
      className={`input-wrapper ${className}`}
      style={{ 
        position: 'relative',
        display: 'inline-block',
        width: '100%',
      }}
    >
      {addonBefore && (
        <div 
          className="input-addon-before"
          style={{
            paddingInline: '11px',
            border: '1px solid #d9d9d9',
            borderRight: 0,
            borderRadius: '4px 0 0 4px',
            backgroundColor: '#fafafa',
            display: 'inline-flex',
            alignItems: 'center',
            ...getInputSize()
          }}
        >
          {addonBefore}
        </div>
      )}
      
      <div style={{ position: 'relative', display: 'inline-block', width: addonBefore || addonAfter ? 'auto' : '100%' }}>
        {prefix && (
          <span 
            className="input-prefix"
            style={{
              position: 'absolute',
              top: '50%',
              left: '12px',
              transform: 'translateY(-50%)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(0, 0, 0, 0.45)',
            }}
          >
            {prefix}
          </span>
        )}
        
        <input 
          ref={inputRef}
          type={type}
          value={rest.value !== undefined ? rest.value : value}
          onChange={handleChange}
          style={inputStyle}
          {...rest}
        />
        
        {(suffix || (allowClear && value)) && (
          <span 
            className="input-suffix"
            style={{
              position: 'absolute',
              top: '50%',
              right: '12px',
              transform: 'translateY(-50%)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(0, 0, 0, 0.45)',
            }}
          >
            {allowClear && value && (
              <span 
                className="input-clear-icon"
                style={{
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginRight: suffix ? '4px' : 0,
                  padding: '2px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  color: 'rgba(0, 0, 0, 0.25)',
                }}
                onClick={handleClear}
              >
                ✕
              </span>
            )}
            {suffix}
          </span>
        )}
      </div>
      
      {addonAfter && (
        <div 
          className="input-addon-after"
          style={{
            paddingInline: '11px',
            border: '1px solid #d9d9d9',
            borderLeft: 0,
            borderRadius: '0 4px 4px 0',
            backgroundColor: '#fafafa',
            display: 'inline-flex',
            alignItems: 'center',
            ...getInputSize()
          }}
        >
          {addonAfter}
        </div>
      )}
    </div>
  );
};

export default Input; 
import React from 'react';
import './Input.css';

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

  // Формируем классы для wrapper
  const wrapperClasses = [
    'input-wrapper',
    `size-${size}`,
    prefix ? 'has-prefix' : '',
    suffix || (allowClear && value) ? 'has-suffix' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses} style={style}>
      {addonBefore && (
        <div className="input-addon-before">
          {addonBefore}
        </div>
      )}
      
      <div style={{ position: 'relative', display: 'inline-block', width: addonBefore || addonAfter ? 'auto' : '100%' }}>
        {prefix && (
          <span className="input-prefix">
            {prefix}
          </span>
        )}
        
        <input 
          ref={inputRef}
          type={type}
          value={rest.value !== undefined ? rest.value : value}
          onChange={handleChange}
          {...rest}
        />
        
        {(suffix || (allowClear && value)) && (
          <span className="input-suffix">
            {allowClear && value && (
              <span 
                className="input-clear-icon"
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
        <div className="input-addon-after">
          {addonAfter}
        </div>
      )}
    </div>
  );
};

export default Input; 
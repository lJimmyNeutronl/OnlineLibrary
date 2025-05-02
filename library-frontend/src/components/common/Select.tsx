import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

export interface SelectOptionType {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  options?: SelectOptionType[];
  onChange?: (value: any) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

interface OptionProps {
  value: string | number;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const Option: React.FC<OptionProps> = () => null; // Это компонент-заглушка, он не рендерится

// Создаем расширенный интерфейс для Select с включением Option
interface SelectComponent extends React.FC<SelectProps> {
  Option: React.FC<OptionProps>;
}

const Select: SelectComponent = ({
  value: propValue,
  defaultValue,
  placeholder = 'Выберите...',
  options = [],
  onChange,
  style = {},
  disabled = false,
  allowClear = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string | number | undefined>(propValue !== undefined ? propValue : defaultValue);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Обновляем внутреннее состояние при изменении propValue
  useEffect(() => {
    if (propValue !== undefined) {
      setValue(propValue);
    }
  }, [propValue]);

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Обработка выбора опции
  const handleSelect = (option: SelectOptionType) => {
    if (disabled || option.disabled) return;
    setValue(option.value);
    setIsOpen(false);
    
    if (onChange) {
      onChange(option.value);
    }
  };

  // Очистка значения
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(undefined);
    
    if (onChange) {
      onChange(undefined);
    }
  };

  // Находим выбранную опцию по значению
  const selectedOption = options.find(option => option.value === value);

  // Обработка нажатий клавиш для навигации
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && activeIndex < options.length) {
          handleSelect(options[activeIndex]);
        } else {
          setIsOpen(prev => !prev);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Стили для основного контейнера
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    ...style
  };

  // Стили для селекта
  const selectStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '32px',
    padding: '4px 11px',
    border: `1px solid ${isOpen ? '#3769f5' : '#d9d9d9'}`,
    borderRadius: '4px',
    backgroundColor: disabled ? '#f5f5f5' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s',
    boxShadow: isOpen ? '0 0 0 2px rgba(55, 105, 245, 0.2)' : 'none',
  };

  // Стили для дропдауна
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)',
    maxHeight: '256px',
    overflow: 'auto',
    padding: '4px 0',
  };

  return (
    <div 
      className={`custom-select ${className}`} 
      style={containerStyle}
      ref={selectRef}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={`select-selector ${isOpen ? 'open' : ''}`}
        style={selectStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div 
          className="select-value" 
          style={{ 
            flex: 1, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            color: !selectedOption && !disabled ? '#bfbfbf' : 'rgba(0, 0, 0, 0.85)',
            opacity: disabled ? 0.4 : 1,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {allowClear && value !== undefined && !disabled && (
            <FiX 
              size={14} 
              style={{ marginRight: 8, color: '#bfbfbf' }}
              onClick={handleClear}
            />
          )}
          {isOpen ? <FiChevronUp size={16} color="#bfbfbf" /> : <FiChevronDown size={16} color="#bfbfbf" />}
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div className="select-dropdown" style={dropdownStyle} ref={dropdownRef}>
          {options.length === 0 ? (
            <div style={{ padding: '8px 12px', color: '#999', textAlign: 'center' }}>
              Нет доступных опций
            </div>
          ) : (
            options.map((option, index) => (
              <div 
                key={option.value.toString()}
                className={`select-option ${value === option.value ? 'selected' : ''} ${activeIndex === index ? 'active' : ''}`}
                style={{
                  padding: '8px 12px',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  backgroundColor: activeIndex === index ? '#f5f5f5' : 'transparent',
                  color: option.disabled ? '#bfbfbf' : 'rgba(0, 0, 0, 0.85)',
                  fontWeight: value === option.value ? 'bold' : 'normal',
                }}
                onClick={() => !option.disabled && handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Присваиваем Option к компоненту Select
Select.Option = Option;

export default Select; 
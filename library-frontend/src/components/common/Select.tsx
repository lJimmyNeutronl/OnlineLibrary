import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import './Select.css';

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
  size?: 'small' | 'middle' | 'large';
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
  size = 'middle',
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

  // Формируем классы
  const containerClasses = [
    'custom-select',
    `size-${size}`,
    className
  ].filter(Boolean).join(' ');

  const selectorClasses = [
    'select-selector',
    isOpen ? 'open' : '',
    disabled ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  const valueClasses = [
    'select-value',
    !selectedOption ? 'placeholder' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      style={style}
      ref={selectRef}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={selectorClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={valueClasses}>
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {allowClear && value !== undefined && !disabled && (
            <FiX 
              size={14} 
              className="select-clear"
              onClick={handleClear}
            />
          )}
          <div className="select-arrow">
            {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div className="select-dropdown" ref={dropdownRef}>
          {options.length === 0 ? (
            <div className="select-empty">
              Нет доступных опций
            </div>
          ) : (
            options.map((option, index) => {
              const optionClasses = [
                'select-option',
                value === option.value ? 'selected' : '',
                activeIndex === index ? 'active' : '',
                option.disabled ? 'disabled' : ''
              ].filter(Boolean).join(' ');

              return (
                <div 
                  key={option.value.toString()}
                  className={optionClasses}
                  onClick={() => !option.disabled && handleSelect(option)}
                >
                  {option.label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Присваиваем Option к компоненту Select
Select.Option = Option;

export default Select; 
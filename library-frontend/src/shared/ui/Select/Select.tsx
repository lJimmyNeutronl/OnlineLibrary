import React, { useState, useRef, useMemo } from 'react';
import { useClickOutside } from '../../hooks';
import {
  SelectContainer,
  SelectInput,
  SelectArrow,
  SelectDropdown,
  SelectOption,
  SelectPlaceholder,
  SelectValue
} from './Select.styles';

export interface SelectOption {
  /**
   * Значение опции
   */
  value: string | number;
  /**
   * Текст опции
   */
  label: string;
  /**
   * Флаг, определяющий, отключена ли опция
   */
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * Текущее выбранное значение
   */
  value?: string | number;
  /**
   * Функция-обработчик изменения значения
   */
  onChange?: (value: string | number) => void;
  /**
   * Опции для выбора
   */
  options: SelectOption[];
  /**
   * Плейсхолдер
   */
  placeholder?: string;
  /**
   * Флаг, определяющий, отключен ли компонент
   */
  disabled?: boolean;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
  /**
   * Ширина компонента
   */
  width?: string;
  /**
   * Обязательное поле или нет
   */
  required?: boolean;
  /**
   * Название поля (для доступности)
   */
  name?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Выберите...',
  disabled = false,
  className,
  width = '100%',
  required = false,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useClickOutside(selectRef, () => {
    setIsOpen(false);
  });

  const selectedOption = useMemo(() => {
    return options.find(option => option.value === value);
  }, [options, value]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    
    if (onChange) {
      onChange(option.value);
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  return (
    <SelectContainer 
      ref={selectRef} 
      className={className} 
      style={{ width }}
      disabled={disabled}
    >
      <SelectInput onClick={toggleDropdown}>
        {selectedOption ? (
          <SelectValue>{selectedOption.label}</SelectValue>
        ) : (
          <SelectPlaceholder>{placeholder}</SelectPlaceholder>
        )}
        <SelectArrow $isOpen={isOpen} />
      </SelectInput>
      
      {isOpen && (
        <SelectDropdown>
          {options.map(option => (
            <SelectOption
              key={option.value}
              $selected={option.value === value}
              $disabled={option.disabled}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectDropdown>
      )}
      
      {/* Скрытый инпут для совместимости с формами */}
      <input 
        type="hidden" 
        name={name}
        value={value !== undefined ? value.toString() : ''}
        required={required}
      />
    </SelectContainer>
  );
};

export default Select; 
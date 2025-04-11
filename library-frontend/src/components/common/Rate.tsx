import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

interface RateProps {
  count?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  allowHalf?: boolean;
  disabled?: boolean;
  character?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Rate: React.FC<RateProps> = ({
  count = 5,
  defaultValue = 0,
  value,
  onChange,
  allowHalf = false,
  disabled = false,
  character,
  className = '',
  style = {},
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  
  // Определяем текущее значение (контролируемый или неконтролируемый компонент)
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleClick = (clickedValue: number) => {
    if (disabled) return;
    
    if (onChange) {
      onChange(clickedValue);
    } else {
      setInternalValue(clickedValue);
    }
  };
  
  const handleHover = (hoveredValue: number) => {
    if (disabled) return;
    setHoverValue(hoveredValue);
  };
  
  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(null);
  };
  
  const getStarValue = (index: number) => {
    const displayValue = hoverValue !== null ? hoverValue : currentValue;
    const adjustedIndex = index + 1;
    
    if (allowHalf) {
      if (adjustedIndex - 0.5 === displayValue) return 0.5;
      if (adjustedIndex <= displayValue) return 1;
      return 0;
    }
    
    return adjustedIndex <= displayValue ? 1 : 0;
  };
  
  return (
    <div 
      className={`custom-rate ${className}`} 
      style={{
        display: 'inline-flex',
        ...style
      }}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: count }, (_, index) => {
        const starValue = getStarValue(index);
        
        return (
          <div 
            key={index}
            onClick={() => handleClick(index + 1)}
            onMouseEnter={() => handleHover(index + 1)}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              margin: '0 2px',
              display: 'inline-flex',
              alignItems: 'center',
              color: starValue > 0 ? '#fadb14' : '#e8e8e8',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {character || <FiStar size={20} fill={starValue > 0 ? '#fadb14' : 'none'} />}
          </div>
        );
      })}
    </div>
  );
};

export default Rate; 
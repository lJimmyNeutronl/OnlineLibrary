import React, { ReactNode } from 'react';

interface StatisticProps {
  title?: ReactNode;
  value?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  precision?: number;
  valueStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
}

const Statistic: React.FC<StatisticProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  valueStyle = {},
  className = '',
  style = {},
}) => {
  // Обработка числового значения с заданной точностью
  const formatValue = () => {
    if (typeof value === 'number' && precision !== undefined) {
      return value.toFixed(precision);
    }
    
    return value;
  };
  
  const formattedValue = formatValue();
  
  return (
    <div className={`statistic ${className}`} style={{ ...style }}>
      {title && (
        <div 
          className="statistic-title" 
          style={{ 
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.45)',
            marginBottom: '4px'
          }}
        >
          {title}
        </div>
      )}
      <div 
        className="statistic-content" 
        style={{ 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {prefix && (
          <span 
            className="statistic-prefix" 
            style={{ 
              marginRight: '4px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {prefix}
          </span>
        )}
        <span 
          className="statistic-value" 
          style={{ 
            fontSize: '24px',
            fontWeight: 600,
            color: 'rgba(0, 0, 0, 0.85)',
            ...valueStyle
          }}
        >
          {formattedValue}
        </span>
        {suffix && (
          <span 
            className="statistic-suffix" 
            style={{ 
              marginLeft: '4px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default Statistic;

 
import React, { ReactNode } from 'react';

type ProgressSize = 'default' | 'small';
type ProgressStatus = 'normal' | 'success' | 'exception' | 'active';
type ProgressType = 'line' | 'circle' | 'dashboard';
type StrokeLinecap = 'round' | 'square';

interface ProgressProps {
  type?: ProgressType;
  percent?: number;
  showInfo?: boolean;
  status?: ProgressStatus;
  strokeWidth?: number;
  strokeLinecap?: StrokeLinecap;
  strokeColor?: string;
  trailColor?: string;
  width?: number;
  size?: ProgressSize;
  format?: (percent?: number) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Progress: React.FC<ProgressProps> = ({
  type = 'line',
  percent = 0,
  showInfo = true,
  status = 'normal',
  strokeWidth = 8,
  strokeLinecap = 'round',
  strokeColor = '#3769f5',
  trailColor = '#f5f5f5',
  width = 120,
  size = 'default',
  format,
  className = '',
  style = {},
}) => {
  // Ограничиваем значение процента от 0 до 100
  const validPercent = Math.max(0, Math.min(100, percent));
  
  // Определяем цвет прогресса на основе статуса
  const getStrokeColor = () => {
    if (status === 'success') {
      return '#52c41a';
    }
    if (status === 'exception') {
      return '#ff4d4f';
    }
    return strokeColor;
  };
  
  // Получаем текст для отображения
  const getInfoContent = () => {
    if (format) {
      return format(validPercent);
    }
    
    if (status === 'exception') {
      return 'x';
    }
    
    if (status === 'success') {
      return '✓';
    }
    
    return `${validPercent}%`;
  };
  
  // Линейный прогресс-бар
  const renderLineProgress = () => {
    const lineHeight = size === 'small' ? 6 : strokeWidth;
    const innerColor = getStrokeColor();
    
    return (
      <div 
        className={`progress-line ${className}`} 
        style={{ 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          ...style 
        }}
      >
        <div 
          className="progress-outer" 
          style={{ 
            flex: 1,
            backgroundColor: trailColor,
            borderRadius: strokeLinecap === 'round' ? lineHeight / 2 : 0,
            overflow: 'hidden',
            height: lineHeight
          }}
        >
          <div 
            className={`progress-inner progress-status-${status}`}
            style={{ 
              width: `${validPercent}%`,
              height: '100%',
              backgroundColor: innerColor,
              borderRadius: strokeLinecap === 'round' ? lineHeight / 2 : 0,
              transition: 'all 0.3s',
              animation: status === 'active' ? 'progress-active 2.4s cubic-bezier(0.23, 1, 0.32, 1) infinite' : 'none'
            }}
          />
        </div>
        
        {showInfo && (
          <div 
            className="progress-info" 
            style={{ 
              marginLeft: '8px',
              color: 'rgba(0, 0, 0, 0.85)',
              fontSize: size === 'small' ? '12px' : '14px',
              width: 'auto'
            }}
          >
            {getInfoContent()}
          </div>
        )}
        
        <style>
          {`
            @keyframes progress-active {
              0% {
                opacity: 0.1;
                width: 0;
              }
              20% {
                opacity: 0.5;
                width: 0;
              }
              100% {
                opacity: 0;
                width: 100%;
              }
            }
          `}
        </style>
      </div>
    );
  };
  
  // Пока реализуем только линейный тип
  return renderLineProgress();
};

export default Progress; 
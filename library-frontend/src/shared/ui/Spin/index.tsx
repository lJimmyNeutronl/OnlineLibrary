import React, { ReactNode } from 'react';

interface SpinProps {
  spinning?: boolean;
  size?: 'small' | 'default' | 'large';
  tip?: ReactNode;
  delay?: number;
  indicator?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Создаем основной индикатор загрузки
const DefaultIndicator = () => (
  <div className="spinner">
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          border-radius: 50%;
          border-style: solid;
          border-color: #3769f5 transparent transparent transparent;
          animation: spin 1s linear infinite;
        }
      `}
    </style>
  </div>
);

const Spin: React.FC<SpinProps> = ({
  spinning = true,
  size = 'default',
  tip,
  delay = 0,
  indicator = <DefaultIndicator />,
  children,
  className = '',
  style = {},
}) => {
  const [shouldShow, setShouldShow] = React.useState(delay === 0 ? spinning : false);
  
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (spinning && delay > 0) {
      timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
    } else {
      setShouldShow(spinning);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [spinning, delay]);
  
  // Определение размера спиннера
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return { width: '16px', height: '16px', borderWidth: '2px' };
      case 'large':
        return { width: '32px', height: '32px', borderWidth: '4px' };
      case 'default':
      default:
        return { width: '24px', height: '24px', borderWidth: '3px' };
    }
  };
  
  const spinnerSize = getSpinnerSize();
  
  // Если нет дочерних элементов, показываем только спиннер
  if (!children) {
    if (!shouldShow) {
      return null;
    }
    
    return (
      <div 
        className={`spin-container ${className}`} 
        style={{ 
          display: 'inline-flex', 
          flexDirection: 'column',
          alignItems: 'center',
          ...style 
        }}
      >
        <div 
          className="spin-spinner"
          style={{
            ...spinnerSize,
            margin: '0 auto',
          }}
        >
          {indicator}
        </div>
        {tip && (
          <div className="spin-tip" style={{ marginTop: '8px' }}>
            {tip}
          </div>
        )}
      </div>
    );
  }
  
  // Если есть дочерние элементы, то оборачиваем их и показываем спиннер поверх
  return (
    <div className={`spin-container ${className}`} style={{ position: 'relative', ...style }}>
      {shouldShow && (
        <div 
          className="spin-overlay" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <div 
            className="spin-spinner"
            style={{
              ...spinnerSize,
              margin: '0 auto',
            }}
          >
            {indicator}
          </div>
          {tip && (
            <div className="spin-tip" style={{ marginTop: '8px' }}>
              {tip}
            </div>
          )}
        </div>
      )}
      <div 
        className="spin-content" 
        style={{ 
          opacity: shouldShow ? 0.5 : 1,
          transition: 'opacity 0.3s'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Spin; 
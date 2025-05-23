import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = '#3769f5' 
}) => {
  // Определяем размер спиннера в зависимости от пропса
  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      case 'medium':
      default:
        return 30;
    }
  };

  const spinnerSize = getSize();

  return (
    <div 
      style={{
        display: 'inline-block',
        width: `${spinnerSize}px`,
        height: `${spinnerSize}px`,
        border: `3px solid rgba(${color === '#3769f5' ? '55, 105, 245' : '0, 0, 0'}, 0.1)`,
        borderRadius: '50%',
        borderTop: `3px solid ${color}`,
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Spinner; 
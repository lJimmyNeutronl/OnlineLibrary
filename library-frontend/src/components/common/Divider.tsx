import React, { ReactNode } from 'react';

interface DividerProps {
  children?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ children, style, className = '' }) => {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    color: 'rgba(0, 0, 0, 0.85)',
    fontWeight: 500,
    fontSize: '16px',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    ...style
  };

  if (children) {
    return (
      <div className={`divider-with-text ${className}`} style={baseStyle}>
        <span style={{ 
          display: 'inline-block', 
          padding: '0 24px', 
          fontSize: '18px',
          fontWeight: 500 
        }}>
          {children}
        </span>
      </div>
    );
  }

  return (
    <div className={`divider ${className}`} style={{
      height: '1px',
      margin: '24px 0',
      backgroundColor: '#f0f0f0',
      ...style
    }}/>
  );
};

export default Divider; 
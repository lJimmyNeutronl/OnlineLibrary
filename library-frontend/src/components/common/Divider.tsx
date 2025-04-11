import React from 'react';

interface DividerProps {
  children?: React.ReactNode;
  orientation?: 'left' | 'right' | 'center';
  className?: string;
  style?: React.CSSProperties;
}

const Divider: React.FC<DividerProps> = ({
  children,
  orientation = 'center',
  className = '',
  style
}) => {
  if (children) {
    return (
      <div
        className={`custom-divider ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          ...style
        }}
      >
        <div
          style={{
            flex: orientation === 'left' ? '0 0 auto' : '1',
            height: '1px',
            background: 'var(--border-color)'
          }}
        />
        <div
          style={{
            padding: '0 16px',
            color: 'var(--text-light)',
            fontSize: '14px'
          }}
        >
          {children}
        </div>
        <div
          style={{
            flex: orientation === 'right' ? '0 0 auto' : '1',
            height: '1px',
            background: 'var(--border-color)'
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`custom-divider ${className}`}
      style={{
        height: '1px',
        background: 'var(--border-color)',
        margin: '24px 0',
        ...style
      }}
    />
  );
};

export default Divider; 
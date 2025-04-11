import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  type?: 'title' | 'paragraph';
  className?: string;
  style?: React.CSSProperties;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  level = 1,
  type = 'title',
  className = '',
  style
}) => {
  const getStyles = () => {
    if (type === 'paragraph') {
      return {
        fontSize: '16px',
        lineHeight: 1.5,
        color: 'var(--text-color)',
        marginBottom: '16px'
      };
    }

    switch (level) {
      case 1:
        return {
          fontSize: '32px',
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: '24px'
        };
      case 2:
        return {
          fontSize: '24px',
          fontWeight: 600,
          lineHeight: 1.3,
          marginBottom: '20px'
        };
      case 3:
        return {
          fontSize: '20px',
          fontWeight: 500,
          lineHeight: 1.4,
          marginBottom: '16px'
        };
      case 4:
        return {
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: 1.5,
          marginBottom: '12px'
        };
      case 5:
        return {
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: 1.5,
          marginBottom: '8px'
        };
      default:
        return {};
    }
  };

  if (type === 'paragraph') {
    return (
      <p
        className={`custom-typography ${className}`}
        style={{
          ...getStyles(),
          ...style
        }}
      >
        {children}
      </p>
    );
  }

  switch (level) {
    case 1:
      return (
        <h1
          className={`custom-typography ${className}`}
          style={{
            ...getStyles(),
            ...style
          }}
        >
          {children}
        </h1>
      );
    case 2:
      return (
        <h2
          className={`custom-typography ${className}`}
          style={{
            ...getStyles(),
            ...style
          }}
        >
          {children}
        </h2>
      );
    case 3:
      return (
        <h3
          className={`custom-typography ${className}`}
          style={{
            ...getStyles(),
            ...style
          }}
        >
          {children}
        </h3>
      );
    case 4:
      return (
        <h4
          className={`custom-typography ${className}`}
          style={{
            ...getStyles(),
            ...style
          }}
        >
          {children}
        </h4>
      );
    case 5:
      return (
        <h5
          className={`custom-typography ${className}`}
          style={{
            ...getStyles(),
            ...style
          }}
        >
          {children}
        </h5>
      );
    default:
      return null;
  }
};

export default Typography; 
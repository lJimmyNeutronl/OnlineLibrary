import React, { ReactNode } from 'react';

interface SpaceProps {
  children: ReactNode;
  size?: 'small' | 'middle' | 'large' | number;
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'end' | 'center' | 'baseline';
  className?: string;
  style?: React.CSSProperties;
}

const Space: React.FC<SpaceProps> = ({
  children,
  size = 'small',
  direction = 'horizontal',
  align,
  className = '',
  style = {},
}) => {
  // Преобразование размера в пиксели
  const getSize = (): number => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small': return 8;
      case 'middle': return 16;
      case 'large': return 24;
      default: return 8;
    }
  };

  const spaceSize = getSize();
  
  const spaceStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    alignItems: align || (direction === 'horizontal' ? 'center' : undefined),
    gap: spaceSize,
    ...style
  };

  return (
    <div className={`custom-space ${className}`} style={spaceStyle}>
      {children}
    </div>
  );
};

export default Space; 
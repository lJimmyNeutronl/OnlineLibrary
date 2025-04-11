import React, { ReactNode } from 'react';

// Row props
interface RowProps {
  children: ReactNode;
  gutter?: number | [number, number]; // [horizontal, vertical]
  align?: 'top' | 'middle' | 'bottom';
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  className?: string;
  style?: React.CSSProperties;
}

// Col props
interface ColProps {
  children: ReactNode;
  span?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Row component
export const Row: React.FC<RowProps> = ({
  children,
  gutter = 0,
  align = 'top',
  justify = 'start',
  className = '',
  style
}) => {
  const [horizontalGap, verticalGap] = Array.isArray(gutter) ? gutter : [gutter, 0];
  
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    marginLeft: horizontalGap ? -horizontalGap / 2 : 0,
    marginRight: horizontalGap ? -horizontalGap / 2 : 0,
    ...getAlignStyle(align),
    ...getJustifyStyle(justify),
    ...style
  };

  return (
    <div className={`row ${className}`} style={rowStyle}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          style: {
            ...(child.props.style || {}),
            paddingLeft: horizontalGap ? horizontalGap / 2 : 0,
            paddingRight: horizontalGap ? horizontalGap / 2 : 0,
            ...(verticalGap ? { paddingTop: verticalGap / 2, paddingBottom: verticalGap / 2 } : {})
          }
        });
      })}
    </div>
  );
};

// Col component
export const Col: React.FC<ColProps> = ({
  children,
  span,
  xs,
  sm,
  md,
  lg,
  xl,
  className = '',
  style
}) => {
  // Calculate responsive width
  const getColumnWidth = () => {
    const baseWidth = span ? (span / 24) * 100 : 100;
    return `${baseWidth}%`;
  };

  const colStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    position: 'relative',
    width: getColumnWidth(),
    ...getResponsiveStyles(xs, sm, md, lg, xl),
    ...style
  };

  return (
    <div className={`col ${className}`} style={colStyle}>
      {children}
    </div>
  );
};

// Helper functions
function getAlignStyle(align: string): React.CSSProperties {
  switch (align) {
    case 'middle':
      return { alignItems: 'center' };
    case 'bottom':
      return { alignItems: 'flex-end' };
    case 'top':
    default:
      return { alignItems: 'flex-start' };
  }
}

function getJustifyStyle(justify: string): React.CSSProperties {
  switch (justify) {
    case 'end':
      return { justifyContent: 'flex-end' };
    case 'center':
      return { justifyContent: 'center' };
    case 'space-around':
      return { justifyContent: 'space-around' };
    case 'space-between':
      return { justifyContent: 'space-between' };
    case 'start':
    default:
      return { justifyContent: 'flex-start' };
  }
}

function getResponsiveStyles(xs?: number, sm?: number, md?: number, lg?: number, xl?: number): React.CSSProperties {
  // In a real implementation, this would add media queries via CSS-in-JS
  // For simplicity, we're just returning an empty object
  return {};
} 
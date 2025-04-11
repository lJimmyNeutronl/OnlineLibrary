import React from 'react';

interface RowProps {
  children: React.ReactNode;
  gutter?: number | [number, number];
  className?: string;
  style?: React.CSSProperties;
}

interface ColProps {
  children: React.ReactNode;
  span?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Row: React.FC<RowProps> = ({
  children,
  gutter = 0,
  className = '',
  style
}) => {
  const [horizontalGutter, verticalGutter] = Array.isArray(gutter) 
    ? gutter 
    : [gutter, gutter];

  return (
    <div
      className={`custom-row ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        marginLeft: `-${horizontalGutter / 2}px`,
        marginRight: `-${horizontalGutter / 2}px`,
        marginTop: `-${verticalGutter / 2}px`,
        marginBottom: `-${verticalGutter / 2}px`,
        ...style
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<{ style?: React.CSSProperties }>(child)) {
          return React.cloneElement(child, {
            style: {
              ...child.props.style,
              paddingLeft: `${horizontalGutter / 2}px`,
              paddingRight: `${horizontalGutter / 2}px`,
              paddingTop: `${verticalGutter / 2}px`,
              paddingBottom: `${verticalGutter / 2}px`
            }
          });
        }
        return child;
      })}
    </div>
  );
};

export const Col: React.FC<ColProps> = ({
  children,
  span = 24,
  xs,
  sm,
  md,
  lg,
  xl,
  className = '',
  style
}) => {
  const getWidth = (size?: number) => {
    if (!size) return undefined;
    return `${(size / 24) * 100}%`;
  };

  return (
    <div
      className={`custom-col ${className}`}
      style={{
        width: getWidth(span),
        flex: span === 0 ? 'none' : undefined,
        ...style,
        '@media (max-width: 576px)': {
          width: getWidth(xs)
        },
        '@media (min-width: 576px)': {
          width: getWidth(sm)
        },
        '@media (min-width: 768px)': {
          width: getWidth(md)
        },
        '@media (min-width: 992px)': {
          width: getWidth(lg)
        },
        '@media (min-width: 1200px)': {
          width: getWidth(xl)
        }
      }}
    >
      {children}
    </div>
  );
}; 
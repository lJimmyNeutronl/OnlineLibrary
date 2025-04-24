import React, { ReactNode } from 'react';

type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch';
type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between';

interface RowProps {
  align?: RowAlign;
  justify?: RowJustify;
  gutter?: number | [number, number];
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

// Определяем тип для props дочерних элементов Col
interface ColProps {
  style?: React.CSSProperties;
  [key: string]: any;
}

const Row: React.FC<RowProps> = ({
  align = 'top',
  justify = 'start',
  gutter = 0,
  className = '',
  style = {},
  children,
}) => {
  // Обработка gutters для вертикального и горизонтального отступа
  const [horizontalGutter, verticalGutter] = React.useMemo(() => {
    if (Array.isArray(gutter)) {
      return gutter;
    }
    return [gutter, 0];
  }, [gutter]);
  
  // Преобразование значений align в CSS значения
  const getAlignItems = () => {
    switch (align) {
      case 'top':
        return 'flex-start';
      case 'middle':
        return 'center';
      case 'bottom':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  };
  
  // Преобразование значений justify в CSS значения
  const getJustifyContent = () => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      case 'center':
        return 'center';
      case 'space-around':
        return 'space-around';
      case 'space-between':
        return 'space-between';
      default:
        return 'flex-start';
    }
  };
  
  // Применяем стили к строке
  const rowStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: getAlignItems(),
    justifyContent: getJustifyContent(),
    marginLeft: horizontalGutter ? -horizontalGutter / 2 : 0,
    marginRight: horizontalGutter ? -horizontalGutter / 2 : 0,
    ...style,
  };
  
  // Применяем gutters к дочерним элементам
  const childrenWithGutter = React.Children.map(children, child => {
    if (!React.isValidElement<ColProps>(child)) {
      return child;
    }
    
    return React.cloneElement(child, {
      style: {
        ...(child.props.style || {}),
        paddingLeft: horizontalGutter ? horizontalGutter / 2 : 0,
        paddingRight: horizontalGutter ? horizontalGutter / 2 : 0,
        marginBottom: verticalGutter,
      },
    });
  });
  
  return (
    <div className={`row ${className}`} style={rowStyles}>
      {childrenWithGutter}
    </div>
  );
};

export default Row; 
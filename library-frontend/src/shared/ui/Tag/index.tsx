import React, { ReactNode } from 'react';

const colors = {
  blue: { background: '#e6f7ff', borderColor: '#91d5ff', textColor: '#1890ff' },
  red: { background: '#fff1f0', borderColor: '#ffa39e', textColor: '#f5222d' },
  green: { background: '#f6ffed', borderColor: '#b7eb8f', textColor: '#52c41a' },
  yellow: { background: '#fffbe6', borderColor: '#ffe58f', textColor: '#faad14' },
  purple: { background: '#f9f0ff', borderColor: '#d3adf7', textColor: '#722ed1' },
  cyan: { background: '#e6fffb', borderColor: '#87e8de', textColor: '#13c2c2' },
  gray: { background: '#fafafa', borderColor: '#d9d9d9', textColor: 'rgba(0, 0, 0, 0.85)' },
  success: { background: '#f6ffed', borderColor: '#b7eb8f', textColor: '#52c41a' },
  warning: { background: '#fffbe6', borderColor: '#ffe58f', textColor: '#faad14' },
  error: { background: '#fff1f0', borderColor: '#ffa39e', textColor: '#f5222d' },
  default: { background: '#fafafa', borderColor: '#d9d9d9', textColor: 'rgba(0, 0, 0, 0.85)' }
};

type ColorType = keyof typeof colors | string;

interface TagProps {
  children?: ReactNode;
  color?: ColorType;
  className?: string;
  style?: React.CSSProperties;
  closable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Tag: React.FC<TagProps> = ({
  children,
  color = 'default',
  className = '',
  style = {},
  closable = false,
  onClose,
}) => {
  const getTagStyles = () => {
    if (color in colors) {
      const colorObj = colors[color as keyof typeof colors];
      return {
        backgroundColor: colorObj.background,
        borderColor: colorObj.borderColor,
        color: colorObj.textColor,
      };
    } else if (color.startsWith('#')) {
      // Для пользовательских цветов
      return {
        backgroundColor: color + '22', // Добавляем прозрачность для фона
        borderColor: color, 
        color: color,
      };
    }
    
    // Для всех остальных случаев используем стандартные стили
    return {
      backgroundColor: colors.default.background,
      borderColor: colors.default.borderColor,
      color: colors.default.textColor,
    };
  };
  
  const tagStyles = getTagStyles();
  
  const baseStyles: React.CSSProperties = {
    display: 'inline-block',
    padding: '0 7px',
    fontSize: '12px',
    lineHeight: '20px',
    borderRadius: '2px',
    border: '1px solid',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    ...tagStyles,
    ...style,
  };
  
  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onClose?.(e);
  };
  
  return (
    <span className={`tag ${className}`} style={baseStyles}>
      {children}
      {closable && (
        <span 
          className="tag-close-icon" 
          onClick={handleClose} 
          style={{ 
            marginLeft: '4px', 
            cursor: 'pointer',
            lineHeight: '1',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ×
        </span>
      )}
    </span>
  );
};

export default Tag; 
import React, { ReactNode, ReactElement } from 'react';
import BreadcrumbItem, { BreadcrumbItemProps } from './BreadcrumbItem';
import './breadcrumb.css';

export interface BreadcrumbProps {
  children?: ReactNode;
  separator?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface BreadcrumbComponent extends React.FC<BreadcrumbProps> {
  Item: typeof BreadcrumbItem;
}

const Breadcrumb: BreadcrumbComponent = ({
  children,
  separator = '/',
  className = '',
  style = {},
}) => {
  // Функция для добавления сепараторов между элементами
  const items = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return null;
    }
    
    const isLastItem = index === React.Children.count(children) - 1;
    
    return (
      <React.Fragment key={index}>
        {React.cloneElement(child as ReactElement<any>, {
          style: { 
            color: isLastItem ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.45)',
            ...((child as ReactElement<any>).props.style || {})
          },
        })}
        {!isLastItem && (
          <span 
            className="breadcrumb-separator" 
            style={{ 
              margin: '0 8px', 
              color: 'rgba(0, 0, 0, 0.45)' 
            }}
          >
            {separator}
          </span>
        )}
      </React.Fragment>
    );
  });
  
  return (
    <nav className={`breadcrumb ${className}`} style={style}>
      {items}
    </nav>
  );
};

// Присваиваем статический метод
Breadcrumb.Item = BreadcrumbItem;

export default Breadcrumb; 
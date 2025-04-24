import React, { ReactNode } from 'react';

interface BreadcrumbItemProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ 
  children, 
  className = '', 
  style = {}
}) => {
  return (
    <span className={`breadcrumb-item ${className}`} style={style}>
      {children}
    </span>
  );
};

interface BreadcrumbProps {
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
    if (!React.isValidElement<BreadcrumbItemProps>(child)) {
      return null;
    }
    
    const isLastItem = index === React.Children.count(children) - 1;
    
    return (
      <React.Fragment key={index}>
        {React.cloneElement(child, {
          className: child.props.className,
          style: { 
            color: isLastItem ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.45)',
            ...(child.props.style || {})
          },
          children: child.props.children
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

Breadcrumb.Item = BreadcrumbItem;

export default Breadcrumb; 
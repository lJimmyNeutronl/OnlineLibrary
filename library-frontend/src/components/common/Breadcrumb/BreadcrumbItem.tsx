import React from 'react';
import './breadcrumb.css';

export interface BreadcrumbItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  children,
  className = '',
  style = {},
  href,
  onClick,
}) => {
  const isLink = href || onClick;
  
  const baseStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isLink ? '#3769f5' : 'rgba(0, 0, 0, 0.85)',
    ...style,
  };
  
  const linkStyle: React.CSSProperties = {
    ...baseStyle,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.3s',
  };
  
  return isLink ? (
    <a 
      className={`breadcrumb-item ${className}`}
      style={linkStyle}
      href={href}
      onClick={onClick}
    >
      {children}
    </a>
  ) : (
    <span
      className={`breadcrumb-item ${className}`}
      style={baseStyle}
    >
      {children}
    </span>
  );
};

export default BreadcrumbItem; 
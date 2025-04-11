import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  cover?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  cover,
  title,
  description,
  className = '',
  style,
  hoverable = false
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -5 } : {}}
      className={`custom-card ${className}`}
      style={{
        background: 'white',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {cover && (
        <div className="card-cover" style={{ position: 'relative' }}>
          {cover}
        </div>
      )}
      <div className="card-content" style={{ padding: '16px' }}>
        {title && (
          <div className="card-title" style={{ 
            fontSize: '16px',
            fontWeight: 500,
            marginBottom: '8px'
          }}>
            {title}
          </div>
        )}
        {description && (
          <div className="card-description" style={{ 
            color: 'var(--text-light)',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {description}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
};

export default Card; 
import React, { ReactNode } from 'react';

interface CardMetaProps {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CardMeta: React.FC<CardMetaProps> = ({
  avatar,
  title,
  description,
  className = '',
  style = {}
}) => {
  return (
    <div className={`card-meta ${className}`} style={{ display: 'flex', ...style }}>
      {avatar && (
        <div className="card-meta-avatar" style={{ marginRight: '16px' }}>
          {avatar}
        </div>
      )}
      <div className="card-meta-detail">
        {title && (
          <div className="card-meta-title" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: description ? '4px' : 0, 
            color: 'rgba(0, 0, 0, 0.85)'
          }}>
            {title}
          </div>
        )}
        {description && (
          <div className="card-meta-description" style={{ 
            fontSize: '15px', 
            color: 'rgba(0, 0, 0, 0.65)'
          }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

interface CardProps {
  children?: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
  cover?: ReactNode;
  hoverable?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

// Расширяем тип компонента, чтобы включить Meta как дочерний компонент
const Card: React.FC<CardProps> & {
  Meta: React.FC<CardMetaProps>;
} = ({
  children,
  title,
  description,
  cover,
  hoverable = false,
  style,
  className = '',
  onClick
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    maxWidth: '260px',
    margin: '0 auto',
    border: '1px solid #eaeaea',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    ...(hoverable && {
      cursor: 'pointer',
      ':hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateY(-5px)'
      }
    }),
    ...style
  };

  return (
    <div 
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      style={cardStyle}
      onClick={onClick}
    >
      {cover && (
        <div className="card-cover" style={{ 
          height: '250px'
        }}>
          {cover}
        </div>
      )}
      
      <div className="card-content" style={{ 
        padding: '14px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {title && (
          <div className="card-title" style={{ 
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: description ? '8px' : '0',
            color: 'rgba(0, 0, 0, 0.85)'
          }}>
            {title}
          </div>
        )}
        
        {description && (
          <div className="card-description" style={{ 
            fontSize: '15px',
            color: 'rgba(0, 0, 0, 0.65)',
            marginBottom: '16px'
          }}>
            {description}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

// Присваиваем Meta к Card
Card.Meta = CardMeta;

export default Card; 
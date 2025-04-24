import React, { ReactNode } from 'react';

interface AvatarProps {
  size?: number | 'large' | 'default' | 'small';
  icon?: ReactNode;
  src?: string;
  shape?: 'circle' | 'square';
  style?: React.CSSProperties;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'default',
  icon,
  src,
  shape = 'circle',
  style = {},
  className = '',
}) => {
  const getSize = () => {
    if (typeof size === 'number') {
      return size;
    }
    
    switch (size) {
      case 'large':
        return 40;
      case 'small':
        return 24;
      case 'default':
      default:
        return 32;
    }
  };

  const avatarSize = getSize();
  
  const avatarStyle: React.CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: shape === 'circle' ? '50%' : '4px',
    overflow: 'hidden',
    color: '#fff',
    fontSize: Math.max(avatarSize / 2, 14),
    ...style,
  };

  return (
    <div className={`avatar ${className}`} style={avatarStyle}>
      {src ? (
        <img 
          src={src} 
          alt="avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        icon || null
      )}
    </div>
  );
};

export default Avatar; 
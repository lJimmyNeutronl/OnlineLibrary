import React, { ReactNode } from 'react';

// SVG изображение для стандартного отображения
const DEFAULT_EMPTY_IMG = (
  <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
      <ellipse fill="#F5F5F5" cx="32" cy="33" rx="32" ry="7" />
      <g fillRule="nonzero" stroke="#D9D9D9">
        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#FAFAFA" />
      </g>
    </g>
  </svg>
);

// SVG изображение для упрощенного отображения
const SIMPLE_EMPTY_IMG = (
  <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
      <ellipse fill="#F5F5F5" cx="32" cy="33" rx="32" ry="7" />
      <path
        d="M53.856 13.12c-.682-.31-1.65-.51-2.78-.51-.682 0-1.65.2-2.782.51-1.15.31-2.28.93-3.434 1.86-.58.45-2.282 1.83-2.282 1.83-1.15.93-2.732 1.55-4.748 1.55-2.017 0-3.6-.62-4.75-1.55 0 0-1.702-1.38-2.28-1.83-1.135-.93-2.267-1.55-3.415-1.86-1.13-.31-2.1-.51-2.784-.51-1.13 0-2.1.2-2.783.51-1.148.31-2.28.93-3.415 1.86-.58.45-2.28 1.83-2.28 1.83-1.15.93-2.733 1.55-4.75 1.55H9v14.936c0 2.22 1.31 4.02 2.936 4.02h40.127c1.617 0 2.937-1.8 2.937-4.02V17.5h-1.16c-2.016 0-3.6-.62-4.75-1.55 0 0-1.7-1.38-2.28-1.83-1.134-.93-2.266-1.55-3.414-1.86"
        fill="#FAFAFA"
      />
    </g>
  </svg>
);

interface EmptyProps {
  description?: ReactNode;
  image?: ReactNode;
  imageStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

interface EmptyComponent extends React.FC<EmptyProps> {
  PRESENTED_IMAGE_DEFAULT: ReactNode;
  PRESENTED_IMAGE_SIMPLE: ReactNode;
}

const Empty: EmptyComponent = ({
  description = 'Нет данных',
  image = DEFAULT_EMPTY_IMG,
  imageStyle = {},
  className = '',
  style = {},
  children,
}) => {
  return (
    <div className={`empty ${className}`} style={{ textAlign: 'center', padding: '40px 0', ...style }}>
      <div className="empty-image" style={{ marginBottom: '8px', ...imageStyle }}>
        {image}
      </div>
      {description && (
        <div 
          className="empty-description" 
          style={{ 
            color: 'rgba(0, 0, 0, 0.45)',
            fontSize: '14px',
            lineHeight: 1.5,
            marginBottom: children ? '16px' : 0
          }}
        >
          {description}
        </div>
      )}
      {children && (
        <div className="empty-footer">
          {children}
        </div>
      )}
    </div>
  );
};

Empty.PRESENTED_IMAGE_DEFAULT = DEFAULT_EMPTY_IMG;
Empty.PRESENTED_IMAGE_SIMPLE = SIMPLE_EMPTY_IMG;

export default Empty; 
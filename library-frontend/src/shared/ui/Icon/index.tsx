import React from 'react';

interface IconProps {
  type: 'search' | 'book' | 'arrow-right' | 'arrow-right-fancy';
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ type, className = '', style }) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
            width="100%"
            height="100%"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      case 'book':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        );
      case 'arrow-right':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        );
      case 'arrow-right-fancy':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
          >
            <path d="M13 5l7 7-7 7" />
            <path d="M5 12h15" />
          </svg>
        );
      default:
        return null;
    }
  };

  return getIcon();
};

export default Icon; 
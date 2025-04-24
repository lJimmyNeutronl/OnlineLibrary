import React, { ReactNode } from 'react';

// Интерфейс для Title
interface TitleProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  style?: React.CSSProperties;
}

// Интерфейс для Paragraph
interface ParagraphProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Интерфейс для Text
interface TextProps {
  children: ReactNode;
  type?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
  strong?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface TypographyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Компонент Title
const Title: React.FC<TitleProps> = ({
  children,
  level = 1,
  className = '',
  style = {}
}) => {
  const fontSize = {
    1: '28px',
    2: '24px',
    3: '20px',
    4: '16px',
    5: '14px'
  }[level];

  const fontWeight = level <= 2 ? 'bold' : '500';
  const commonStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    margin: '16px 0',
    color: 'rgba(0, 0, 0, 0.85)',
    lineHeight: '1.35',
    ...style
  };
  
  switch(level) {
    case 1:
      return <h1 className={`typography-title typography-h1 ${className}`} style={commonStyle}>{children}</h1>;
    case 2:
      return <h2 className={`typography-title typography-h2 ${className}`} style={commonStyle}>{children}</h2>;
    case 3:
      return <h3 className={`typography-title typography-h3 ${className}`} style={commonStyle}>{children}</h3>;
    case 4:
      return <h4 className={`typography-title typography-h4 ${className}`} style={commonStyle}>{children}</h4>;
    case 5:
      return <h5 className={`typography-title typography-h5 ${className}`} style={commonStyle}>{children}</h5>;
    default:
      return <h1 className={`typography-title typography-h1 ${className}`} style={commonStyle}>{children}</h1>;
  }
};

// Компонент Paragraph
const Paragraph: React.FC<ParagraphProps> = ({
  children,
  className = '',
  style = {}
}) => {
  return (
    <p 
      className={`typography-paragraph ${className}`}
      style={{
        margin: '16px 0',
        fontSize: '14px',
        lineHeight: '1.5',
        color: 'rgba(0, 0, 0, 0.65)',
        ...style
      }}
    >
      {children}
    </p>
  );
};

// Компонент Text
const Text: React.FC<TextProps> = ({
  children,
  type = 'default',
  strong = false,
  className = '',
  style = {}
}) => {
  const getColor = () => {
    switch (type) {
      case 'secondary':
        return 'rgba(0, 0, 0, 0.45)';
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'danger':
        return '#f5222d';
      default:
        return 'rgba(0, 0, 0, 0.65)';
    }
  };

  return (
    <span 
      className={`typography-text typography-text-${type} ${className}`}
      style={{
        fontSize: '14px',
        lineHeight: '1.5',
        color: getColor(),
        fontWeight: strong ? 'bold' : 'normal',
        ...style
      }}
    >
      {children}
    </span>
  );
};

// Основной компонент Typography
const Typography: React.FC<TypographyProps> & {
  Title: React.FC<TitleProps>;
  Paragraph: React.FC<ParagraphProps>;
  Text: React.FC<TextProps>;
} = ({
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className={`typography ${className}`} style={style}>
      {children}
    </div>
  );
};

// Присваиваем вложенные компоненты
Typography.Title = Title;
Typography.Paragraph = Paragraph;
Typography.Text = Text;

export default Typography; 
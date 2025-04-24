import React, { ReactNode } from 'react';

type ColSpanType = number | string;

interface ColSize {
  span?: ColSpanType;
  offset?: ColSpanType;
  order?: ColSpanType;
  pull?: ColSpanType;
  push?: ColSpanType;
}

interface ColProps {
  span?: ColSpanType;
  offset?: ColSpanType;
  order?: ColSpanType;
  pull?: ColSpanType;
  push?: ColSpanType;
  xs?: ColSpanType | ColSize;
  sm?: ColSpanType | ColSize;
  md?: ColSpanType | ColSize;
  lg?: ColSpanType | ColSize;
  xl?: ColSpanType | ColSize;
  xxl?: ColSpanType | ColSize;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

// Брейкпоинты для медиа-запросов
const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

const Col: React.FC<ColProps> = ({
  span,
  offset,
  order,
  pull,
  push,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  className = '',
  style = {},
  children,
}) => {
  // Функция для получения CSS свойств на основе переданных props
  const getBaseStyles = () => {
    const styles: React.CSSProperties = { ...style };
    
    if (span !== undefined) {
      const spanValue = typeof span === 'string' ? parseInt(span, 10) : span;
      styles.flexBasis = `${(spanValue / 24) * 100}%`;
      styles.maxWidth = `${(spanValue / 24) * 100}%`;
    }
    
    if (offset !== undefined) {
      const offsetValue = typeof offset === 'string' ? parseInt(offset, 10) : offset;
      styles.marginLeft = `${(offsetValue / 24) * 100}%`;
    }
    
    if (order !== undefined) {
      styles.order = Number(order);
    }
    
    if (pull !== undefined) {
      const pullValue = typeof pull === 'string' ? parseInt(pull, 10) : pull;
      styles.right = `${(pullValue / 24) * 100}%`;
      styles.position = 'relative';
    }
    
    if (push !== undefined) {
      const pushValue = typeof push === 'string' ? parseInt(push, 10) : push;
      styles.left = `${(pushValue / 24) * 100}%`;
      styles.position = 'relative';
    }
    
    return styles;
  };
  
  // Создаем стили для всех брейкпоинтов
  const getMediaStyles = () => {
    const mediaQueries: string[] = [];
    
    // Обработка xs
    if (xs) {
      const xsStyles = typeof xs === 'object' ? xs : { span: xs };
      const cssRules = [];
      
      if (xsStyles.span !== undefined) {
        const spanValue = Number(xsStyles.span);
        cssRules.push(`flex-basis: ${(spanValue / 24) * 100}%;`);
        cssRules.push(`max-width: ${(spanValue / 24) * 100}%;`);
      }
      
      if (xsStyles.offset !== undefined) {
        cssRules.push(`margin-left: ${(Number(xsStyles.offset) / 24) * 100}%;`);
      }
      
      if (xsStyles.order !== undefined) {
        cssRules.push(`order: ${Number(xsStyles.order)};`);
      }
      
      if (cssRules.length > 0) {
        mediaQueries.push(`
          @media (max-width: ${breakpoints.sm - 1}px) {
            .col-xs-${typeof xs === 'object' ? xsStyles.span : xs} {
              ${cssRules.join('\n')}
            }
          }
        `);
      }
    }
    
    // Обработка sm
    if (sm) {
      const smStyles = typeof sm === 'object' ? sm : { span: sm };
      const cssRules = [];
      
      if (smStyles.span !== undefined) {
        const spanValue = Number(smStyles.span);
        cssRules.push(`flex-basis: ${(spanValue / 24) * 100}%;`);
        cssRules.push(`max-width: ${(spanValue / 24) * 100}%;`);
      }
      
      if (smStyles.offset !== undefined) {
        cssRules.push(`margin-left: ${(Number(smStyles.offset) / 24) * 100}%;`);
      }
      
      if (smStyles.order !== undefined) {
        cssRules.push(`order: ${Number(smStyles.order)};`);
      }
      
      if (cssRules.length > 0) {
        mediaQueries.push(`
          @media (min-width: ${breakpoints.sm}px) {
            .col-sm-${typeof sm === 'object' ? smStyles.span : sm} {
              ${cssRules.join('\n')}
            }
          }
        `);
      }
    }
    
    // Обработка md
    if (md) {
      const mdStyles = typeof md === 'object' ? md : { span: md };
      const cssRules = [];
      
      if (mdStyles.span !== undefined) {
        const spanValue = Number(mdStyles.span);
        cssRules.push(`flex-basis: ${(spanValue / 24) * 100}%;`);
        cssRules.push(`max-width: ${(spanValue / 24) * 100}%;`);
      }
      
      if (mdStyles.offset !== undefined) {
        cssRules.push(`margin-left: ${(Number(mdStyles.offset) / 24) * 100}%;`);
      }
      
      if (mdStyles.order !== undefined) {
        cssRules.push(`order: ${Number(mdStyles.order)};`);
      }
      
      if (cssRules.length > 0) {
        mediaQueries.push(`
          @media (min-width: ${breakpoints.md}px) {
            .col-md-${typeof md === 'object' ? mdStyles.span : md} {
              ${cssRules.join('\n')}
            }
          }
        `);
      }
    }
    
    // Аналогично для lg, xl, xxl...
    
    return mediaQueries.join('');
  };
  
  // Формируем классы для CSS на основе размеров
  const getColClass = () => {
    const classes = ['col'];
    
    if (className) {
      classes.push(className);
    }
    
    if (xs) {
      classes.push(`col-xs-${typeof xs === 'object' ? xs.span : xs}`);
    }
    
    if (sm) {
      classes.push(`col-sm-${typeof sm === 'object' ? sm.span : sm}`);
    }
    
    if (md) {
      classes.push(`col-md-${typeof md === 'object' ? md.span : md}`);
    }
    
    if (lg) {
      classes.push(`col-lg-${typeof lg === 'object' ? lg.span : lg}`);
    }
    
    if (xl) {
      classes.push(`col-xl-${typeof xl === 'object' ? xl.span : xl}`);
    }
    
    if (xxl) {
      classes.push(`col-xxl-${typeof xxl === 'object' ? xxl.span : xxl}`);
    }
    
    return classes.join(' ');
  };
  
  const baseStyles = getBaseStyles();
  const mediaStyles = getMediaStyles();
  const colClass = getColClass();
  
  return (
    <>
      {mediaStyles && <style>{mediaStyles}</style>}
      <div className={colClass} style={baseStyles}>
        {children}
      </div>
    </>
  );
};

export default Col; 
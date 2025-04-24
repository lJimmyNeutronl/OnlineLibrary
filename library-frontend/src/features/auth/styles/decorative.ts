import { CSSProperties } from 'react';

// Стили контейнера для страницы формы
export const formPageContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f6f8fa',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden'
};

// Позиционирование декоративных элементов
export const topRightDecorativeStyle: CSSProperties = {
  position: 'absolute',
  top: '-50px',
  right: '-50px',
  opacity: 0.05,
  zIndex: 0
};

export const bottomLeftDecorativeStyle: CSSProperties = {
  position: 'absolute',
  bottom: '-20px',
  left: '-20px',
  opacity: 0.05,
  zIndex: 0
};

export const bottomRightDecorativeStyle: CSSProperties = {
  position: 'absolute',
  bottom: '50px',
  right: '50px',
  opacity: 0.05,
  zIndex: 0
};

// Цвета для декоративных элементов
export const decorativeColors = {
  primary: '#3769f5',
  secondary: '#8e54e9',
  accent: '#5b21b6'
};

// Анимации декоративных элементов
export const floatAnimation = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [0, -15, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

export const rotateAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 60,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const pulseAnimation = {
  initial: { scale: 1, opacity: 0.05 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.05, 0.08, 0.05],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
}; 
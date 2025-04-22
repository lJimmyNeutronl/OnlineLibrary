import { CSSProperties } from 'react';

// Базовые стили для декоративных элементов
export const baseDecorativeElementStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

// Стиль для верхнего правого декоративного элемента
export const topRightDecorativeStyle: CSSProperties = {
  ...baseDecorativeElementStyle,
  width: '300px',
  height: '300px',
  top: '-100px',
  right: '-50px',
  opacity: 0.08,
  transform: 'rotate(15deg)',
};

// Стиль для нижнего левого декоративного элемента
export const bottomLeftDecorativeStyle: CSSProperties = {
  ...baseDecorativeElementStyle,
  width: '250px',
  height: '250px',
  bottom: '-80px',
  left: '-80px',
  opacity: 0.06,
};

// Стиль для нижнего правого декоративного элемента
export const bottomRightDecorativeStyle: CSSProperties = {
  ...baseDecorativeElementStyle,
  width: '180px',
  height: '180px',
  bottom: '20%',
  right: '15%',
};

// Стиль для центрального левого декоративного элемента
export const centerLeftDecorativeStyle: CSSProperties = {
  ...baseDecorativeElementStyle,
  width: '200px',
  height: '200px',
  top: '40%',
  left: '5%',
  opacity: 0.07,
};

// Цвета для декоративных элементов
export const decorativeColors = {
  primary: '#3769f5',
  secondary: '#8e54e9',
  accent: '#6A98F0'
}; 
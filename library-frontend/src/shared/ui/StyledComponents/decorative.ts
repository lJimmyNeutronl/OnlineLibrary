import styled from 'styled-components';

// Градиентный фон
export const GradientBackground = styled.div`
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  width: 100%;
  min-height: 100vh;
`;

// Контейнер для плавающих элементов
export const FloatingElementsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

// Плавающий элемент (шар, пузырь и т.д.)
export const FloatingElement = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  z-index: -1;
`;

// Декоративный градиентный текст
export const GradientText = styled.span`
  background: linear-gradient(90deg, #3769f5 0%, #8e54e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  display: inline-block;
`;

// Стилизованный контейнер с тенью
export const ShadowBox = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`; 
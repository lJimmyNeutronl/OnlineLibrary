import styled from 'styled-components';
import { Button, Typography } from '../../shared/ui';

export const HomeContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: calc(100vh - 64px); /* Учитываем высоту хедера */
  overflow: hidden;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

export const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
`;

export const BackgroundFeather = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  opacity: 0.07;
  z-index: 0;
  
  &.feather-1 {
    top: -150px;
    right: -100px;
    transform: rotate(15deg);
  }
  
  &.feather-2 {
    bottom: -100px;
    left: -100px;
    transform: rotate(-25deg);
  }
`;

export const HeroSection = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0 40px;
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
`;

export const SearchContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto 60px;
  position: relative;
  z-index: 2;
`;

export const SearchInputWrapper = styled.div`
  width: 100%;
  height: 60px;
  background: #fff;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(55, 105, 245, 0.1);
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:focus-within {
    box-shadow: 0 10px 25px rgba(55, 105, 245, 0.2);
  }
  
  /* Применяем стили для инпута внутри wrapper */
  input, .search-input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    padding: 0 100px 0 55px; /* Отступы с обеих сторон для иконок */
    background: transparent;
  }
  
  /* Стили для иконки поиска */
  .search-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    
    svg {
      font-size: 24px;
      color: #3769f5;
    }
  }
  
  /* Стили для кнопки очистки */
  .clear-button {
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    cursor: pointer;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    transition: color 0.2s ease;
  }
`;

export const SearchButton = styled.button`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3769f5 0%, #8e54e9 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  
  &:hover {
    transform: translateY(-50%) scale(1.05);
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 40px 0 30px;
  text-align: center;
  width: 100%;
`;

export const FeaturedBooksSection = styled.div`
  margin-bottom: 40px;
  padding: 0 20px;
`;

export const SectionTitle = styled(Typography.Title)`
  margin: 0 20px !important;
  background: linear-gradient(135deg, #3769f5 0%, #8e54e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 24px !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px;
`;

export const SectionDivider = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3));
`;

interface CategoryButtonProps {
  active?: boolean;
}

export const CategoryButton = styled(Button)<CategoryButtonProps>`
  border-radius: 20px;
  padding: 6px 20px;
  background: ${props => props.active 
    ? 'rgba(142, 84, 233, 0.15)' 
    : 'rgba(55, 105, 245, 0.08)'};
  border: ${props => props.active 
    ? '1px solid rgba(142, 84, 233, 0.3)' 
    : '1px solid rgba(55, 105, 245, 0.2)'};
  color: ${props => props.active ? '#8e54e9' : '#3769f5'};
  transition: all 0.3s ease;
  height: 42px;
  font-weight: 500;
  display: flex;
  align-items: center;
  box-shadow: ${props => props.active 
    ? '0 2px 8px rgba(142, 84, 233, 0.15)' 
    : '0 2px 8px rgba(55, 105, 245, 0.05)'};
  
  &:hover {
    background: ${props => props.active 
      ? 'rgba(142, 84, 233, 0.2)' 
      : 'rgba(55, 105, 245, 0.12)'};
    border-color: ${props => props.active 
      ? 'rgba(142, 84, 233, 0.35)'
      : 'rgba(55, 105, 245, 0.35)'};
  }
`; 
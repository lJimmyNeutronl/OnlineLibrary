import styled from 'styled-components';
import { Typography, Button } from '../../shared/ui';

export const HomeContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #fafbff;
`;

export const CategoryButton = styled(Button)<{ active?: boolean }>`
  border-radius: 30px;
  padding: 8px 16px;
  color: ${props => props.active ? '#fff' : '#444'};
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)' 
    : '#fff'};
  border: 1px solid ${props => props.active 
    ? 'transparent' 
    : 'rgba(55, 105, 245, 0.2)'};
  font-weight: 500;
  box-shadow: ${props => props.active 
    ? '0 4px 12px rgba(55, 105, 245, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(55, 105, 245, 0.25);
    color: ${props => props.active ? '#fff' : '#3769f5'};
    border-color: ${props => props.active ? 'transparent' : 'rgba(55, 105, 245, 0.4)'};
  }
`;

// Оставляем неиспользуемые стили для обратной совместимости, или они могут быть удалены позже
export const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

export const BackgroundFeather = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HeroSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0 40px;
  position: relative;
  z-index: 1;
`;

export const SearchContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto 60px;
  display: flex;
  justify-content: center;
`;

export const SearchInputWrapper = styled.div`
  width: 100%;
  position: relative;
  background: white;
  border-radius: 50px;
  padding: 0;
  box-shadow: 0 10px 25px rgba(55, 105, 245, 0.1);
  transition: all 0.3s ease;
  height: 60px;
  overflow: hidden;
  
  &.focused {
    box-shadow: 0 10px 25px rgba(55, 105, 245, 0.2);
  }
  
  .search-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  
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
    
    &:hover {
      color: #3769f5;
    }
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
    box-shadow: 0 5px 15px rgba(55, 105, 245, 0.3);
  }
`;

export const FeaturedBooksSection = styled.div`
  margin-bottom: 40px;
`;

export const SectionTitle = styled(Typography.Title)`
  margin: 0 20px;
  background: linear-gradient(135deg, #3769f5 0%, #8e54e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  letter-spacing: 0.5px;
`;

export const SectionDivider = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3));
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 40px 0 30px;
  text-align: center;
`; 
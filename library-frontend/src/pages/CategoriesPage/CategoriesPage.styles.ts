import styled from 'styled-components';

export const CategoriesPageContainer = styled.div`
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
  width: 100%;
  padding: 40px 0;
`;

export const CategoriesPageContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

export const CategoriesSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

export const CategoryCard = styled.div`
  background: rgba(55, 105, 245, 0.05);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  border: 1px solid rgba(55, 105, 245, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(55, 105, 245, 0.3);
    box-shadow: 0 4px 8px rgba(55, 105, 245, 0.1);
  }
`;

export const CategoryIcon = styled.div`
  background: #3769f5;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

export const CategoryInfo = styled.div`
  flex: 1;
`;

export const CategoryTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

export const CategoryCount = styled.p`
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #666;
`; 
import styled from 'styled-components';

export const CategoryBooksContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 90vh;
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

export const BookImage = styled.div`
  height: 300px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

export const RatingContainer = styled.div`
  margin-top: 8px;
  color: #faad14;
  font-size: 16px;
`;

export const BookDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FilterSection = styled.div`
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
  
  .pagination-button {
    margin: 0 4px;
    padding: 4px 10px;
    background: transparent;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #3769f5;
      color: #3769f5;
    }
    
    &.active {
      background: #3769f5;
      color: white;
      border-color: #3769f5;
    }
  }
`;

export const BookOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${BookImage}:hover & {
    opacity: 1;
  }
`;

export const BookTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const AuthorName = styled.span`
  font-weight: 500;
  color: #666;
  font-size: 14px;
`;

export const YearLabel = styled.span`
  color: #8c8c8c;
  font-size: 13px;
`;

export const StarRating = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  
  small {
    color: #8c8c8c;
    margin-top: 2px;
  }
`;

export const PriceTag = styled.div`
  font-weight: 600;
  color: #3769f5;
  margin-left: auto;
  font-size: 16px;
`; 
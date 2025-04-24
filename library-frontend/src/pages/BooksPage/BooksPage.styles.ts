import styled from 'styled-components';

export const BooksPageContainer = styled.div`
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
  width: 100%;
  padding: 40px 0;
`;

export const BooksPageContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

export const BooksPageSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

export const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    
    input {
      margin-right: 16px;
      margin-bottom: 0 !important;
    }
  }
`;

export const FiltersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  
  .filter-title {
    font-weight: 500;
    margin-bottom: 12px;
  }
  
  .categories-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .category-button {
    padding: 6px 12px;
    background: #f5f5f5;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #3769f5;
    }
    
    &.active {
      background: #3769f5;
      color: white;
      border-color: #3769f5;
    }
  }
`;

export const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
`;

export const BookCard = styled.div`
  overflow: hidden;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const BookImage = styled.div`
  height: 280px;
  width: 100%;
  overflow: hidden;
  
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

export const BookInfo = styled.div`
  padding: 16px;
`;

export const BookTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.4;
  
  /* Multi-line ellipsis for long titles */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 44px;
`;

export const BookAuthor = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  
  /* Single-line ellipsis for long author names */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`; 
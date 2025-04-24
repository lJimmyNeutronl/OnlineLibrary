import styled from 'styled-components';

export const NotFoundPageContainer = styled.div`
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
`;

export const NotFoundContent = styled.div`
  background: white;
  padding: 48px 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const NotFoundTitle = styled.h1`
  font-size: 72px;
  margin: 0;
  color: #3769f5;
  font-weight: bold;
`;

export const NotFoundMessage = styled.p`
  font-size: 18px;
  color: rgba(0, 0, 0, 0.65);
  margin: 16px 0 24px;
`; 
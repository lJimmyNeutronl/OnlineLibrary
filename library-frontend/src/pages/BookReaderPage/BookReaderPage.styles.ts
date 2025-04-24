import styled from 'styled-components';

export const ReaderContainer = styled.div`
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
  width: 100%;
  padding: 40px 0;
`;

export const ReaderHeader = styled.div`
  background: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;

  h2 {
    margin: 0;
  }
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
`;

export const ReaderContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

export const ReaderPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

export const DocumentContainer = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 30px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #f9f9f9;
`;

export const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
`; 
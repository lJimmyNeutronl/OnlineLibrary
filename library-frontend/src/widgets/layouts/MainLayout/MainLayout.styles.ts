import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;

export const ContentContainer = styled.main`
  flex: 1;
  width: 100%;
  position: relative;
  padding: 0;
  margin: 0;
  margin-top: 64px; /* Учитываем фиксированный хедер */
`; 
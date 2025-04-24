import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

export const BackLink = styled(Link)`
  margin-right: 16px;
  display: flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
  
  &:hover {
    color: #1890ff;
  }
`; 
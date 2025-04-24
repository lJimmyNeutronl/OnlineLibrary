import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

export const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

export const AuthContent = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 64px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const AuthLogo = styled(RouterLink)`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  text-decoration: none;
  margin-bottom: 40px;
  
  span {
    color: #3769f5;
    margin-right: 4px;
  }
`;

export const AuthFormContainer = styled.div`
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 32px;
`; 
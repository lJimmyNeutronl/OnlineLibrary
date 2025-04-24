import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

export const FooterContainer = styled.footer`
  background-color: #3769f5;
  padding: 40px 0;
  margin-top: auto;
  color: white;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: white;
  }
`;

export const FooterLogo = styled(RouterLink)`
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-decoration: none;
  margin-bottom: 8px;
  
  span {
    color: white;
    margin-right: 4px;
  }
`;

export const FooterNavigation = styled.div`
  display: flex;
  gap: 40px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 24px;
  }
`;

export const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FooterLink = styled(RouterLink)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
`;

export const FooterCopyright = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`; 
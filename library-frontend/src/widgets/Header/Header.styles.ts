import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: #3769f5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const LogoImage = styled.img`
  height: 40px;
  margin-right: 10px;
  filter: brightness(0) invert(1);
`;

export const LogoText = styled.span`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

export const NavigationContainer = styled.nav`
  display: flex;
  margin-right: 20px;
`;

export const NavLink = styled(Link)`
  color: white;
  margin: 0 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: white;
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }
`;

export const AuthButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

export const HeaderButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

export const RegisterButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

export const IconWrapper = styled.span`
  margin-right: 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
`; 
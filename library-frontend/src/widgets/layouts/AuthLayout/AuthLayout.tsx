import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContainer, AuthContent, AuthLogo, AuthFormContainer } from './AuthLayout.styles';

export interface AuthLayoutProps {
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ className }) => {
  return (
    <AuthContainer className={className}>
      <AuthContent>
        <AuthLogo to="/">
          <span>Online</span>Library
        </AuthLogo>
        <AuthFormContainer>
          <Outlet />
        </AuthFormContainer>
      </AuthContent>
    </AuthContainer>
  );
}; 
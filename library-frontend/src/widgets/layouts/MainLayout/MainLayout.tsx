import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../Header';
import { Footer } from '../../Footer';
import { LayoutContainer, ContentContainer } from './MainLayout.styles';

export interface MainLayoutProps {
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ className }) => {
  return (
    <LayoutContainer className={className}>
      <Header />
      <ContentContainer>
        <Outlet />
      </ContentContainer>
      <Footer />
    </LayoutContainer>
  );
}; 
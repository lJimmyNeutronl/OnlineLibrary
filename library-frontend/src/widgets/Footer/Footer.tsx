import React from 'react';
// eslint-disable-next-line no-unused-vars
import { Link } from 'react-router-dom'; // Этот импорт используется в FooterLink и FooterLogo через стилизованные компоненты
import {
  FooterContainer,
  FooterContent,
  FooterLogo,
  FooterNavigation,
  FooterLinks,
  FooterLink,
  FooterCopyright,
  FooterSection
} from './Footer.styles';

export interface FooterProps {
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer className={className}>
      <FooterContent>
        <FooterSection>
          <FooterLogo to="/">
            <span>Online</span>Library
          </FooterLogo>
          <FooterCopyright>
            © {currentYear} OnlineLibrary. Все права защищены.
          </FooterCopyright>
        </FooterSection>

        <FooterNavigation>
          <FooterSection>
            <h4>Навигация</h4>
            <FooterLinks>
              <FooterLink to="/">Главная</FooterLink>
              <FooterLink to="/books">Книги</FooterLink>
              <FooterLink to="/categories">Категории</FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h4>Сервис</h4>
            <FooterLinks>
              <FooterLink to="/faq">Вопросы и ответы</FooterLink>
              <FooterLink to="/contact">Контакты</FooterLink>
              <FooterLink to="/terms">Условия использования</FooterLink>
            </FooterLinks>
          </FooterSection>
        </FooterNavigation>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 
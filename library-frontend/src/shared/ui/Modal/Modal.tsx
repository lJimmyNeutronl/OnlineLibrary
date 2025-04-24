import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '../../hooks';
import {
  ModalBackdrop,
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton
} from './Modal.styles';

export interface ModalProps {
  /**
   * Флаг, определяющий, открыто ли модальное окно
   */
  isOpen: boolean;
  /**
   * Заголовок модального окна
   */
  title?: string;
  /**
   * Функция для закрытия модального окна
   */
  onClose: () => void;
  /**
   * Содержимое модального окна
   */
  children: React.ReactNode;
  /**
   * Ширина модального окна (в px или %)
   */
  width?: string;
  /**
   * Кнопки для футера модального окна
   */
  footer?: React.ReactNode;
  /**
   * Можно ли закрыть модальное окно по клику на затемнение
   */
  closeOnBackdropClick?: boolean;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> & {
  Footer: React.FC<ModalFooterProps>;
} = ({
  isOpen,
  title,
  onClose,
  children,
  width = '500px',
  footer,
  closeOnBackdropClick = true,
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(modalRef, () => {
    if (isOpen && closeOnBackdropClick) {
      onClose();
    }
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <ModalBackdrop>
      <ModalContainer ref={modalRef} style={{ width }} className={className}>
        <ModalHeader>
          {title && <h4>{title}</h4>}
          <ModalCloseButton onClick={onClose}>
            ✕
          </ModalCloseButton>
        </ModalHeader>
        <ModalContent>{children}</ModalContent>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalBackdrop>
  );

  return createPortal(modalContent, document.body);
};

Modal.Footer = ({ children }: ModalFooterProps) => (
  <ModalFooter>{children}</ModalFooter>
);

export default Modal;
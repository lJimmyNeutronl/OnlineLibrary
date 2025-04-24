import styled, { css, keyframes } from 'styled-components';
import { NotificationType } from './Notification';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Карта цветов для разных типов уведомлений
const notificationColors = {
  success: {
    background: '#f6ffed',
    border: '#b7eb8f',
    icon: '#52c41a'
  },
  error: {
    background: '#fff2f0',
    border: '#ffccc7',
    icon: '#ff4d4f'
  },
  warning: {
    background: '#fffbe6',
    border: '#ffe58f',
    icon: '#faad14'
  },
  info: {
    background: '#e6f7ff',
    border: '#91d5ff',
    icon: '#1890ff'
  }
};

interface NotificationContainerProps {
  $type: NotificationType;
  $visible: boolean;
  $position: string;
}

export const NotificationContainer = styled.div<NotificationContainerProps>`
  position: relative;
  display: flex;
  width: 350px;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 16px;
  animation: ${props => props.$visible ? slideIn : slideOut} 0.3s ease-in-out;
  animation-fill-mode: forwards;
  
  ${props => {
    const color = notificationColors[props.$type];
    return css`
      background-color: ${color.background};
      border: 1px solid ${color.border};
    `;
  }}
`;

export const NotificationContent = styled.div`
  flex: 1;
  margin: 0 16px;
`;

export const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
`;

export const NotificationMessage = styled.div`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
`;

export const NotificationIcon = styled.div<{ type: NotificationType }>`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 24px;
  height: 24px;
  
  ${props => {
    const color = notificationColors[props.type].icon;
    return css`
      color: ${color};
    `;
  }}
  
  &:before {
    ${props => {
      switch (props.type) {
        case 'success':
          return css`content: "✓";`;
        case 'error':
          return css`content: "✗";`;
        case 'warning':
          return css`content: "!";`;
        case 'info':
        default:
          return css`content: "i";`;
      }
    }}
    font-size: 18px;
    font-weight: bold;
  }
`;

export const NotificationCloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  padding: 4px;
  
  &:hover {
    color: rgba(0, 0, 0, 0.75);
  }
`; 
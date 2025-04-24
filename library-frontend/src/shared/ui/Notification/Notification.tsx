import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  NotificationContainer,
  NotificationContent,
  NotificationTitle,
  NotificationMessage,
  NotificationIcon,
  NotificationCloseButton
} from './Notification.styles';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationProps {
  /**
   * Тип уведомления
   */
  type?: NotificationType;
  /**
   * Заголовок уведомления
   */
  title?: string;
  /**
   * Сообщение уведомления
   */
  message: string;
  /**
   * Длительность отображения в миллисекундах
   */
  duration?: number;
  /**
   * Функция для закрытия уведомления
   */
  onClose?: () => void;
  /**
   * Расположение уведомления
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface NotificationOptions extends Omit<NotificationProps, 'message'> {
  message: string;
}

export const Notification: React.FC<NotificationProps> & {
  success: (options: NotificationOptions | string) => void;
  error: (options: NotificationOptions | string) => void;
  info: (options: NotificationOptions | string) => void;
  warning: (options: NotificationOptions | string) => void;
} = ({
  type = 'info',
  title,
  message,
  duration = 4500,
  onClose,
  position = 'top-right'
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  useEffect(() => {
    if (!visible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 300); // время анимации исчезновения

      return () => {
        clearTimeout(timer);
      };
    }
  }, [visible, onClose]);

  const handleClose = () => {
    setVisible(false);
  };

  const notification = (
    <NotificationContainer
      $type={type}
      $visible={visible}
      $position={position}
    >
      <NotificationIcon type={type} />
      <NotificationContent>
        {title && <NotificationTitle>{title}</NotificationTitle>}
        <NotificationMessage>{message}</NotificationMessage>
      </NotificationContent>
      <NotificationCloseButton onClick={handleClose}>
        ✕
      </NotificationCloseButton>
    </NotificationContainer>
  );

  return createPortal(notification, document.body);
};

// Создание контейнера для уведомлений
const createNotificationContainer = (position: string) => {
  const containerId = `notification-container-${position}`;
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.zIndex = '1010';
    
    // Позиционирование в зависимости от параметра position
    if (position.includes('top')) {
      container.style.top = '20px';
    } else {
      container.style.bottom = '20px';
    }
    
    if (position.includes('right')) {
      container.style.right = '20px';
    } else {
      container.style.left = '20px';
    }
    
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);
  }

  return container;
};

// Фабрика для создания уведомлений
const createNotification = (type: NotificationType) => (
  options: NotificationOptions | string
) => {
  const notificationProps: NotificationProps = typeof options === 'string'
    ? { message: options, type }
    : { ...options, type };
  
  const position = notificationProps.position || 'top-right';
  const container = createNotificationContainer(position);
  
  const notificationElement = document.createElement('div');
  container.appendChild(notificationElement);
  
  const removeNotification = () => {
    if (container.contains(notificationElement)) {
      container.removeChild(notificationElement);
    }
    
    // Если контейнер пуст, удаляем его
    if (container.childNodes.length === 0) {
      document.body.removeChild(container);
    }
  };
  
  // Рендеринг компонента уведомления
  const root = createPortal(
    <Notification
      {...notificationProps}
      onClose={removeNotification}
    />,
    notificationElement
  );
  
  return root;
};

// Статические методы для отображения уведомлений разных типов
Notification.success = createNotification('success');
Notification.error = createNotification('error');
Notification.info = createNotification('info');
Notification.warning = createNotification('warning'); 
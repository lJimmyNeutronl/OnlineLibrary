import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface MessageProps {
  content: ReactNode;
  type: MessageType;
  duration?: number;
  onClose?: () => void;
}

interface MessageApi {
  success: (content: ReactNode, duration?: number, onClose?: () => void) => void;
  error: (content: ReactNode, duration?: number, onClose?: () => void) => void;
  info: (content: ReactNode, duration?: number, onClose?: () => void) => void;
  warning: (content: ReactNode, duration?: number, onClose?: () => void) => void;
  loading: (content: ReactNode, duration?: number, onClose?: () => void) => void;
}

// Основной компонент для отображения сообщения
const MessageComponent: React.FC<MessageProps> = ({ content, type, duration = 3, onClose }) => {
  const [visible, setVisible] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration * 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);
  
  // Определение иконки в зависимости от типа сообщения
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      case 'info':
        return 'i';
      case 'loading':
        return '↻';
      default:
        return '';
    }
  };
  
  // Определение цвета в зависимости от типа сообщения
  const getColor = () => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      case 'info':
      case 'loading':
        return '#1890ff';
      default:
        return '#1890ff';
    }
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <div 
      className={`message message-${type}`}
      style={{
        padding: '8px 16px',
        backgroundColor: 'white',
        boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        transition: 'all 0.3s',
        animation: 'messageSlideIn 0.3s',
      }}
    >
      <span 
        className="message-icon"
        style={{
          marginRight: '8px',
          color: getColor(),
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
        }}
      >
        {getIcon()}
      </span>
      <span className="message-content">{content}</span>
    </div>
  );
};

// Контейнер для управления отображением сообщений
const MessageContainer: React.FC = () => {
  const [messages, setMessages] = React.useState<Array<MessageProps & { key: string }>>([]);
  
  // Создаем глобальное API для вызова сообщений
  React.useEffect(() => {
    const createMessage = (type: MessageType) => (
      content: ReactNode,
      duration = 3,
      onClose?: () => void
    ) => {
      const key = `message-${Date.now()}-${Math.random()}`;
      
      const removeMessage = () => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.key !== key));
        if (onClose) {
          onClose();
        }
      };
      
      const newMessage = {
        key,
        content,
        type,
        duration,
        onClose: removeMessage
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };
    
    // Экспортируем API в window для глобального доступа
    (window as any).messageApi = {
      success: createMessage('success'),
      error: createMessage('error'),
      info: createMessage('info'),
      warning: createMessage('warning'),
      loading: createMessage('loading')
    };
    
    return () => {
      // Удаляем API при размонтировании
      delete (window as any).messageApi;
    };
  }, []);
  
  return (
    <div 
      className="message-container"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <style>
        {`
          @keyframes messageSlideIn {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      {messages.map(msg => (
        <MessageComponent
          key={msg.key}
          content={msg.content}
          type={msg.type}
          duration={msg.duration}
          onClose={msg.onClose}
        />
      ))}
    </div>
  );
};

// Функция для монтирования контейнера сообщений
const mountMessageContainer = () => {
  const containerDiv = document.createElement('div');
  containerDiv.id = 'message-container-root';
  document.body.appendChild(containerDiv);
  
  const root = createRoot(containerDiv);
  root.render(<MessageContainer />);
};

// Создаем API для показа сообщений
const message: MessageApi = {
  success: (content, duration, onClose) => {
    if (!document.getElementById('message-container-root')) {
      mountMessageContainer();
    }
    (window as any).messageApi?.success(content, duration, onClose);
  },
  error: (content, duration, onClose) => {
    if (!document.getElementById('message-container-root')) {
      mountMessageContainer();
    }
    (window as any).messageApi?.error(content, duration, onClose);
  },
  info: (content, duration, onClose) => {
    if (!document.getElementById('message-container-root')) {
      mountMessageContainer();
    }
    (window as any).messageApi?.info(content, duration, onClose);
  },
  warning: (content, duration, onClose) => {
    if (!document.getElementById('message-container-root')) {
      mountMessageContainer();
    }
    (window as any).messageApi?.warning(content, duration, onClose);
  },
  loading: (content, duration, onClose) => {
    if (!document.getElementById('message-container-root')) {
      mountMessageContainer();
    }
    (window as any).messageApi?.loading(content, duration, onClose);
  }
};

export default message; 
import React from 'react';
import { 
  Button,
  Card
} from '../../../shared/ui';
import { 
  FiBookOpen, 
  FiHeart, 
  FiDownload 
} from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { 
  BookCoverContainer, 
  BookCoverImage,
  ActionButtonsContainer 
} from '../BookDetailPage.styles';

interface BookActionsProps {
  coverUrl?: string;
  title: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onStartReading: () => void;
  onDownload?: () => void;
}

/**
 * Компонент с обложкой книги и кнопками действий
 */
const BookActions: React.FC<BookActionsProps> = ({
  coverUrl,
  title,
  isFavorite,
  onToggleFavorite,
  onStartReading,
  onDownload
}) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <BookCoverContainer>
        <BookCoverImage
          src={coverUrl || 'https://via.placeholder.com/300x450?text=Нет+обложки'}
          alt={title}
        />
      </BookCoverContainer>
      
      <ActionButtonsContainer>
        <Button 
          type="primary" 
          icon={<FiBookOpen size={20} />} 
          size="large" 
          block
          onClick={onStartReading}
          style={{ marginBottom: '12px' }}
        >
          Читать онлайн
        </Button>
        
        <Button 
          icon={isFavorite ? <AiFillHeart size={20} /> : <FiHeart size={20} />}
          size="large"
          block
          onClick={onToggleFavorite}
          style={{ marginBottom: '12px' }}
        >
          {isFavorite ? 'В избранном' : 'Добавить в избранное'}
        </Button>
        
        <Button 
          icon={<FiDownload size={20} />}
          size="large"
          block
          onClick={handleDownload}
          style={{ marginBottom: '12px' }}
        >
          Скачать
        </Button>
      </ActionButtonsContainer>
    </Card>
  );
};

export default BookActions; 
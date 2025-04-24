import React from 'react';
import { Button } from '../../../shared/ui';
import { 
  AiOutlineZoomIn, 
  AiOutlineZoomOut, 
  AiOutlineFullscreen, 
  AiOutlineHeart 
} from 'react-icons/ai';
import { HeaderControls } from '../BookReaderPage.styles';

interface ReaderControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFullscreen?: () => void;
  onAddToFavorite?: () => void;
}

/**
 * Компонент с элементами управления чтением книги
 */
const ReaderControls: React.FC<ReaderControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onAddToFavorite
}) => {
  return (
    <HeaderControls>
      <Button 
        type="text" 
        onClick={onZoomIn}
        style={{ marginRight: '8px' }}
      >
        <AiOutlineZoomIn size={18} />
      </Button>
      
      <Button 
        type="text" 
        onClick={onZoomOut}
        style={{ marginRight: '8px' }}
      >
        <AiOutlineZoomOut size={18} />
      </Button>
      
      <Button 
        type="text" 
        onClick={onFullscreen}
        style={{ marginRight: '8px' }}
      >
        <AiOutlineFullscreen size={18} />
      </Button>
      
      <Button 
        type="text"
        onClick={onAddToFavorite}
      >
        <AiOutlineHeart size={18} />
      </Button>
    </HeaderControls>
  );
};

export default ReaderControls; 
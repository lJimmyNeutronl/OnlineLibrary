import React from 'react';
import { Button } from '../../../shared/ui';
import { PaginationControls } from '../BookReaderPage.styles';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Компонент с элементами навигации по страницам книги
 */
const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext
}) => {
  return (
    <PaginationControls>
      <Button 
        type="default" 
        onClick={onPrevious}
        disabled={currentPage <= 1}
      >
        Предыдущая страница
      </Button>
      
      <div>
        Страница {currentPage} из {totalPages}
      </div>
      
      <Button 
        type="default" 
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Следующая страница
      </Button>
    </PaginationControls>
  );
};

export default PaginationBar; 
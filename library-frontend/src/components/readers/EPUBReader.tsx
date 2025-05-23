import React, { useState, useEffect, useRef } from 'react';
import ePub, { Book as EPUBBook, Rendition, Contents } from 'epubjs';
import { ReadingProgress, BookFormat } from '../../types';
import Button from '../common/Button';
import { AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineFullscreen } from 'react-icons/ai';
import './Reader.css';

interface EPUBReaderProps {
  fileUrl: string;
  bookId: number;
  onProgressChange: (progress: ReadingProgress) => void;
  initialProgress?: ReadingProgress | null;
}

const EPUBReader: React.FC<EPUBReaderProps> = ({ 
  fileUrl, 
  bookId, 
  onProgressChange, 
  initialProgress 
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<EPUBBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация EPUB книги
  useEffect(() => {
    if (!viewerRef.current) return;

    try {
      setIsLoading(true);
      
      // Создаем экземпляр книги
      const newBook = ePub(fileUrl);
      setBook(newBook);
      
      // Создаем объект рендеринга книги
      const newRendition = newBook.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'auto'
      });
      
      // Устанавливаем масштаб шрифта
      newRendition.themes.fontSize(`${fontSize}%`);
      
      setRendition(newRendition);
      
      // Обработчик ошибок
      newBook.on('openFailed', (error) => {
        setError(`Не удалось открыть EPUB файл: ${error.message}`);
        setIsLoading(false);
      });

      // Инициализация книги и ее отображение
      newBook.ready.then(() => {
        // Получаем общее количество страниц
        newBook.locations.generate().then(() => {
          const totalLocs = newBook.locations.total;
          setTotalPages(totalLocs);
          
          // Восстанавливаем последнюю позицию чтения, если она есть
          if (initialProgress?.currentPage && initialProgress.format === BookFormat.EPUB) {
            // Преобразуем номер страницы в cfi для epubjs
            const percent = initialProgress.currentPage / initialProgress.totalPages;
            const cfi = newBook.locations.cfiFromPercentage(percent);
            if (cfi) {
              newRendition.display(cfi);
              setCurrentPage(initialProgress.currentPage);
            } else {
              newRendition.display();
            }
          } else {
            newRendition.display();
          }
          
          setIsLoading(false);
        });
      });

      // Отслеживаем изменение позиции чтения
      newRendition.on('relocated', (location) => {
        setCurrentLocation(location.start.cfi);
        const page = Math.ceil(newBook.locations.percentageFromCfi(location.start.cfi) * totalPages);
        setCurrentPage(page || 1);
        
        // Сохраняем прогресс чтения
        const progress: ReadingProgress = {
          bookId,
          currentPage: page || 1,
          totalPages: totalPages || 100,
          lastReadDate: new Date().toISOString(),
          format: BookFormat.EPUB
        };
        onProgressChange(progress);
      });

      return () => {
        if (newRendition) {
          newRendition.destroy();
        }
        if (newBook) {
          newBook.destroy();
        }
      };
    } catch (err) {
      console.error('Ошибка при инициализации EPUB ридера:', err);
      setError('Не удалось инициализировать EPUB ридер');
      setIsLoading(false);
    }
  }, [fileUrl, bookId, initialProgress, onProgressChange]);

  // Обновление размера шрифта
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize, rendition]);

  // Навигация по книге
  const goToPrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const goToNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  // Изменение масштаба
  const zoomIn = () => {
    setFontSize(prev => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setFontSize(prev => Math.max(prev - 10, 60));
  };

  // Полноэкранный режим
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const readerContainer = document.getElementById('epub-reader-container');
      if (readerContainer) {
        readerContainer.requestFullscreen().catch(err => {
          console.error(`Ошибка включения полноэкранного режима: ${err.message}`);
        });
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Обработка выхода из полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Обработка нажатий клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div id="epub-reader-container" className="reader-container">
      <div className="reader-toolbar">
        <div className="reader-controls">
          <Button 
            type="text" 
            onClick={goToPrevPage} 
            disabled={isLoading}
            className="reader-button"
          >
            Предыдущая
          </Button>
          <span className="reader-page-info">
            {isLoading ? 'Загрузка...' : `Страница ${currentPage} из ${totalPages || '?'}`}
          </span>
          <Button 
            type="text" 
            onClick={goToNextPage} 
            disabled={isLoading}
            className="reader-button"
          >
            Следующая
          </Button>
        </div>
        <div className="reader-zoom-controls">
          <Button type="text" onClick={zoomIn} className="reader-button">
            <AiOutlineZoomIn size={20} />
          </Button>
          <Button type="text" onClick={zoomOut} className="reader-button">
            <AiOutlineZoomOut size={20} />
          </Button>
          <Button type="text" onClick={toggleFullscreen} className="reader-button">
            <AiOutlineFullscreen size={20} />
          </Button>
        </div>
      </div>
      
      <div className="reader-content">
        {isLoading && (
          <div className="reader-loading">
            <div className="reader-spinner"></div>
            <p>Загрузка книги...</p>
          </div>
        )}
        
        {error && (
          <div className="reader-error">
            <p>{error}</p>
          </div>
        )}
        
        <div 
          ref={viewerRef} 
          className="epub-viewer"
          style={{ 
            width: '100%', 
            height: 'calc(100vh - 180px)',
            display: isLoading || error ? 'none' : 'block' 
          }}
        />
      </div>
      
      <div className="reader-footer">
        <div className="reader-pagination">
          <Button 
            type="text" 
            onClick={goToPrevPage} 
            disabled={isLoading}
            className="reader-button"
          >
            ← Предыдущая
          </Button>
          <span className="reader-page-info">
            {isLoading ? 'Загрузка...' : `${currentPage} / ${totalPages || '?'}`}
          </span>
          <Button 
            type="text" 
            onClick={goToNextPage} 
            disabled={isLoading}
            className="reader-button"
          >
            Следующая →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EPUBReader; 
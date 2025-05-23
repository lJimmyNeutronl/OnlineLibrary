import React, { useState, useEffect, useRef } from 'react';
import { ReadingProgress, BookFormat } from '../../types';
import Button from '../common/Button';
import { AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineFullscreen } from 'react-icons/ai';
import './Reader.css';

// Для распаковки FB2 файла (сжатый XML)
import * as zip from '@zip.js/zip.js';

interface FB2ReaderProps {
  fileUrl: string;
  bookId: number;
  onProgressChange: (progress: ReadingProgress) => void;
  initialProgress?: ReadingProgress | null;
}

const FB2Reader: React.FC<FB2ReaderProps> = ({
  fileUrl,
  bookId,
  onProgressChange,
  initialProgress
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialProgress?.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Загрузка и парсинг FB2 файла
  useEffect(() => {
    const fetchFB2 = async () => {
      try {
        setIsLoading(true);
        
        // Получаем файл
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        
        // Проверяем, ZIP файл или нет
        let textContent = '';
        
        if (fileUrl.toLowerCase().endsWith('.fb2.zip') || fileUrl.toLowerCase().endsWith('.zip')) {
          // Распаковываем ZIP архив
          const reader = new zip.ZipReader(new zip.BlobReader(blob));
          const entries = await reader.getEntries();
          
          // Ищем FB2 файл внутри архива
          const fb2Entry = entries.find(entry => entry.filename.endsWith('.fb2'));
          
          if (fb2Entry) {
            const writer = new zip.TextWriter();
            textContent = await fb2Entry.getData(writer);
          } else {
            throw new Error('FB2 файл не найден в архиве');
          }
          await reader.close();
        } else {
          // Обычный FB2 файл без сжатия
          textContent = await blob.text();
        }
        
        // Парсим FB2 (XML) содержимое и преобразуем его в HTML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textContent, 'text/xml');
        
        // Обработка ошибок парсинга
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('Ошибка при парсинге FB2 файла');
        }
        
        // Преобразуем FB2 в HTML
        const htmlContent = await convertFB2ToHTML(xmlDoc);
        setContent(htmlContent);
        
        // Устанавливаем общее количество страниц (примерно)
        // Один экран ~= 2000 символов
        const contentLength = textContent.length;
        const estimatedPages = Math.max(1, Math.ceil(contentLength / 2000));
        setTotalPages(estimatedPages);
        
        // Восстанавливаем прогресс чтения
        if (initialProgress?.currentPage && initialProgress.format === BookFormat.FB2) {
          // Scroll to position based on percentage
          const percent = initialProgress.currentPage / initialProgress.totalPages;
          setTimeout(() => {
            if (containerRef.current) {
              const scrollHeight = containerRef.current.scrollHeight;
              containerRef.current.scrollTop = scrollHeight * percent;
              setCurrentPage(initialProgress.currentPage);
            }
          }, 100);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке FB2:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке FB2 файла');
        setIsLoading(false);
      }
    };
    
    fetchFB2();
  }, [fileUrl, initialProgress]);
  
  // Конвертация из FB2 (XML) в HTML
  const convertFB2ToHTML = async (xmlDoc: Document): Promise<string> => {
    try {
      // Получаем метаданные книги
      const title = xmlDoc.querySelector('book-title')?.textContent || 'Без названия';
      const author = xmlDoc.querySelector('author')?.textContent || 'Неизвестный автор';
      
      // Получаем разделы (body)
      const bodies = xmlDoc.querySelectorAll('body');
      let bodyHTML = '';
      
      // Обрабатываем каждый раздел
      bodies.forEach(body => {
        // Проверяем, что это не примечания или другой специальный раздел
        const name = body.getAttribute('name');
        if (!name || name === 'notes' || name === 'comments') {
          // Получаем секции внутри body
          const sections = body.querySelectorAll('section');
          
          sections.forEach(section => {
            // Заголовок секции
            const title = section.querySelector('title');
            if (title) {
              bodyHTML += `<h2>${title.textContent}</h2>`;
            }
            
            // Параграфы
            const paragraphs = section.querySelectorAll('p');
            paragraphs.forEach(p => {
              bodyHTML += `<p>${p.innerHTML}</p>`;
            });
          });
        }
      });
      
      // Формируем полный HTML
      const html = `
        <div class="fb2-book">
          <h1>${title}</h1>
          <h3>${author}</h3>
          <div class="fb2-content">
            ${bodyHTML}
          </div>
        </div>
      `;
      
      return html;
    } catch (error) {
      console.error('Ошибка при конвертации FB2 в HTML:', error);
      return '<p>Ошибка при конвертации книги. Пожалуйста, выберите другой формат.</p>';
    }
  };
  
  // Отслеживание прокрутки для определения текущей страницы
  useEffect(() => {
    if (!containerRef.current || isLoading) return;
    
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const scrollPercent = scrollTop / (scrollHeight - clientHeight);
        const currentPage = Math.max(1, Math.round(scrollPercent * totalPages));
        
        setCurrentPage(currentPage);
        
        // Сохраняем прогресс чтения
        const progress: ReadingProgress = {
          bookId,
          currentPage,
          totalPages,
          lastReadDate: new Date().toISOString(),
          format: BookFormat.FB2
        };
        onProgressChange(progress);
      }
    };
    
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, isLoading, totalPages, bookId, onProgressChange]);
  
  // Изменение размера шрифта
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.fontSize = `${fontSize}%`;
    }
  }, [fontSize]);
  
  // Навигация по страницам (прокрутка)
  const goToPrevPage = () => {
    if (containerRef.current) {
      const { clientHeight } = containerRef.current;
      containerRef.current.scrollTop -= clientHeight * 0.9;
    }
  };
  
  const goToNextPage = () => {
    if (containerRef.current) {
      const { clientHeight } = containerRef.current;
      containerRef.current.scrollTop += clientHeight * 0.9;
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
      const readerContainer = document.getElementById('fb2-reader-container');
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
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div id="fb2-reader-container" className="reader-container">
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
          ref={containerRef}
          className="fb2-viewer"
          style={{ 
            display: isLoading || error ? 'none' : 'block',
            overflowY: 'auto',
            height: 'calc(100vh - 180px)',
            padding: '20px',
            fontSize: `${fontSize}%`
          }}
          dangerouslySetInnerHTML={{ __html: content }}
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

export default FB2Reader; 
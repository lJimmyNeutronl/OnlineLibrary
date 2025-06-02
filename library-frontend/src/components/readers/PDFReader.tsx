import React, { useState, useEffect, useMemo } from 'react';
import '../../utils/pdfjs';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ReadingProgress, BookFormat } from '../../types';
import Button from '../common/Button';
import { AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineFullscreen } from 'react-icons/ai';
import './Reader.css';

// Дополнительная проверка и настройка worker'а
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  const fallbackWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  pdfjs.GlobalWorkerOptions.workerSrc = fallbackWorkerSrc;
  console.log('[PDFReader] Установлен fallback worker:', fallbackWorkerSrc);
}

// Проверка инициализации воркера (для диагностики)
console.log('PDF.js используется версия:', pdfjs.version);
console.log('PDF.js GlobalWorkerOptions доступен:', Boolean(pdfjs.GlobalWorkerOptions));
console.log('PDF.js worker path:', pdfjs.GlobalWorkerOptions?.workerSrc || 'не установлен');

interface PDFReaderProps {
  fileUrl: string;
  bookId: number;
  onProgressChange: (progress: ReadingProgress) => void;
  initialProgress?: ReadingProgress | null;
}

const PDFReader: React.FC<PDFReaderProps> = ({ 
  fileUrl, 
  bookId, 
  onProgressChange, 
  initialProgress 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialProgress?.currentPage || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Мемоизация опций для компонента Document
  const documentOptions = useMemo(() => ({
    cMapUrl: '/pdfjs/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/pdfjs/standard_fonts/',
    withCredentials: true,
    // Для облачных хранилищ
    httpHeaders: {}
  }), []);

  // Подготовка URL и загрузка файла
  useEffect(() => {
    const loadPdf = async () => {
      try {
        if (!fileUrl) {
          throw new Error('URL файла не предоставлен');
        }

        console.log('Загрузка PDF из источника:', fileUrl);
        
        // Проверяем корректность URL и добавляем CORS прокси, если файл внешний
        let pdfUrl = fileUrl;
        
        // Если URL не содержит нашего домена и начинается с http/https, 
        // возможно нам нужно использовать CORS прокси
        if ((fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) &&
            !fileUrl.includes('localhost')) {
          
          console.log('Внешний URL обнаружен, проверяем доступность напрямую');
          
          try {
            // Пробуем загрузить файл напрямую
            setPdfFile(pdfUrl);
          } catch (corsError) {
            console.error('Ошибка CORS при прямом доступе:', corsError);
            // Если будет ошибка, в onDocumentLoadError мы её обработаем
          }
        } else {
          // Локальный файл или URL через наш API
          setPdfFile(pdfUrl);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка при загрузке PDF';
        console.error('Ошибка при загрузке PDF:', errorMessage);
        setError(`Не удалось загрузить PDF: ${errorMessage}`);
        setIsLoading(false);
      }
    };
    
    loadPdf();
  }, [fileUrl, retryCount]);

  useEffect(() => {
    // Сохраняем прогресс чтения при изменении страницы
    if (numPages && pageNumber) {
      const progress: ReadingProgress = {
        bookId,
        currentPage: pageNumber,
        totalPages: numPages,
        lastReadDate: new Date().toISOString(),
        format: BookFormat.PDF
      };
      onProgressChange(progress);
    }
  }, [pageNumber, numPages, bookId, onProgressChange]);

  // Обработчик успешной загрузки документа
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF успешно загружен, количество страниц:', numPages);
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    
    // Восстанавливаем прогресс чтения, если он существует
    if (initialProgress?.currentPage) {
      setPageNumber(initialProgress.currentPage);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Ошибка загрузки PDF:', error);
    
    // Если PDF не загрузился и мы еще не превысили лимит попыток
    if (retryCount < 2) {
      console.log(`Попытка №${retryCount + 1} загрузки PDF...`);
      setRetryCount(prev => prev + 1);
      return;
    }
    
    setError(`Не удалось загрузить документ: ${error.message || 'неизвестная ошибка'}`);
    setIsLoading(false);
  };

  // Навигация по страницам
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => numPages ? Math.min(prev + 1, numPages) : prev);

  // Масштабирование
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // Полноэкранный режим
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const readerContainer = document.getElementById('pdf-reader-container');
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

  // Функция для повторной попытки загрузки PDF
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
  };

  return (
    <div id="pdf-reader-container" className="reader-container">
      <div className="reader-toolbar">
        <div className="reader-controls">
          <Button 
            type="text" 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1 || isLoading || !pdfFile}
            className="reader-button"
          >
            Предыдущая
          </Button>
          <span className="reader-page-info">
            {isLoading ? 'Загрузка...' : `Страница ${pageNumber} из ${numPages || '?'}`}
          </span>
          <Button 
            type="text" 
            onClick={goToNextPage} 
            disabled={numPages === null || pageNumber >= numPages || isLoading || !pdfFile}
            className="reader-button"
          >
            Следующая
          </Button>
        </div>
        <div className="reader-zoom-controls">
          <Button type="text" onClick={zoomIn} className="reader-button" disabled={!pdfFile}>
            <AiOutlineZoomIn size={20} />
          </Button>
          <Button type="text" onClick={zoomOut} className="reader-button" disabled={!pdfFile}>
            <AiOutlineZoomOut size={20} />
          </Button>
          <Button type="text" onClick={toggleFullscreen} className="reader-button" disabled={!pdfFile}>
            <AiOutlineFullscreen size={20} />
          </Button>
        </div>
      </div>
      
      <div className="reader-content">
        {isLoading && !error && (
          <div className="reader-loading">
            <div className="reader-spinner"></div>
            <p>Загрузка документа...</p>
          </div>
        )}
        
        {error && (
          <div className="reader-error">
            <p>{error}</p>
            <p className="reader-error-details">
              Возможные причины:<br/>
              - Файл не найден в хранилище<br/>
              - Формат файла не поддерживается<br/>
              - Проблемы с доступом к внешнему хранилищу
            </p>
            <Button 
              type="primary" 
              onClick={handleRetry}
              className="retry-button"
            >
              Попробовать снова
            </Button>
          </div>
        )}
        
        {pdfFile && !error && (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="reader-loading"><div className="reader-spinner"></div></div>}
            className="pdf-document"
            options={documentOptions}
          >
            {numPages && (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="pdf-page"
              />
            )}
          </Document>
        )}
      </div>
      
      {/* Панель навигации для мобильных устройств */}
      <div className="reader-mobile-controls">
        <Button
          type="primary"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1 || isLoading || !pdfFile}
          className="mobile-nav-button"
        >
          {'<'}
        </Button>
        <span className="mobile-page-info">
          {pageNumber} / {numPages || '?'}
        </span>
        <Button
          type="primary"
          onClick={goToNextPage}
          disabled={numPages === null || pageNumber >= numPages || isLoading || !pdfFile}
          className="mobile-nav-button"
        >
          {'>'}
        </Button>
      </div>
    </div>
  );
};

export default PDFReader; 
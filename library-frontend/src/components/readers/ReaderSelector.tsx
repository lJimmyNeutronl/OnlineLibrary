import React, { useState, useEffect } from 'react';
import { BookFormat, ReadingProgress } from '../../types';
import PDFReader from './PDFReader';
import EPUBReader from './EPUBReader';
import FB2Reader from './FB2Reader';
import bookService from '../../services/bookService';
import Button from '../common/Button';
import Typography from '../common/Typography';
import { AiOutlineWarning } from 'react-icons/ai';

const { Title, Paragraph } = Typography;

interface ReaderSelectorProps {
  bookId: number;
  fileUrl?: string;
}

const ReaderSelector: React.FC<ReaderSelectorProps> = ({ bookId, fileUrl }) => {
  const [format, setFormat] = useState<BookFormat>(BookFormat.UNKNOWN);
  const [readerUrl, setReaderUrl] = useState<string>('');
  const [initialProgress, setInitialProgress] = useState<ReadingProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookFile = async () => {
      try {
        setIsLoading(true);
        console.log('Загрузка книги с ID:', bookId);
        
        // Если fileUrl не задан, получаем URL файла книги по API
        let url = fileUrl;
        if (!url) {
          try {
            url = await bookService.getBookFileUrl(bookId);
            console.log('Получен URL файла книги:', url);
            
            // Проверка валидности URL
            if (!url || !url.trim()) {
              throw new Error('Получен пустой URL файла книги');
            }
          } catch (urlError: any) {
            console.error('Ошибка при получении URL файла:', urlError);
            setError(`Не удалось получить файл книги: ${urlError.message || 'неизвестная ошибка'}`);
            setIsLoading(false);
            return;
          }
        }
        
        // Определяем формат книги по URL
        let bookFormat = bookService.getBookFormat(url);
        console.log('Начальное определение формата:', bookFormat);
        
        // Если формат все еще UNKNOWN, пробуем взять из localStorage
        if (bookFormat === BookFormat.UNKNOWN) {
          const savedFormat = bookService.getBookFormatFromLocalStorage(bookId);
          if (savedFormat) {
            console.log('Формат взят из localStorage:', savedFormat);
            bookFormat = savedFormat;
          } else if (url) {
            // Попытка определить формат по расширению в URL
            const extension = bookService.getFileExtension(url);
            if (extension) {
              console.log('Определен формат по расширению в URL:', extension);
              bookFormat = bookService.extensionToFormat(extension);
            }
          }
        }
        
        console.log('Итоговый определенный формат книги:', bookFormat);
        
        // Получаем сохраненный прогресс чтения
        const progress = bookService.getReadingProgress(bookId);
        if (progress) {
          console.log('Загружен сохраненный прогресс чтения:', progress);
          // Если формат еще не определен, но есть в прогрессе, используем его
          if (bookFormat === BookFormat.UNKNOWN && progress.format !== BookFormat.UNKNOWN) {
            bookFormat = progress.format;
            console.log('Формат определен из сохраненного прогресса чтения:', bookFormat);
          }
        }
        
        setFormat(bookFormat);
        setReaderUrl(url);
        setInitialProgress(progress);
        setIsLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке файла книги:', err);
        setError(err instanceof Error ? err.message : 'Не удалось загрузить файл книги');
        setIsLoading(false);
      }
    };
    
    loadBookFile();
  }, [bookId, fileUrl]);

  // Обработчик сохранения прогресса чтения
  const handleProgressChange = (progress: ReadingProgress) => {
    // Сохраняем формат книги в localStorage при обновлении прогресса
    if (progress.format !== BookFormat.UNKNOWN) {
      bookService.saveBookFormatToLocalStorage(bookId, progress.format);
    }
    
    bookService.saveReadingProgress(progress);
  };

  // Отображение соответствующего ридера в зависимости от формата
  const renderReader = () => {
    if (isLoading) {
      return (
        <div className="reader-loading">
          <div className="reader-spinner"></div>
          <p>Загрузка книги...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="reader-error">
          <AiOutlineWarning size={48} />
          <Title level={4}>Произошла ошибка</Title>
          <Paragraph>{error}</Paragraph>
          <Button type="primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      );
    }
    
    switch (format) {
      case BookFormat.PDF:
        return (
          <PDFReader
            fileUrl={readerUrl}
            bookId={bookId}
            onProgressChange={handleProgressChange}
            initialProgress={initialProgress}
          />
        );
      case BookFormat.EPUB:
        return (
          <EPUBReader
            fileUrl={readerUrl}
            bookId={bookId}
            onProgressChange={handleProgressChange}
            initialProgress={initialProgress}
          />
        );
      case BookFormat.FB2:
        return (
          <FB2Reader
            fileUrl={readerUrl}
            bookId={bookId}
            onProgressChange={handleProgressChange}
            initialProgress={initialProgress}
          />
        );
      default:
        return (
          <div className="reader-error">
            <AiOutlineWarning size={48} />
            <Title level={4}>Неподдерживаемый формат</Title>
            <Paragraph>
              Формат данной книги не поддерживается или не удалось определить формат автоматически.
              Пожалуйста, выберите формат вручную:
            </Paragraph>
            <div className="format-selection">
              <Button 
                type="primary" 
                onClick={() => {
                  setFormat(BookFormat.PDF);
                  // Сохраняем выбор пользователя
                  bookService.saveBookFormatToLocalStorage(bookId, BookFormat.PDF);
                }}
                className="format-button"
              >
                PDF
              </Button>
              <Button 
                type="primary" 
                onClick={() => {
                  setFormat(BookFormat.EPUB);
                  bookService.saveBookFormatToLocalStorage(bookId, BookFormat.EPUB);
                }}
                className="format-button"
              >
                EPUB
              </Button>
              <Button 
                type="primary" 
                onClick={() => {
                  setFormat(BookFormat.FB2);
                  bookService.saveBookFormatToLocalStorage(bookId, BookFormat.FB2);
                }}
                className="format-button"
              >
                FB2
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="reader-selector">
      {renderReader()}
    </div>
  );
};

export default ReaderSelector; 
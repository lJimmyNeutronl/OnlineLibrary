import { pdfjs } from 'react-pdf';

// Импортируем pdfjs-dist для инициализации GlobalWorkerOptions
import * as pdfjsLib from 'pdfjs-dist';

// Инициализируем библиотеку
if (typeof window !== 'undefined' && 'Worker' in window) {
  // Устанавливаем путь к воркеру (в двух форматах для совместимости)
  const workerPath = '/pdfjs-dist/pdf.worker.min.js';
  const workerPathMjs = '/pdfjs/pdf.worker.min.mjs';
  
  // Пробуем различные пути для совместимости с разными версиями
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
    console.log('[PDFjs Config] Worker path установлен (pdfjs-dist):', workerPath);
    
    // Для совместимости с react-pdf
    if (pdfjs) {
      if (!pdfjs.GlobalWorkerOptions) {
        // @ts-ignore - подавляем ошибку TS, если свойство не определено
        pdfjs.GlobalWorkerOptions = {};
      }
      pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
      console.log('[PDFjs Config] Worker path установлен (react-pdf):', workerPath);
    }
  } catch (error) {
    console.error('[PDFjs Config] Ошибка при установке worker path:', error);
    
    // Запасной вариант - использовать MJS файл
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerPathMjs;
      if (pdfjs && pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerPathMjs;
      }
      console.log('[PDFjs Config] Использован запасной worker path:', workerPathMjs);
    } catch (fallbackError) {
      console.error('[PDFjs Config] Критическая ошибка при установке worker path:', fallbackError);
    }
  }
}

export default pdfjs; 
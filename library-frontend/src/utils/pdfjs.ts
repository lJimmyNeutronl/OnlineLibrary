import { pdfjs } from 'react-pdf';

// Настройка PDF.js с корректным worker'ом
if (typeof window !== 'undefined') {
  try {
    // Используем CDN worker для совместимости с версией react-pdf
    const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    
    console.log('[PDFjs Config] PDF.js версия:', pdfjs.version);
    console.log('[PDFjs Config] Worker установлен:', workerSrc);
    
  } catch (error) {
    console.error('[PDFjs Config] Ошибка настройки PDF.js:', error);
    
    // Fallback на статический CDN path
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      console.log('[PDFjs Config] Использован fallback worker');
    } catch (fallbackError) {
      console.error('[PDFjs Config] Критическая ошибка:', fallbackError);
    }
  }
} else {
  console.log('[PDFjs Config] Серверная среда, настройка не требуется');
}

export default pdfjs; 
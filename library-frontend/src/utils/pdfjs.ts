import { pdfjs } from 'react-pdf';

// Указываем точную версию, соответствующую API react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

// Проверяем, успешно ли установлен путь к воркеру
console.log('[PDFjs Config] Worker path установлен:', pdfjs.GlobalWorkerOptions.workerSrc);

export default pdfjs; 
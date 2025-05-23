import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Функция для создания массива номеров страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    
    // Всегда показываем первую страницу
    pages.push(1);
    
    // Определяем диапазон страниц вокруг текущей
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Добавляем многоточие после первой страницы, если нужно
      if (startPage > 2) {
      pages.push('...');
    }
    
    // Добавляем страницы из диапазона
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Добавляем многоточие перед последней страницей, если нужно
      if (endPage < totalPages - 1) {
      pages.push('...');
      }
    
    // Добавляем последнюю страницу, если всего страниц больше 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div style={{ 
        display: 'flex',
      alignItems: 'center', 
        justifyContent: 'center',
      gap: '5px'
    }}>
      {/* Кнопка "Предыдущая страница" */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
          background: 'white',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        <FaChevronLeft size={14} color="#666" />
      </button>
      
      {/* Номера страниц */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span style={{ 
              margin: '0 2px',
              color: '#666' 
            }}>
            ...
          </span>
        ) : (
          <button
              onClick={() => typeof page === 'number' && onPageChange(page)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                border: currentPage === page ? 'none' : '1px solid #e0e0e0',
                background: currentPage === page 
                  ? 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)' 
                  : 'white',
                color: currentPage === page ? 'white' : '#333',
                fontWeight: currentPage === page ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            {page}
          </button>
          )}
        </React.Fragment>
      ))}
      
      {/* Кнопка "Следующая страница" */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
          background: 'white',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        <FaChevronRight size={14} color="#666" />
      </button>
    </div>
  );
};

export default Pagination; 
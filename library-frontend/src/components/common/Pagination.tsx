import React, { useState } from 'react';

interface PaginationProps {
  current?: number;
  defaultCurrent?: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number) => void;
  showSizeChanger?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  defaultCurrent = 1,
  total,
  pageSize = 10,
  onChange,
  showSizeChanger = true,
  className = '',
  style = {}
}) => {
  const [internalCurrent, setInternalCurrent] = useState<number>(defaultCurrent);
  
  // Определение значения текущей страницы
  const pageNumber = current || internalCurrent;
  
  // Вычисление общего количества страниц
  const totalPages = Math.ceil(total / pageSize);
  
  // Генерация массива страниц, которые нужно отобразить
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    
    // Показываем страницы в пределах 2 от текущей
    const startPage = Math.max(1, pageNumber - 2);
    const endPage = Math.min(totalPages, pageNumber + 2);
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(-1); // -1 означает многоточие
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(-1); // -1 означает многоточие
      }
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const handlePageClick = (page: number) => {
    if (page === pageNumber || page < 1 || page > totalPages) return;
    
    if (!current) {
      setInternalCurrent(page);
    }
    
    if (onChange) {
      onChange(page);
    }
  };
  
  return (
    <div 
      className={`custom-pagination ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      {/* Кнопка "Предыдущая" */}
      <button
        className={`pagination-item prev ${pageNumber === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageClick(pageNumber - 1)}
        disabled={pageNumber === 1}
        style={{
          padding: '0 8px',
          height: '32px',
          cursor: pageNumber === 1 ? 'not-allowed' : 'pointer',
          backgroundColor: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          marginRight: '8px',
          opacity: pageNumber === 1 ? 0.5 : 1
        }}
      >
        &lt;
      </button>
      
      {/* Номера страниц */}
      {getPageNumbers().map((page, index) => (
        page === -1 ? (
          <span
            key={`ellipsis-${index}`}
            style={{
              margin: '0 8px',
              color: '#999'
            }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`pagination-item ${page === pageNumber ? 'active' : ''}`}
            onClick={() => handlePageClick(page)}
            style={{
              margin: '0 4px',
              padding: '0 10px',
              height: '32px',
              cursor: 'pointer',
              backgroundColor: page === pageNumber ? '#1890ff' : 'white',
              color: page === pageNumber ? 'white' : 'rgba(0, 0, 0, 0.65)',
              border: `1px solid ${page === pageNumber ? '#1890ff' : '#d9d9d9'}`,
              borderRadius: '4px'
            }}
          >
            {page}
          </button>
        )
      ))}
      
      {/* Кнопка "Следующая" */}
      <button
        className={`pagination-item next ${pageNumber === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageClick(pageNumber + 1)}
        disabled={pageNumber === totalPages}
        style={{
          padding: '0 8px',
          height: '32px',
          cursor: pageNumber === totalPages ? 'not-allowed' : 'pointer',
          backgroundColor: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          marginLeft: '8px',
          opacity: pageNumber === totalPages ? 0.5 : 1
        }}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination; 
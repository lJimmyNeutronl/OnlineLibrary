import React, { useState, useEffect } from 'react';
import { FilterParams } from '../components/catalog/CatalogFilters';
import CatalogFilters from '../components/catalog/CatalogFilters';
import CatalogStats from '../components/catalog/CatalogStats';
import BookList from '../components/book-card/BookList';
import bookService from '../services/bookService';
import './BooksPage.css';
import '../styles/common.css';

const BooksPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<any[]>([]);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [totalAuthors, setTotalAuthors] = useState<number>(0);
  const [totalGenres, setTotalGenres] = useState<number>(0);
  const [readCount, setReadCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [filters, setFilters] = useState<FilterParams>({});
  const [pageSizeOptions] = useState<number[]>([6, 12, 24, 48]);

  // Загрузка книг согласно фильтрам и пагинации
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await bookService.getBooks({
          ...filters,
          page: currentPage - 1,
          size: pageSize
        });
        
        setBooks(response.content);
        setTotalItems(response.totalElements);
      } catch (error) {
        console.error('Error fetching books:', error);
        setBooks([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters, currentPage, pageSize]);

  // Загрузка статистических данных
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Запрос для получения статистики
        const stats = await bookService.getStats();
        setTotalBooks(stats.totalBooks || 0);
        setTotalAuthors(stats.totalAuthors || 0);
        setTotalGenres(stats.totalGenres || 0);
        setReadCount(stats.readCount || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setTotalBooks(0);
        setTotalAuthors(0);
        setTotalGenres(0);
        setReadCount(0);
      }
    };

    fetchStats();
  }, []);

  // Обработчик изменения фильтров
  const handleApplyFilters = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
  };

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Обработчик изменения размера страницы
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Сбрасываем страницу при изменении количества элементов
  };

  // Генерация пагинации
  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const buttons = [];
    
    // Кнопка "Предыдущая"
    buttons.push(
      <button 
        key="prev" 
        className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo; Предыдущая
      </button>
    );
    
    // Определяем диапазон страниц для отображения
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Кнопка для первой страницы
    if (startPage > 1) {
      buttons.push(
        <button 
          key={1} 
          className={`pagination-button ${currentPage === 1 ? 'active' : ''}`} 
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }
    
    // Генерируем кнопки для страниц
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    // Кнопка для последней страницы
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      buttons.push(
        <button 
          key={totalPages} 
          className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    // Кнопка "Следующая"
    buttons.push(
      <button 
        key="next" 
        className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Следующая &raquo;
      </button>
    );
    
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Всего {totalItems} книг
        </div>
        <div className="pagination-buttons">
          {buttons}
        </div>
        <div className="pagination-size">
          <select 
            className="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} / страница
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="books-page-container">
      <div className="books-page-content">
        <div className="books-page-header">
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h1 className="page-title">
              Каталог книг
            </h1>
          </div>
          <p className="books-page-description">
            Исследуйте нашу обширную коллекцию книг. Используйте фильтры для поиска книг по жанрам, авторам и другим параметрам, чтобы найти именно то, что вы ищете.
          </p>
        </div>

        {/* Статистика */}
        <div className="books-content-section">
          <CatalogStats
            totalBooks={totalBooks}
            totalAuthors={totalAuthors}
            totalGenres={totalGenres}
            readCount={readCount}
          />
        </div>

        <div className="books-page-row">
          {/* Фильтры */}
          <div className="books-page-sidebar">
            <CatalogFilters
              onApplyFilters={handleApplyFilters}
              loading={loading}
            />
          </div>
          
          {/* Список книг */}
          <div className="books-page-main">
            <div className="books-content-section">
              {loading ? (
                <div className="books-loading">
                  <div className="loader"></div>
                </div>
              ) : books.length > 0 ? (
                <div className="books-grid">
                  <BookList books={books} viewMode="grid" />
                </div>
              ) : (
                <div className="books-empty">
                  <div className="empty-icon">📚</div>
                  <p className="empty-message">К сожалению, книги не найдены. Попробуйте изменить параметры поиска.</p>
                </div>
              )}
              
              {/* Пагинация */}
              {!loading && totalItems > 0 && renderPagination()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksPage; 
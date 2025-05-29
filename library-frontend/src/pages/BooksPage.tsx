import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import { useCatalogFilters, useCatalog } from '../hooks';
import { BookList } from '../components/book-card';
import CatalogFilters from '../components/catalog/CatalogFilters';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { Pagination, Spin, Empty, Button } from '../components/common';
import './BooksPage.css';

const BooksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Хуки для управления фильтрами и данными
  const {
    filters,
    pagination,
    apiParams,
    updateFilters,
    updatePagination,
    resetFilters,
    hasActiveFilters,
    activeFiltersCount,
  } = useCatalogFilters();

  const {
    books,
    loading,
    error,
    totalElements,
    totalPages,
    refetch,
  } = useCatalog(apiParams);

  // Обработчики
  const handlePageChange = (page: number) => {
    updatePagination({ page: page - 1 }); // API использует 0-based индексацию
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleRetry = () => {
    refetch();
  };

  // Анимации
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatedBackground className="books-page">
      <motion.div 
        className="books-page-wrapper"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Заголовок страницы - вне белого блока */}
        <motion.div className="page-header" variants={itemVariants}>
          <h1 className="page-title">Каталог книг</h1>
          <p className="page-description">
            Исследуйте нашу коллекцию книг. Используйте фильтры для поиска интересующих вас произведений.
          </p>
        </motion.div>

        {/* Белый блок с контентом */}
        <div className="books-page-content">
          <div className="books-page-container">
            {/* Фильтры */}
            <motion.div variants={itemVariants}>
              <CatalogFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
                activeFiltersCount={activeFiltersCount}
                loading={loading}
                totalBooks={totalElements}
                currentCount={books.length}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                hasActiveFilters={hasActiveFilters}
              />
            </motion.div>

            {/* Контент */}
            <motion.div className="books-content" variants={itemVariants}>
              {error ? (
                <div className="error-state">
                  <FiAlertCircle className="error-icon" />
                  <h3>Произошла ошибка</h3>
                  <p>{error}</p>
                  <Button type="primary" onClick={handleRetry}>
                    Попробовать снова
                  </Button>
                </div>
              ) : loading ? (
                <div className="loading-state">
                  <Spin size="large" />
                  <p>Загружаем книги...</p>
                </div>
              ) : books.length === 0 ? (
                <Empty
                  description={
                    hasActiveFilters 
                      ? "По вашему запросу ничего не найдено. Попробуйте изменить фильтры."
                      : "В каталоге пока нет книг."
                  }
                >
                  {hasActiveFilters && (
                    <Button type="primary" onClick={resetFilters}>
                      Сбросить фильтры
                    </Button>
                  )}
                </Empty>
              ) : (
                <>
                  <BookList
                    books={books}
                    viewMode={viewMode}
                    loading={loading}
                  />
                  
                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <motion.div 
                      className="pagination-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Pagination
                        currentPage={pagination.page + 1} // UI использует 1-based индексацию
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatedBackground>
  );
};

export default BooksPage; 
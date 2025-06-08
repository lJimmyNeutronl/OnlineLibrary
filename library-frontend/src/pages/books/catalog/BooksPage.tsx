import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import { useCatalogFilters, useCatalog } from '@hooks/index';
import { BookList } from '@components/book-card';
import CatalogFilters from '@components/catalog/CatalogFilters';
import AnimatedBackground from '@components/common/AnimatedBackground';
import { Pagination, Spin, Empty, Button } from '@components/common';
import bookService from '@services/bookService';
import styles from './BooksPage.module.css';

const BooksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalBooksInDB, setTotalBooksInDB] = useState<number>(0);
  
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
  
  // Получаем общее количество книг в базе данных при первой загрузке
  React.useEffect(() => {
    const fetchTotalBooks = async () => {
      try {
        // Запрашиваем первую страницу без фильтров для получения общего количества
        const response = await bookService.getBooks({ page: 0, size: 1 });
        setTotalBooksInDB(response.totalElements);
      } catch (error) {
        console.error('Ошибка при получении общего количества книг:', error);
      }
    };
    
    fetchTotalBooks();
  }, []);

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
    <AnimatedBackground className={styles.booksPage}>
      <motion.div 
        className={styles.booksPageWrapper}
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Заголовок страницы - вне белого блока */}
        <motion.div className={styles.pageHeader} variants={itemVariants}>
          <h1 className={styles.pageTitle}>Каталог книг</h1>
          <p className={styles.pageDescription}>
            Исследуйте нашу коллекцию книг. Используйте фильтры для поиска интересующих вас произведений.
          </p>
        </motion.div>

        {/* Белый блок с контентом */}
        <div className={styles.booksPageContent}>
          <div className={styles.booksPageContainer}>
            {/* Фильтры */}
            <motion.div variants={itemVariants}>
              <CatalogFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
                activeFiltersCount={activeFiltersCount}
                loading={loading}
                totalBooks={totalBooksInDB}
                currentCount={totalElements}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                hasActiveFilters={hasActiveFilters}
              />
            </motion.div>

            {/* Контент */}
            <motion.div className={styles.booksContent} variants={itemVariants}>
              {error ? (
                <div className={styles.errorState}>
                  <FiAlertCircle className={styles.errorIcon} />
                  <h3>Произошла ошибка</h3>
                  <p>{error}</p>
                  <Button type="primary" onClick={handleRetry}>
                    Попробовать снова
                  </Button>
                </div>
              ) : loading ? (
                <div className={styles.loadingState}>
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
                      className={styles.paginationContainer}
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
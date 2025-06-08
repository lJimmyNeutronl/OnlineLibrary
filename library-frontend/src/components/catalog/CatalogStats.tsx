import React from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import { Button } from '../common';
import './CatalogStats.css';

interface CatalogStatsProps {
  totalBooks: number;
  currentCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  hasActiveFilters: boolean;
  loading?: boolean;
}

const CatalogStats: React.FC<CatalogStatsProps> = ({
  totalBooks,
  currentCount,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  loading = false
}) => {
  const fadeIn = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="catalog-stats"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="stats-info">
        <div className="stats-main">
          <FiBook className="stats-icon" />
          <div className="stats-text">
            {loading ? (
              <span className="stats-loading">Загрузка...</span>
            ) : (
              <>
                <span className="stats-count">
                  {hasActiveFilters ? (
                    <>
                      Найдено <strong>{currentCount}</strong> из {totalBooks} книг
                    </>
                  ) : (
                    <>
                      Всего <strong>{totalBooks}</strong> {totalBooks === 1 ? 'книга' : totalBooks < 5 ? 'книги' : 'книг'}
                    </>
                  )}
                </span>
                {hasActiveFilters && (
                  <span className="stats-filter-indicator">
                    <FiFilter size={12} />
                    Применены фильтры
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="stats-controls">
        <div className="view-mode-toggle" data-active={viewMode}>
          <Button
            type={viewMode === 'grid' ? 'primary' : 'default'}
            size="small"
            onClick={() => onViewModeChange('grid')}
            className="view-mode-btn"
          >
            <FiGrid />
          </Button>
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            size="small"
            onClick={() => onViewModeChange('list')}
            className="view-mode-btn"
          >
            <FiList />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CatalogStats; 
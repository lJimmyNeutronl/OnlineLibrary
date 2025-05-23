import React from 'react';
import { FiBook, FiUsers, FiBookOpen, FiTag } from 'react-icons/fi';
import './CatalogStats.css';

interface CatalogStatsProps {
  totalBooks: number;
  totalAuthors: number;
  totalGenres: number;
  readCount: number;
}

const CatalogStats: React.FC<CatalogStatsProps> = ({
  totalBooks,
  totalAuthors,
  totalGenres,
  readCount
}) => {
  return (
    <div className="catalog-stats">
      <div className="stat-item">
        <div className="stat-icon">
          <FiBook />
        </div>
        <div className="stat-value">{totalBooks}</div>
        <div className="stat-label">Книг в коллекции</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">
          <FiUsers />
        </div>
        <div className="stat-value">{totalAuthors}</div>
        <div className="stat-label">Авторов</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">
          <FiTag />
        </div>
        <div className="stat-value">{totalGenres}</div>
        <div className="stat-label">Жанров</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">
          <FiBookOpen />
        </div>
        <div className="stat-value">{readCount}</div>
        <div className="stat-label">Прочитано</div>
      </div>
    </div>
  );
};

export default CatalogStats; 
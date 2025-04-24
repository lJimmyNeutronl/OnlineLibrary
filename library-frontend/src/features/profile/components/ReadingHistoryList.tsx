import React from 'react';
import { ReadingHistory } from '../types';
import { formatDateTime, sortReadingHistory } from '../utils';

interface ReadingHistoryListProps {
  readingHistory: ReadingHistory[];
}

/**
 * Компонент для отображения истории чтения
 */
const ReadingHistoryList: React.FC<ReadingHistoryListProps> = ({ readingHistory }) => {
  if (readingHistory.length === 0) {
    return (
      <div className="empty-history">
        <p>У вас пока нет истории чтения</p>
      </div>
    );
  }

  // Сортировка истории чтения по дате последнего чтения (сначала новые)
  const sortedHistory = sortReadingHistory(readingHistory);

  return (
    <div className="reading-history">
      <h2>История чтения</h2>
      
      <div className="history-list">
        {sortedHistory.map(item => (
          <div key={item.id} className="history-item">
            <div className="book-cover">
              {item.book?.coverUrl ? (
                <img src={item.book.coverUrl} alt={item.book.title} />
              ) : (
                <div className="cover-placeholder">
                  {item.book?.title?.charAt(0) || 'К'}
                </div>
              )}
            </div>
            
            <div className="history-details">
              <h3 className="book-title">{item.book?.title || 'Без названия'}</h3>
              
              <div className="reading-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${item.readPercentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">{item.readPercentage}% прочитано</span>
              </div>
              
              <div className="reading-info">
                <p className="last-page">Страница: {item.lastPage}</p>
                <p className="last-read-date">
                  Последний раз читали: {formatDateTime(item.lastReadDate)}
                </p>
              </div>
              
              <button className="continue-reading-button">
                Продолжить чтение
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadingHistoryList; 
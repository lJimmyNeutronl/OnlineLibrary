import React, { useState, useRef } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsArrowRight } from 'react-icons/bs';
import { MdClear } from 'react-icons/md';
import { Spin } from '@components/common';
import { useSearch } from '@hooks/useSearch.ts';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Поиск по системе. Например: Органическая химия",
  className = ""
}) => {
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  
  const {
    searchQuery,
    setSearchQuery,
    searchHistory,
    suggestions,
    loadingSuggestions,
    handleSearchInputChange,
    handleSuggestionClick,
    clearSearchHistory
  } = useSearch(onSearch);

  const handleInputFocus = () => setInputFocused(true);
  
  const handleInputBlur = () => {
    // Задержка, чтобы успеть кликнуть по элементу истории или подсказке
    setTimeout(() => setInputFocused(false), 200);
  };

  const handleClearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery);
    }
  };

  return (
    <div className={`${styles.searchContainer} ${inputFocused ? styles.focused : ''} ${className}`}>
      <div className={styles.searchIcon}>
        <AiOutlineSearch size={24} color="#3769f5" />
      </div>
      
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearchInputChange}
        onKeyPress={handleKeyPress}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      
      {/* Выпадающий список с подсказками */}
      {inputFocused && searchQuery.trim().length >= 2 && (
        <div className={styles.suggestionsDropdown}>
          <div className={styles.dropdownHeader}>
            <span>Подсказки</span>
          </div>
          
          {loadingSuggestions ? (
            <div className={styles.loadingContainer}>
              <Spin size="small" />
              <span className={styles.loadingText}>Поиск...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div 
                key={`suggestion-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={styles.suggestionItem}
              >
                <AiOutlineSearch size={16} color="#3769f5" className={styles.itemIcon} />
                <span>{suggestion}</span>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              Подсказки не найдены
            </div>
          )}
        </div>
      )}
      
      {/* Выпадающий список с историей поиска */}
      {inputFocused && searchHistory.length > 0 && (!searchQuery || searchQuery.trim().length < 2) && (
        <div className={styles.historyDropdown}>
          <div className={styles.dropdownHeader}>
            <span>История поиска</span>
            <button onClick={clearSearchHistory} className={styles.clearButton}>
              Очистить
            </button>
          </div>
          
          {searchHistory.map((query, index) => (
            <div 
              key={index}
              onClick={() => handleSuggestionClick(query)}
              className={styles.historyItem}
            >
              <AiOutlineSearch size={16} color="#999" className={styles.itemIcon} />
              <span>{query}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Кнопка очистки */}
      {searchQuery && (
        <button onClick={handleClearInput} className={styles.clearInputButton}>
          <MdClear size={22} />
        </button>
      )}
      
      {/* Кнопка поиска */}
      <button 
        onClick={() => onSearch(searchQuery)}
        type="button"
        aria-label="Искать"
        className={styles.submitButton}
      >
        <BsArrowRight size={22} color="white" />
      </button>
    </div>
  );
};

export default SearchInput; 
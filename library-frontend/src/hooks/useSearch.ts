import React, { useState, useRef, useCallback, useEffect } from 'react';
import bookService from '@services/bookService';

export const useSearch = (onSearch: (query: string) => void) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const suggestionsTimeoutRef = useRef<number | null>(null);

  // Загрузка истории поиска
  const loadSearchHistory = useCallback(() => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history);
    } catch (e) {
      console.error('Ошибка при загрузке истории поиска:', e);
      setSearchHistory([]);
    }
  }, []);

  // Сохранение запроса в истории
  const saveToHistory = useCallback((query: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      
      if (!history.includes(query)) {
        history.unshift(query);
        
        if (history.length > 10) {
          history.pop();
        }
        
        localStorage.setItem('searchHistory', JSON.stringify(history));
        setSearchHistory(history);
      }
    } catch (e) {
      console.error('Ошибка при сохранении истории поиска:', e);
    }
  }, []);

  // Обработчик изменения текста в поле поиска
  const handleSearchInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Получаем подсказки для поиска с задержкой (debounce)
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    
    if (value.trim().length >= 2) {
      setLoadingSuggestions(true);
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const newSuggestions = await bookService.getSearchSuggestions(value);
          setSuggestions(newSuggestions);
        } catch (error) {
          console.error('Ошибка при получении подсказок:', error);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setLoadingSuggestions(false);
    }
  }, []);

  // Обработчик выбора запроса из истории или подсказок
  const handleSuggestionClick = useCallback((query: string) => {
    setSearchQuery(query);
    saveToHistory(query);
    onSearch(query);
  }, [onSearch, saveToHistory]);

  // Обработчик очистки истории поиска
  const clearSearchHistory = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  }, []);

  // Инициализация при первом использовании
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  return {
    searchQuery,
    setSearchQuery,
    searchHistory,
    suggestions,
    loadingSuggestions,
    handleSearchInputChange,
    handleSuggestionClick,
    clearSearchHistory,
    saveToHistory
  };
}; 
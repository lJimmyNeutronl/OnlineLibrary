import { useState, useCallback, useEffect } from 'react';
import { Book } from '../../../../features/books/types';
import { Notification } from '../../../../shared/ui';

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * Хук для работы со страницей управления книгами в админке
 */
export const useAdminBooks = (books: Book[]) => {
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Инициализация и обновление отфильтрованных книг при изменении основного списка
  useEffect(() => {
    setFilteredBooks(books);
    setPagination(prev => ({ ...prev, total: books.length }));
  }, [books]);

  // Поиск книг
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    if (value) {
      const filtered = books.filter(
        book => 
          book.title.toLowerCase().includes(value.toLowerCase()) ||
          book.authors.some(author => 
            author.name.toLowerCase().includes(value.toLowerCase())
          )
      );
      setFilteredBooks(filtered);
      setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
    } else {
      setFilteredBooks(books);
      setPagination(prev => ({ ...prev, current: 1, total: books.length }));
    }
  }, [books]);

  // Удаление книги
  const handleDeleteBook = useCallback((id: number) => {
    // В реальном приложении здесь будет API-запрос для удаления книги
    // Для демонстрации просто фильтруем список локально
    const updatedBooks = filteredBooks.filter(book => book.id !== id);
    setFilteredBooks(updatedBooks);
    setPagination(prev => ({ ...prev, total: updatedBooks.length }));
    Notification.success('Книга успешно удалена');
  }, [filteredBooks]);

  // Обработка изменений в пагинации
  const handleTableChange = useCallback((newPagination: any) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
      total: pagination.total
    });
  }, [pagination.total]);

  return {
    filteredBooks,
    searchText,
    pagination,
    handleSearch,
    handleDeleteBook,
    handleTableChange
  };
}; 
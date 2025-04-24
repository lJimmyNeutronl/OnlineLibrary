import { ReadingHistory, FavoriteBook, Bookmark } from './types';

/**
 * Форматирует дату в локальный формат
 * @param dateString Строка с датой
 * @returns Отформатированная дата
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Неверная дата';
  }
};

/**
 * Форматирует дату и время в локальный формат
 * @param dateString Строка с датой и временем
 * @returns Отформатированная дата и время
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Ошибка форматирования даты и времени:', error);
    return 'Неверная дата';
  }
};

/**
 * Сортирует историю чтения по дате (от новых к старым)
 * @param history Массив с историей чтения
 * @returns Отсортированный массив
 */
export const sortReadingHistory = (history: ReadingHistory[]): ReadingHistory[] => {
  return [...history].sort((a, b) => 
    new Date(b.lastReadDate).getTime() - new Date(a.lastReadDate).getTime()
  );
};

/**
 * Сортирует избранные книги по дате добавления (от новых к старым)
 * @param favorites Массив с избранными книгами
 * @returns Отсортированный массив
 */
export const sortFavoriteBooks = (favorites: FavoriteBook[]): FavoriteBook[] => {
  return [...favorites].sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
};

/**
 * Сортирует закладки по дате создания (от новых к старым)
 * @param bookmarks Массив с закладками
 * @returns Отсортированный массив
 */
export const sortBookmarks = (bookmarks: Bookmark[]): Bookmark[] => {
  return [...bookmarks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Получает полное имя автора из объекта книги
 * @param book Объект книги
 * @returns Строка с именами авторов через запятую
 */
export const getAuthorsString = (book: any): string => {
  if (!book || !book.authors || !Array.isArray(book.authors) || book.authors.length === 0) {
    return 'Неизвестный автор';
  }
  
  return book.authors.map((author: any) => author.name).join(', ');
}; 
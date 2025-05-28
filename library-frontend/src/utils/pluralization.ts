/**
 * Утилита для склонения слова "книга" в зависимости от количества
 * @param count - количество книг
 * @returns правильная форма слова "книга"
 */
export const pluralizeBooks = (count: number): string => {
  if (count === 1) return 'книга';
  if (count % 10 === 1 && count % 100 !== 11) return 'книга';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'книги';
  return 'книг';
}; 
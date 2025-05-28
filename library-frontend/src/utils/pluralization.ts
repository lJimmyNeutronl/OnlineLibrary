/**
 * Утилиты для склонения слов в зависимости от количества
 */

/**
 * Универсальная функция для склонения слов в русском языке
 * @param count - количество
 * @param forms - массив форм [единственное число, 2-4, 5 и более]
 * @returns правильная форма слова
 */
export const pluralize = (count: number, forms: [string, string, string]): string => {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
};

/**
 * Утилита для склонения слова "книга" в зависимости от количества
 * @param count - количество книг
 * @returns правильная форма слова "книга"
 */
export const pluralizeBooks = (count: number): string => {
  return pluralize(count, ['книга', 'книги', 'книг']);
};

/**
 * Утилита для склонения слова "оценка" в зависимости от количества
 * @param count - количество оценок
 * @returns правильная форма слова "оценка"
 */
export const pluralizeRatings = (count: number): string => {
  return pluralize(count, ['оценка', 'оценки', 'оценок']);
};

/**
 * Утилита для склонения слова "отзыв" в зависимости от количества
 * @param count - количество отзывов
 * @returns правильная форма слова "отзыв"
 */
export const pluralizeReviews = (count: number): string => {
  return pluralize(count, ['отзыв', 'отзыва', 'отзывов']);
}; 
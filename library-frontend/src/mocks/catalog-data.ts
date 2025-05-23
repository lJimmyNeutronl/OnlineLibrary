import { mockBooks, mockCategories } from './booksData';

// Мок данные авторов для фильтров
export const mockAuthors = [
  { id: 1, name: 'Дж. К. Роулинг', biography: 'Британская писательница, сценарист и кинопродюсер', birthYear: 1965 },
  { id: 2, name: 'Федор Достоевский', biography: 'Русский писатель, мыслитель, философ и публицист', birthYear: 1821, deathYear: 1881 },
  { id: 3, name: 'Артур Конан Дойл', biography: 'Английский писатель', birthYear: 1859, deathYear: 1930 },
  { id: 4, name: 'Юваль Ной Харари', biography: 'Израильский историк и писатель', birthYear: 1976 },
  { id: 5, name: 'Даниэль Канеман', biography: 'Израильско-американский психолог', birthYear: 1934 },
  { id: 6, name: 'Роберт Мартин', biography: 'Американский программист и автор', birthYear: 1952 },
  { id: 7, name: 'Льюис Кэрролл', biography: 'Английский писатель, математик и логик', birthYear: 1832, deathYear: 1898 },
  { id: 8, name: 'Роберт Кийосаки', biography: 'Американский предприниматель и писатель', birthYear: 1947 },
];

// Получаем уникальные жанры из существующих категорий
export const mockGenres = mockCategories.map(category => ({
  id: category.id,
  name: category.name,
  description: `Описание жанра ${category.name}`
}));

// Мок статистики для каталога
export const mockCatalogStats = {
  totalBooks: mockBooks.length,
  totalAuthors: mockAuthors.length,
  totalGenres: mockGenres.length,
  readCount: Math.floor(mockBooks.length * 0.6), // Предположим, что примерно 60% книг прочитано
};

// Функция для получения отфильтрованных книг
export const getFilteredBooks = (params: any) => {
  let filteredBooks = [...mockBooks];
  
  // Фильтрация по поиску
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(searchLower) || 
      book.author.toLowerCase().includes(searchLower)
    );
  }
  
  // Фильтрация по жанрам
  if (params.genres && params.genres.length > 0) {
    filteredBooks = filteredBooks.filter(book => 
      book.categories.some(category => params.genres.includes(category.id))
    );
  }
  
  // Фильтрация по авторам
  if (params.authors && params.authors.length > 0) {
    filteredBooks = filteredBooks.filter(book => 
      mockAuthors.some(author => params.authors.includes(author.id) && book.author === author.name)
    );
  }
  
  // Фильтрация по годам
  if (params.yearFrom || params.yearTo) {
    filteredBooks = filteredBooks.filter(book => {
      if (params.yearFrom && params.yearTo) {
        return book.publicationYear! >= params.yearFrom && book.publicationYear! <= params.yearTo;
      } else if (params.yearFrom) {
        return book.publicationYear! >= params.yearFrom;
      } else if (params.yearTo) {
        return book.publicationYear! <= params.yearTo;
      }
      return true;
    });
  }
  
  // Сортировка
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'title_asc':
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'year_desc':
        filteredBooks.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));
        break;
      case 'year_asc':
        filteredBooks.sort((a, b) => (a.publicationYear || 0) - (b.publicationYear || 0));
        break;
      case 'rating_desc':
        filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      // По умолчанию сортируем по популярности (в данном случае по ID)
      default:
        filteredBooks.sort((a, b) => a.id - b.id);
    }
  }
  
  return filteredBooks;
}; 
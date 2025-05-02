import { Book, Category } from '../services/bookService';

// Мок данные категорий
export const mockCategories: Category[] = [
  { id: 1, name: 'Художественная литература', parentCategoryId: null },
  { id: 2, name: 'Фантастика', parentCategoryId: 1 },
  { id: 3, name: 'Детективы', parentCategoryId: 1 },
  { id: 4, name: 'Романы', parentCategoryId: 1 },
  { id: 5, name: 'Научно-популярная литература', parentCategoryId: null },
  { id: 6, name: 'История', parentCategoryId: 5 },
  { id: 7, name: 'Психология', parentCategoryId: 5 },
  { id: 8, name: 'Бизнес литература', parentCategoryId: null },
  { id: 9, name: 'Детская литература', parentCategoryId: null },
  { id: 10, name: 'Компьютерная литература', parentCategoryId: 5 },
];

// Мок данные книг
export const mockBooks: Book[] = [
  {
    id: 1,
    title: 'Гарри Поттер и философский камень',
    author: 'Дж. К. Роулинг',
    description: 'История о юном волшебнике, который учится в школе чародейства и волшебства.',
    isbn: '978-5-389-07435-4',
    publicationYear: 1997,
    publisher: 'Блумсбери',
    language: 'русский',
    pageCount: 432,
    fileUrl: '/books/harry-potter-1.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFycnklMjBwb3R0ZXJ8ZW58MHx8MHx8fDA%3D',
    uploadDate: '2023-01-15T10:30:00',
    categories: [
      { id: 1, name: 'Художественная литература', parentCategoryId: null },
      { id: 2, name: 'Фантастика', parentCategoryId: 1 }
    ]
  },
  {
    id: 2,
    title: 'Преступление и наказание',
    author: 'Федор Достоевский',
    description: 'Психологический роман о внутренней борьбе и моральных дилеммах главного героя.',
    isbn: '978-5-389-07436-1',
    publicationYear: 1866,
    publisher: 'АСТ',
    language: 'русский',
    pageCount: 608,
    fileUrl: '/books/crime-and-punishment.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1576872381149-7847515ce5d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9zdG9ldnNreXxlbnwwfHwwfHx8MA%3D%3D',
    uploadDate: '2023-01-18T14:45:00',
    categories: [
      { id: 1, name: 'Художественная литература', parentCategoryId: null },
      { id: 4, name: 'Романы', parentCategoryId: 1 }
    ]
  },
  {
    id: 3,
    title: 'Шерлок Холмс: Этюд в багровых тонах',
    author: 'Артур Конан Дойл',
    description: 'Первая повесть о великом сыщике Шерлоке Холмсе и его верном помощнике докторе Ватсоне.',
    isbn: '978-5-389-07437-8',
    publicationYear: 1887,
    publisher: 'Эксмо',
    language: 'русский',
    pageCount: 256,
    fileUrl: '/books/sherlock-holmes.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1584448097639-99cf648e8969?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hlcmxvY2slMjBob2xtZXN8ZW58MHx8MHx8fDA%3D',
    uploadDate: '2023-01-20T09:15:00',
    categories: [
      { id: 1, name: 'Художественная литература', parentCategoryId: null },
      { id: 3, name: 'Детективы', parentCategoryId: 1 }
    ]
  },
  {
    id: 4,
    title: 'Сапиенс: Краткая история человечества',
    author: 'Юваль Ной Харари',
    description: 'Книга о биологической и культурной эволюции человечества с древнейших времен до наших дней.',
    isbn: '978-5-389-07438-5',
    publicationYear: 2011,
    publisher: 'Синдбад',
    language: 'русский',
    pageCount: 512,
    fileUrl: '/books/sapiens.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FwaWVuc3xlbnwwfHwwfHx8MA%3D%3D',
    uploadDate: '2023-01-25T11:20:00',
    categories: [
      { id: 5, name: 'Научно-популярная литература', parentCategoryId: null },
      { id: 6, name: 'История', parentCategoryId: 5 }
    ]
  },
  {
    id: 5,
    title: 'Думай медленно... решай быстро',
    author: 'Даниэль Канеман',
    description: 'Нобелевский лауреат исследует работу двух систем мышления: быстрой, интуитивной и эмоциональной; медленной, взвешенной и логической.',
    isbn: '978-5-389-07439-2',
    publicationYear: 2011,
    publisher: 'АСТ',
    language: 'русский',
    pageCount: 656,
    fileUrl: '/books/thinking-fast-and-slow.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGhpbmtpbmd8ZW58MHx8MHx8fDA%3D',
    uploadDate: '2023-01-30T16:10:00',
    categories: [
      { id: 5, name: 'Научно-популярная литература', parentCategoryId: null },
      { id: 7, name: 'Психология', parentCategoryId: 5 }
    ]
  },
  {
    id: 6,
    title: 'Чистый код: создание, анализ и рефакторинг',
    author: 'Роберт Мартин',
    description: 'Книга о принципах написания хорошего кода и методах рефакторинга, которые помогут улучшить существующий код.',
    isbn: '978-5-389-07440-8',
    publicationYear: 2008,
    publisher: 'Питер',
    language: 'русский',
    pageCount: 464,
    fileUrl: '/books/clean-code.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29kaW5nfGVufDB8fDB8fHww',
    uploadDate: '2023-02-05T13:25:00',
    categories: [
      { id: 5, name: 'Научно-популярная литература', parentCategoryId: null },
      { id: 10, name: 'Компьютерная литература', parentCategoryId: 5 }
    ]
  },
  {
    id: 7,
    title: 'Алиса в Стране чудес',
    author: 'Льюис Кэрролл',
    description: 'История о девочке, которая попадает в воображаемый мир, населенный странными антропоморфными существами.',
    isbn: '978-5-389-07441-5',
    publicationYear: 1865,
    publisher: 'Росмэн',
    language: 'русский',
    pageCount: 192,
    fileUrl: '/books/alice-in-wonderland.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1520467795206-62e33627e6ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWxpY2UlMjBpbiUyMHdvbmRlcmxhbmR8ZW58MHx8MHx8fDA%3D',
    uploadDate: '2023-02-10T10:50:00',
    categories: [
      { id: 1, name: 'Художественная литература', parentCategoryId: null },
      { id: 9, name: 'Детская литература', parentCategoryId: null }
    ]
  },
  {
    id: 8,
    title: 'Богатый папа, бедный папа',
    author: 'Роберт Кийосаки',
    description: 'Книга о построении финансовой грамотности и обретении финансовой независимости.',
    isbn: '978-5-389-07442-2',
    publicationYear: 1997,
    publisher: 'Попурри',
    language: 'русский',
    pageCount: 352,
    fileUrl: '/books/rich-dad-poor-dad.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1574607383476-1b79102f4ff6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9uZXl8ZW58MHx8MHx8fDA%3D',
    uploadDate: '2023-02-15T15:30:00',
    categories: [
      { id: 8, name: 'Бизнес литература', parentCategoryId: null }
    ]
  }
];

// Организуем книги по категориям
export const getBooksByCategory = (categoryId: number): Book[] => {
  return mockBooks.filter(book => 
    book.categories.some(category => category.id === categoryId)
  );
};

// Организуем книги по подстроке в названии или имени автора
export const searchBooksByQuery = (query: string): Book[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockBooks.filter(book => 
    book.title.toLowerCase().includes(lowercaseQuery) || 
    book.author.toLowerCase().includes(lowercaseQuery)
  );
};

// Создаем пагинированный ответ для имитации API
export const createPagedResponse = <T>(
  items: T[],
  page: number = 0,
  size: number = 10
): { content: T[], totalElements: number, totalPages: number, size: number, number: number } => {
  const start = page * size;
  const end = start + size;
  const content = items.slice(start, end);
  
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page
  };
}; 
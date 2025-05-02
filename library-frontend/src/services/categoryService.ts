import API from './api';
import { mockCategories } from '../mocks/booksData';

export interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
}

export interface CategoryWithCount extends Category {
  bookCount: number;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

// Кэши для категорий
let allCategoriesCache: Category[] | null = null;
let rootCategoriesCache: Category[] | null = null;
let categoryHierarchyCache: CategoryWithSubcategories[] | null = null;
let subcategoriesCache: Record<number, Category[]> = {};
let categoriesWithBookCountCache: CategoryWithCount[] | null = null;

// Время жизни кэша в миллисекундах (5 минут)
const CACHE_TTL = 5 * 60 * 1000;

// Временные метки последнего обновления кэшей
let allCategoriesTimestamp = 0;
let rootCategoriesTimestamp = 0;
let categoryHierarchyTimestamp = 0;
let categoriesWithBookCountTimestamp = 0;

const categoryService = {
  // Функция для очистки всех кэшей
  clearCache() {
    allCategoriesCache = null;
    rootCategoriesCache = null;
    categoryHierarchyCache = null;
    subcategoriesCache = {};
    categoriesWithBookCountCache = null;
    
    allCategoriesTimestamp = 0;
    rootCategoriesTimestamp = 0;
    categoryHierarchyTimestamp = 0;
    categoriesWithBookCountTimestamp = 0;
  },
  
  // Проверка актуальности кэша
  isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL;
  },
  
  // Получение всех категорий
  async getAllCategories(): Promise<Category[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      if (allCategoriesCache && this.isValidCache(allCategoriesTimestamp)) {
        console.log('Используем кэшированные данные для всех категорий');
        return allCategoriesCache;
      }
      
      const response = await API.get('/categories');
      
      // Обновляем кэш и временную метку
      allCategoriesCache = response.data;
      allCategoriesTimestamp = Date.now();
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении категорий, используем мок данные:', error);
      // Используем мок данные при ошибке API
      allCategoriesCache = mockCategories;
      allCategoriesTimestamp = Date.now();
      return mockCategories;
    }
  },

  // Получение корневых категорий (категорий без родителя)
  async getRootCategories(): Promise<Category[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      if (rootCategoriesCache && this.isValidCache(rootCategoriesTimestamp)) {
        console.log('Используем кэшированные данные для корневых категорий');
        return rootCategoriesCache;
      }
      
      const response = await API.get('/categories/root');
      
      // Обновляем кэш и временную метку
      rootCategoriesCache = response.data;
      rootCategoriesTimestamp = Date.now();
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении корневых категорий, используем мок данные:', error);
      // Фильтруем мок данные по корневым категориям (где parentCategoryId === null)
      const rootCategories = mockCategories.filter(category => category.parentCategoryId === null);
      rootCategoriesCache = rootCategories;
      rootCategoriesTimestamp = Date.now();
      return rootCategories;
    }
  },

  // Получение подкатегорий для указанной категории с ленивой загрузкой
  async getSubcategories(categoryId: number): Promise<Category[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      if (subcategoriesCache[categoryId] && this.isValidCache(Date.now())) {
        console.log(`Используем кэшированные данные для подкатегорий категории ${categoryId}`);
        return subcategoriesCache[categoryId];
      }
      
      const response = await API.get(`/categories/${categoryId}/subcategories`);
      
      // Обновляем кэш подкатегорий
      subcategoriesCache[categoryId] = response.data;
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении подкатегорий для категории ${categoryId}, используем мок данные:`, error);
      // Фильтруем мок данные по подкатегориям (где parentCategoryId === categoryId)
      const subcategories = mockCategories.filter(category => category.parentCategoryId === categoryId);
      subcategoriesCache[categoryId] = subcategories;
      return subcategories;
    }
  },

  // Получение категории по ID
  async getCategoryById(categoryId: number): Promise<Category> {
    try {
      // Пытаемся найти категорию в существующих кэшах
      if (allCategoriesCache) {
        const cachedCategory = allCategoriesCache.find(cat => cat.id === categoryId);
        if (cachedCategory) {
          return cachedCategory;
        }
      }
      
      const response = await API.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении категории с ID ${categoryId}, используем мок данные:`, error);
      // Ищем категорию в мок данных
      const category = mockCategories.find(cat => cat.id === categoryId);
      if (category) {
        return category;
      }
      throw new Error(`Категория с ID ${categoryId} не найдена`);
    }
  },

  // Получение количества книг для каждой категории
  async getCategoriesWithBookCount(): Promise<CategoryWithCount[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      if (categoriesWithBookCountCache && this.isValidCache(categoriesWithBookCountTimestamp)) {
        console.log('Используем кэшированные данные для категорий с количеством книг');
        return categoriesWithBookCountCache;
      }
      
      // Попробуем получить данные с сервера
      const response = await API.get('/categories/book-count');
      
      // Если запрос успешен, обновляем кэш
      categoriesWithBookCountCache = response.data;
      categoriesWithBookCountTimestamp = Date.now();
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении категорий с количеством книг:', error);
      
      try {
        // Если основной эндпоинт недоступен, попробуем получить все категории
        // и вычислить количество книг через запрос к эндпоинту книг по категории
        const categories = await this.getAllCategories();
        const categoriesWithCount: CategoryWithCount[] = [];
        
        for (const category of categories) {
          try {
            // Получаем количество книг для категории через API книг
            const booksResponse = await API.get(`/books/category/${category.id}`, {
              params: { page: 0, size: 1 } // Запрашиваем только 1 книгу для экономии трафика
            });
            
            // Формируем объект категории с количеством книг
            categoriesWithCount.push({
              ...category,
              bookCount: booksResponse.data.totalElements || 0
            });
          } catch (categoryError) {
            // Если не удалось получить количество книг для этой категории, ставим 0
            categoriesWithCount.push({
              ...category,
              bookCount: 0
            });
          }
        }
        
        // Обновляем кэш и временную метку
        categoriesWithBookCountCache = categoriesWithCount;
        categoriesWithBookCountTimestamp = Date.now();
        
        return categoriesWithCount;
      } catch (fallbackError) {
        console.error('Критическая ошибка при попытке получить количество книг для категорий:', fallbackError);
        
        // В случае полного сбоя, используем категории с нулевым количеством книг
        const categoriesWithZeroCount = (await this.getAllCategories()).map(category => ({
          ...category,
          bookCount: 0
        }));
        
        // Обновляем кэш 
        categoriesWithBookCountCache = categoriesWithZeroCount;
        categoriesWithBookCountTimestamp = Date.now();
        
        return categoriesWithZeroCount;
      }
    }
  },

  // Получение иерархической структуры категорий
  async getCategoryHierarchy(): Promise<CategoryWithSubcategories[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      if (categoryHierarchyCache && this.isValidCache(categoryHierarchyTimestamp)) {
        console.log('Используем кэшированные данные для иерархии категорий');
        return categoryHierarchyCache;
      }
      
      const rootCategories = await this.getRootCategories();
      
      const categoriesWithSubcategories = await Promise.all(
        rootCategories.map(async (rootCategory) => {
          const subcategories = await this.getSubcategories(rootCategory.id);
          return {
            ...rootCategory,
            subcategories
          };
        })
      );
      
      // Обновляем кэш и временную метку
      categoryHierarchyCache = categoriesWithSubcategories;
      categoryHierarchyTimestamp = Date.now();
      
      return categoriesWithSubcategories;
    } catch (error) {
      console.error('Ошибка при получении иерархии категорий, используем мок данные:', error);
      
      try {
        // Используем мок данные
        const rootCategories = mockCategories.filter(category => category.parentCategoryId === null);
        
        const categoriesWithSubcategories = rootCategories.map(rootCategory => {
          const subcategories = mockCategories.filter(
            category => category.parentCategoryId === rootCategory.id
          );
          return {
            ...rootCategory,
            subcategories
          };
        });
        
        // Обновляем кэш и временную метку
        categoryHierarchyCache = categoriesWithSubcategories;
        categoryHierarchyTimestamp = Date.now();
        
        return categoriesWithSubcategories;
      } catch (innerError) {
        console.error('Критическая ошибка при работе с мок данными:', innerError);
        throw innerError;
      }
    }
  }
};

export default categoryService; 
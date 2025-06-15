import API from './api';
import { getCached, updateCache, isValidCache } from '../utils/cache';
import type { Category, CategoryWithCount, CategoryWithSubcategories } from '../types/category';

// Кэши для категорий
let allCategoriesCache: Category[] | null = null;
let rootCategoriesCache: Category[] | null = null;
let categoryHierarchyCache: CategoryWithSubcategories[] | null = null;
let subcategoriesCache: Record<number, Category[]> = {};
let categoriesWithBookCountCache: CategoryWithCount[] | null = null;

// Временные метки последнего обновления кэшей
let allCategoriesTimestamp = 0;
let rootCategoriesTimestamp = 0;
let categoryHierarchyTimestamp = 0;
let subcategoriesTimestamps: Record<number, number> = {};
let categoriesWithBookCountTimestamp = 0;

/**
 * Сброс всех кэшей и временных меток
 */
function resetAllCaches(): void {
  allCategoriesCache = null;
  rootCategoriesCache = null;
  categoryHierarchyCache = null;
  categoriesWithBookCountCache = null;
  subcategoriesCache = {};
  subcategoriesTimestamps = {};

  allCategoriesTimestamp = 0;
  rootCategoriesTimestamp = 0;
  categoryHierarchyTimestamp = 0;
  categoriesWithBookCountTimestamp = 0;
}

const categoryService = {
  // Функция для очистки всех кэшей
  clearCache(): void {
    resetAllCaches();
  },
  
  // Получение всех категорий
  async getAllCategories(): Promise<Category[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      const cached = getCached(allCategoriesCache, allCategoriesTimestamp);
      if (cached) {
        console.log('Используем кэшированные данные для всех категорий');
        return cached;
      }
      
      const response = await API.get('/categories');
      
      // Обновляем кэш и временную метку
      const { data, timestamp } = updateCache(response.data);
      allCategoriesCache = data;
      allCategoriesTimestamp = timestamp;
      
      return data;
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      throw new Error('Не удалось загрузить категории');
    }
  },

  // Получение корневых категорий (категорий без родителя)
  async getRootCategories(): Promise<Category[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      const cached = getCached(rootCategoriesCache, rootCategoriesTimestamp);
      if (cached) {
        console.log('Используем кэшированные данные для корневых категорий');
        return cached;
      }
      
      const response = await API.get('/categories/root');
      
      // Проверяем, что response.data - это массив
      if (!Array.isArray(response.data)) {
        console.error('API /categories/root вернул не массив:', response.data);
        throw new Error('Некорректный формат данных от сервера');
      }
      
      // Обновляем кэш и временную метку
      const { data, timestamp } = updateCache(response.data);
      rootCategoriesCache = data;
      rootCategoriesTimestamp = timestamp;
      
      return data;
    } catch (error) {
      console.error('Ошибка при получении корневых категорий:', error);
      throw new Error('Не удалось загрузить корневые категории');
    }
  },

  // Получение подкатегорий для указанной категории с ленивой загрузкой
  async getSubcategories(categoryId: number): Promise<Category[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      if (subcategoriesCache[categoryId] && isValidCache(subcategoriesTimestamps[categoryId])) {
        console.log(`Используем кэшированные данные для подкатегорий категории ${categoryId}`);
        return subcategoriesCache[categoryId];
      }
      
      const response = await API.get(`/categories/${categoryId}/subcategories`);
      
      // Обновляем кэш подкатегорий и временную метку
      subcategoriesCache[categoryId] = response.data;
      subcategoriesTimestamps[categoryId] = Date.now();
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении подкатегорий для категории ${categoryId}:`, error);
      throw new Error(`Не удалось загрузить подкатегории для категории ${categoryId}`);
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
      console.error(`Ошибка при получении категории с ID ${categoryId}:`, error);
      throw new Error(`Категория с ID ${categoryId} не найдена`);
    }
  },

  // Получение количества книг для каждой категории
  async getCategoriesWithBookCount(): Promise<CategoryWithCount[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      const cached = getCached(categoriesWithBookCountCache, categoriesWithBookCountTimestamp);
      if (cached) {
        console.log('Используем кэшированные данные для категорий с количеством книг');
        return cached;
      }
      
      // Попробуем получить данные с сервера
      try {
        const response = await API.get('/categories/book-count');
        
        // Если запрос успешен, обновляем кэш
        const { data, timestamp } = updateCache(response.data);
        categoriesWithBookCountCache = data;
        categoriesWithBookCountTimestamp = timestamp;
        
        return data;
      } catch (apiError) {
        console.warn('Основной эндпоинт /categories/book-count недоступен, используем альтернативный метод');
        
        // Если основной эндпоинт недоступен, получаем все категории
        // и вычисляем количество книг параллельно
        const categories = await this.getAllCategories();
        
        const categoriesWithCount = await Promise.all(
          categories.map(async (category): Promise<CategoryWithCount> => {
            try {
              const res = await API.get(`/books/category/${category.id}`, { 
                params: { page: 0, size: 1 } 
              });
              return { ...category, bookCount: res.data.totalElements || 0 };
            } catch {
              return { ...category, bookCount: 0 };
            }
          })
        );
        
        // Обновляем кэш и временную метку
        const { data, timestamp } = updateCache(categoriesWithCount);
        categoriesWithBookCountCache = data;
        categoriesWithBookCountTimestamp = timestamp;
        
        return data;
      }
    } catch (error) {
      console.error('Критическая ошибка при получении категорий с количеством книг:', error);
      throw new Error('Не удалось загрузить категории с количеством книг');
    }
  },

  // Получение иерархической структуры категорий
  async getCategoryHierarchy(): Promise<CategoryWithSubcategories[]> {
    try {
      // Проверяем, есть ли актуальные данные в кэше
      const cached = getCached(categoryHierarchyCache, categoryHierarchyTimestamp);
      if (cached) {
        console.log('Используем кэшированные данные для иерархии категорий');
        return cached;
      }
      
      const rootCategories = await this.getRootCategories();
      
      // Добавляем проверку, что rootCategories - это массив
      if (!Array.isArray(rootCategories)) {
        console.error('getRootCategories вернул не массив:', rootCategories);
        throw new Error('Некорректный формат данных от сервера');
      }
      
      const categoriesWithSubcategories = await Promise.all(
        rootCategories.map(async (rootCategory): Promise<CategoryWithSubcategories> => {
          const subcategories = await this.getSubcategories(rootCategory.id);
          return {
            ...rootCategory,
            subcategories: Array.isArray(subcategories) ? subcategories : []
          };
        })
      );
      
      // Обновляем кэш и временную метку
      const { data, timestamp } = updateCache(categoriesWithSubcategories);
      categoryHierarchyCache = data;
      categoryHierarchyTimestamp = timestamp;
      
      return data;
    } catch (error) {
      console.error('Ошибка при получении иерархии категорий:', error);
      throw new Error('Не удалось загрузить иерархию категорий');
    }
  }
};

export default categoryService; 
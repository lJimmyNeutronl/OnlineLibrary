import { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import type { Category } from '../types/category';

export interface CategoryWithBookCount extends Category {
  bookCount: number;
  isExpanded?: boolean;
  subcategories?: CategoryWithBookCount[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryWithBookCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем иерархию категорий
        const categoryHierarchy = await categoryService.getCategoryHierarchy();
        
        // Получаем данные о количестве книг в каждой категории
        const categoriesWithBookCount = await categoryService.getCategoriesWithBookCount();
        
        // Создаем словарь для быстрого доступа к количеству книг по ID категории
        const bookCountMap = categoriesWithBookCount.reduce((map, category) => {
          map[category.id] = category.bookCount;
          return map;
        }, {} as Record<number, number>);
        
        // Преобразуем данные с добавлением фактического количества книг и флага expanded
        const processedCategories = categoryHierarchy.map(rootCategory => {
          // Получаем количество книг для корневой категории из словаря
          const rootBookCount = bookCountMap[rootCategory.id] || 0;
          
          // Обрабатываем подкатегории
          const processedSubcategories = rootCategory.subcategories.map(subcategory => ({
            ...subcategory,
            bookCount: bookCountMap[subcategory.id] || 0, // Фактическое количество книг для подкатегории
          }));
          
          return {
            ...rootCategory,
            bookCount: rootBookCount,
            isExpanded: false, // Изначально все категории свернуты
            subcategories: processedSubcategories
          };
        });
        
        setCategories(processedCategories);
      } catch (err) {
        setError('Не удалось загрузить категории. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId
          ? { ...category, isExpanded: !category.isExpanded }
          : category
      )
    );
  };

  return {
    categories,
    loading,
    error,
    toggleCategory,
  };
}; 
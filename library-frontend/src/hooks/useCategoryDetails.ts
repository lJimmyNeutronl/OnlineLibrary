import { useEffect, useState } from 'react';
import categoryService from '../services/categoryService';

interface CategoryDetails {
  id: number;
  name: string;
  parentCategory?: {
    id: number;
    name: string;
  };
}

export const useCategoryDetails = (categoryId?: string) => {
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      setLoading(true);
      try {
        const categoryData = await categoryService.getCategoryById(Number(categoryId));
        
        let parentCategory = undefined;
        if (categoryData.parentCategoryId) {
          const allCategories = await categoryService.getAllCategories();
          const parent = allCategories.find(c => c.id === categoryData.parentCategoryId);
          if (parent) {
            parentCategory = { id: parent.id, name: parent.name };
          }
        }

        setCategory({ 
          id: categoryData.id, 
          name: categoryData.name, 
          parentCategory 
        });
      } catch (error) {
        console.error('Ошибка при получении данных категории:', error);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  return { category, loading };
}; 
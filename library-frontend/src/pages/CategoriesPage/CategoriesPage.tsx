import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AiOutlineBook } from 'react-icons/ai';
import { Typography, Button, Spin, Empty } from '../../shared/ui';
import {
  CategoriesPageContainer,
  CategoriesPageContent,
  CategoriesSection,
  CategoriesGrid,
  CategoryCard,
  CategoryIcon,
  CategoryInfo,
  CategoryTitle,
  CategoryCount
} from './CategoriesPage.styles';
import { useBooks } from '../../features/books';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading, error, loadCategories } = useBooks();

  useEffect(() => {
    // Загрузка категорий при монтировании компонента
    loadCategories();
  }, [loadCategories]);

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/categories/${categoryId}`);
  };

  if (isLoading) {
    return (
      <CategoriesPageContainer>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </CategoriesPageContainer>
    );
  }

  if (error) {
    return (
      <CategoriesPageContainer>
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'red' }}>
          <Typography.Text type="danger">{error}</Typography.Text>
        </div>
      </CategoriesPageContainer>
    );
  }

  if (categories.length === 0) {
    return (
      <CategoriesPageContainer>
        <Empty description="Категории не найдены" />
      </CategoriesPageContainer>
    );
  }

  // Заглушка для количества книг в категории 
  // (в реальном приложении должно приходить с бэкенда)
  const getCategoryBooksCount = () => {
    // Mock data for now
    return Math.floor(Math.random() * 50) + 1;
  };

  return (
    <CategoriesPageContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <CategoriesPageContent>
          <motion.div variants={slideUp}>
            <Typography.Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>
              Категории книг
            </Typography.Title>
            
            <CategoriesSection>
              <Typography.Paragraph style={{ marginBottom: '30px' }}>
                Выберите интересующую вас категорию, чтобы увидеть соответствующие книги.
              </Typography.Paragraph>
              
              <CategoriesGrid
                as={motion.div}
                variants={staggerContainer}
              >
                {categories.map((category) => (
                  <motion.div 
                    key={category.id}
                    variants={slideUp}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CategoryCard onClick={() => handleCategoryClick(category.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <CategoryIcon>
                          <AiOutlineBook color="white" size={20} />
                        </CategoryIcon>
                        <CategoryInfo>
                          <CategoryTitle>{category.name}</CategoryTitle>
                          <CategoryCount>{getCategoryBooksCount()} книг</CategoryCount>
                        </CategoryInfo>
                      </div>
                      
                      <Button 
                        type="primary"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleCategoryClick(category.id);
                        }}
                        style={{ width: '100%', marginTop: '10px' }}
                      >
                        Просмотреть
                      </Button>
                    </CategoryCard>
                  </motion.div>
                ))}
              </CategoriesGrid>
            </CategoriesSection>
          </motion.div>
        </CategoriesPageContent>
      </motion.div>
    </CategoriesPageContainer>
  );
}; 
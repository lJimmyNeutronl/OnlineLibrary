import { useCallback, memo } from 'react';
import { Typography, Button, Spin, Empty } from '@components/common';
import AnimatedBackground from '@components/common/AnimatedBackground';
import { AiOutlineBook, AiOutlineFolder, AiOutlineFolderOpen } from 'react-icons/ai';
import { MdExpandMore, MdChevronRight } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import CategoryDescription from '@components/categories/CategoryDescription';
import { useCategories, CategoryWithBookCount } from '@hooks/useCategories';
import { categoryStyles } from '@styles/categories';
import '@styles/common.css';
import styles from './CategoriesPage.module.css';

const { Paragraph, Text } = Typography;

// Создаем мемоизированный компонент для отображения подкатегории
const SubcategoryItem = memo(({ subcategory, onNavigate }: { 
  subcategory: CategoryWithBookCount, 
  onNavigate: (id: number) => void 
}) => {
  return (
    <div
      style={categoryStyles.subcategoryContainer}
      onClick={() => onNavigate(subcategory.id)}
    >
      <div className={styles.categoryItemsContainer}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={categoryStyles.iconWrapper}>
            <AiOutlineBook color="white" size={18} />
          </div>
          <CategoryDescription 
            name={subcategory.name}
            bookCount={subcategory.bookCount}
            isSubcategory={true}
          />
        </div>
        <Button 
          size="small"
          className={styles.subcategoryButton}
        >
          Перейти
        </Button>
      </div>
    </div>
  );
});

SubcategoryItem.displayName = 'SubcategoryItem';

// Создаем мемоизированный компонент для отображения категории
const CategoryItem = memo(({ category, onToggle, onNavigate }: { 
  category: CategoryWithBookCount, 
  onToggle: (id: number) => void, 
  onNavigate: (id: number) => void 
}) => {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const containerStyle = {
    ...categoryStyles.categoryContainer,
    marginBottom: category.isExpanded && hasSubcategories ? '8px' : '0'
  };

  return (
    <div>
      {/* Корневая категория */}
      <div style={containerStyle}>
        <div className={styles.categoryItemsContainer}>
          <div 
            className={styles.categoryContentContainer}
            onClick={() => onNavigate(category.id)}
          >
            <div style={categoryStyles.categoryIconWrapper}>
              {category.isExpanded ? 
                <AiOutlineFolderOpen color="white" size={22} /> : 
                <AiOutlineFolder color="white" size={22} />
              }
            </div>
            <CategoryDescription 
              name={category.name}
              bookCount={category.bookCount}
              isSubcategory={false}
            />
          </div>
          
          <div className={styles.categoryActionsContainer}>
            <Button 
              type="primary"
              onClick={() => onNavigate(category.id)}
              className={styles.viewButton}
            >
              Просмотреть
            </Button>
            
            {hasSubcategories && (
              <div 
                onClick={() => onToggle(category.id)}
                style={categoryStyles.expandButton}
              >
                {category.isExpanded ? 
                  <MdExpandMore size={24} color="#3769f5" /> : 
                  <MdChevronRight size={24} color="#3769f5" />
                }
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Подкатегории */}
      {category.isExpanded && hasSubcategories && (
        <div style={categoryStyles.subcategoriesWrapper}>
          {category.subcategories!.map((subcategory) => (
            <SubcategoryItem 
              key={subcategory.id} 
              subcategory={subcategory} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      )}
    </div>
  );
});

CategoryItem.displayName = 'CategoryItem';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { categories, loading, error, toggleCategory } = useCategories();
  
  // Используем useCallback для мемоизации обработчика навигации
  const navigateToCategory = useCallback((categoryId: number) => {
    navigate(`/categories/${categoryId}`);
  }, [navigate]);

  // Функции для рендеринга различных состояний
  const renderLoading = () => (
    <div className={styles.loadingContainer}>
      <Spin size="large" />
    </div>
  );

  const renderError = () => (
    <div className={styles.errorContainer}>
      <Text type="danger" style={{ fontSize: '16px' }}>{error}</Text>
      <br />
      <Button 
        type="primary" 
        onClick={() => window.location.reload()} 
        className={styles.retryButton}
      >
        Попробовать снова
      </Button>
    </div>
  );

  const renderEmpty = () => (
    <Empty description="Категории не найдены" />
  );

  const renderCategories = () => (
    <div className={styles.categoriesContainer}>
      {categories.map((category) => (
        <CategoryItem 
          key={category.id} 
          category={category} 
          onToggle={toggleCategory} 
          onNavigate={navigateToCategory} 
        />
      ))}
    </div>
  );

  // Определяем контент для отображения
  const getContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    if (categories.length === 0) return renderEmpty();
    return renderCategories();
  };

  return (
    <AnimatedBackground>
      <div className={styles.pageContainer}>
        <div>
          <div className={styles.titleContainer}>
            <h1 className="page-title">
              Категории книг
            </h1>
          </div>
          
          <div className={styles.contentContainer}>
            <Paragraph className="info-paragraph">
              Выберите интересующую вас категорию, чтобы увидеть соответствующие книги.
              Навигация по категориям поможет вам быстро найти нужную литературу.
            </Paragraph>
            
            {getContent()}
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default CategoriesPage; 
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import Typography from '../components/common/Typography';
import Button from '../components/common/Button';
import { AiOutlineBook, AiOutlineFolder, AiOutlineFolderOpen } from 'react-icons/ai';
import { MdExpandMore, MdChevronRight } from 'react-icons/md';
import { FaBook, FaBookOpen, FaBookReader, FaPencilAlt, FaGraduationCap, FaFeatherAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import categoryService, { Category, CategoryWithSubcategories, CategoryWithCount } from '../services/categoryService';
import Divider from '../components/common/Divider';
import Spin from '../components/common/Spin';
import Empty from '../components/common/Empty';

const { Title, Paragraph, Text } = Typography;

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

// Стили для анимаций фоновых элементов
const floatAnimation = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [0, -15, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

const rotateAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 60,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1, opacity: 0.05 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.05, 0.08, 0.05],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

interface CategoryWithBookCount extends Category {
  bookCount: number;
  isExpanded?: boolean;
  subcategories?: CategoryWithBookCount[];
}

// Создаем мемоизированный компонент для отображения подкатегории
const SubcategoryItem = memo(({ subcategory, onNavigate }: { subcategory: CategoryWithBookCount, onNavigate: (id: number) => void }) => {
  return (
    <motion.div
      key={subcategory.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ 
        background: 'rgba(142, 84, 233, 0.05)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '8px',
        border: '1px solid rgba(142, 84, 233, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onNavigate(subcategory.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #8e54e9 0%, #4776e6 100%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '14px'
          }}>
            <AiOutlineBook color="white" size={18} />
          </div>
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#8e54e9'
            }}>
              {subcategory.name}
            </h4>
            <p style={{ 
              margin: '3px 0 0 0', 
              fontSize: '13px',
              color: '#666'
            }}>
              {subcategory.bookCount} {subcategory.bookCount === 1 ? 'книга' : 
                subcategory.bookCount % 10 === 1 && subcategory.bookCount % 100 !== 11 ? 'книга' :
                subcategory.bookCount % 10 >= 2 && subcategory.bookCount % 10 <= 4 && 
                (subcategory.bookCount % 100 < 10 || subcategory.bookCount % 100 >= 20) ? 'книги' : 'книг'}
            </p>
          </div>
        </div>
        <Button 
          size="small"
          style={{ 
            background: 'rgba(142, 84, 233, 0.15)',
            borderColor: 'rgba(142, 84, 233, 0.3)',
            color: '#8e54e9',
          }}
        >
          Перейти
        </Button>
      </div>
    </motion.div>
  );
});

// Создаем мемоизированный компонент для отображения категории
const CategoryItem = memo(({ category, onToggle, onNavigate }: { 
  category: CategoryWithBookCount, 
  onToggle: (id: number) => void, 
  onNavigate: (id: number) => void 
}) => {
  return (
    <motion.div 
      key={category.id}
      variants={slideUp}
    >
      {/* Корневая категория */}
      <div 
        style={{ 
          background: 'rgba(55, 105, 245, 0.05)',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid rgba(55, 105, 245, 0.1)',
          transition: 'all 0.3s ease',
          marginBottom: category.isExpanded && category.subcategories && category.subcategories.length > 0 ? '8px' : '0'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            flex: 1
          }} onClick={() => onNavigate(category.id)}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              boxShadow: '0 2px 8px rgba(55, 105, 245, 0.2)'
            }}>
              {category.isExpanded ? 
                <AiOutlineFolderOpen color="white" size={22} /> : 
                <AiOutlineFolder color="white" size={22} />
              }
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#3769f5'
              }}>
                {category.name}
              </h3>
              <p style={{ 
                margin: '5px 0 0 0', 
                fontSize: '14px',
                color: '#666'
              }}>
                {category.bookCount} {category.bookCount === 1 ? 'книга' : 
                  category.bookCount % 10 === 1 && category.bookCount % 100 !== 11 ? 'книга' :
                  category.bookCount % 10 >= 2 && category.bookCount % 10 <= 4 && 
                  (category.bookCount % 100 < 10 || category.bookCount % 100 >= 20) ? 'книги' : 'книг'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              type="primary"
              onClick={() => onNavigate(category.id)}
              style={{ marginRight: '8px' }}
            >
              Просмотреть
            </Button>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <div 
                onClick={() => onToggle(category.id)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(55, 105, 245, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
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
      {category.isExpanded && category.subcategories && category.subcategories.length > 0 && (
        <div style={{ 
          marginLeft: '30px',
          borderLeft: '1px dashed rgba(55, 105, 245, 0.3)',
          paddingLeft: '20px'
        }}>
          {category.subcategories.map((subcategory) => (
            <SubcategoryItem 
              key={subcategory.id} 
              subcategory={subcategory} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
});

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithBookCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
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
        console.error('Ошибка при загрузке категорий:', err);
        setError('Не удалось загрузить категории. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Используем useCallback для мемоизации обработчиков событий
  const toggleCategory = useCallback((categoryId: number) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId
          ? { ...category, isExpanded: !category.isExpanded }
          : category
      )
    );
  }, []);
  
  const navigateToCategory = useCallback((categoryId: number) => {
    navigate(`/categories/${categoryId}`);
  }, [navigate]);
  
  // Мемоизируем часто используемые значения
  const hasCategories = useMemo(() => categories.length > 0, [categories]);
  const categoriesContent = useMemo(() => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '50px 0' 
        }}>
          <Spin size="large" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '30px',
          color: '#ff4d4f'
        }}>
          <Text type="danger" style={{ fontSize: '16px' }}>{error}</Text>
          <br />
          <Button 
            type="primary" 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px' }}
          >
            Попробовать снова
          </Button>
        </div>
      );
    }
    
    if (!hasCategories) {
      return <Empty description="Категории не найдены" />;
    }
    
    return (
      <motion.div
        variants={staggerContainer}
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {categories.map((category) => (
          <CategoryItem 
            key={category.id} 
            category={category} 
            onToggle={toggleCategory} 
            onNavigate={navigateToCategory} 
          />
        ))}
      </motion.div>
    );
  }, [categories, hasCategories, loading, error, toggleCategory, navigateToCategory]);

  return (
    <div style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      padding: '40px 0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Декоративные элементы, связанные с книгами */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          top: '-150px',
          right: '-100px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.08,
          transform: 'rotate(15deg)',
        }}
      >
        <FaBookOpen size={300} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          bottom: '-100px',
          left: '-100px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.06,
        }}
      >
        <FaGraduationCap size={250} color="#3769f5" />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pulseAnimation}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          top: '30%',
          right: '10%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FaPencilAlt size={150} color="#3769f5" />
      </motion.div>

      {/* Новый элемент в левом верхнем углу */}
      <motion.div 
        initial={{ rotate: -15, x: 0 }}
        animate={{
          rotate: [-15, -10, -15],
          x: [0, 10, 0],
          transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }}
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          top: '10%',
          left: '5%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.07,
        }}
      >
        <FaFeatherAlt size={200} color="#3769f5" />
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        style={{ 
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 16px',
          position: 'relative',
          zIndex: 2 
        }}
      >
        <motion.div variants={slideUp}>
          <Title style={{ 
            textAlign: 'center', 
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Категории книг
          </Title>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px'
          }}>
            <Paragraph className="info-paragraph">
              Выберите интересующую вас категорию, чтобы увидеть соответствующие книги.
              Навигация по категориям поможет вам быстро найти нужную литературу.
            </Paragraph>
            
            {categoriesContent}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CategoriesPage; 
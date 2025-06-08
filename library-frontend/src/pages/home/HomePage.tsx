import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// Компоненты
import { Spin, Button } from '@components/common';
import AnimatedBackground from '@components/common/AnimatedBackground';
import SectionHeader from '@components/common/SectionHeader';
import SearchInput from '@components/search/SearchInput';
import BookCard from '@components/book-card/BookCard';

// Сервисы и типы
import bookService, { Book } from '@services/bookService';
import categoryService from '@services/categoryService';
import { CategoryWithCount } from '../../types/category';

// Константы и стили
import { ANIMATIONS, CATEGORY_ICONS, DATA_LIMITS, TEXTS } from '../../constants/homePage';
import styles from './HomePage.module.css';
import '../../components/book-card/BookCard.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояния
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [featuredBooksLoading, setFeaturedBooksLoading] = useState<boolean>(true);
  const [popularCategories, setPopularCategories] = useState<CategoryWithCount[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);
  const [latestBooksLoading, setLatestBooksLoading] = useState<boolean>(true);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        // Параллельная загрузка всех данных
        const [popularBooksData, latestBooksData, categoriesData] = await Promise.all([
          bookService.getPopularBooks(DATA_LIMITS.POPULAR_BOOKS),
          bookService.getLatestBooks(DATA_LIMITS.LATEST_BOOKS),
          categoryService.getCategoriesWithBookCount()
        ]);

        setPopularBooks(popularBooksData);
        setLatestBooks(latestBooksData);
        
        // Сортируем категории по количеству книг и берем топ
        const topCategories = [...categoriesData]
          .sort((a, b) => b.bookCount - a.bookCount)
          .slice(0, DATA_LIMITS.TOP_CATEGORIES);
        setPopularCategories(topCategories);

      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setFeaturedBooksLoading(false);
        setLatestBooksLoading(false);
        setCategoriesLoading(false);
      }
    };

    loadData();
  }, []);

  // Обработчик поиска
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <AnimatedBackground>
      <div className={styles.heroSection}>
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={ANIMATIONS.fadeIn}
          className={styles.heroContainer}
        >
          {/* Hero секция */}
          <motion.div variants={ANIMATIONS.slideUp} className={styles.heroContent}>
            <div className={styles.heroTitle}>
              <h1 className={styles.heroTitleText}>
                {TEXTS.HERO_TITLE}
              </h1>
            </div>
            <p className={styles.heroDescription}>
              {TEXTS.HERO_DESCRIPTION}
            </p>
          </motion.div>

          {/* Поисковая строка */}
          <motion.div variants={ANIMATIONS.slideUp} className={styles.searchContainer}>
            <SearchInput 
              onSearch={handleSearch}
              placeholder={TEXTS.SEARCH_PLACEHOLDER}
            />
          </motion.div>

          {/* Новые поступления */}
          <LatestBooksSection 
            books={latestBooks}
            loading={latestBooksLoading}
          />

          {/* Популярные категории */}
          <PopularCategoriesSection 
            categories={popularCategories}
            loading={categoriesLoading}
          />
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

// Компонент секции с новыми поступлениями
interface LatestBooksSectionProps {
  books: Book[];
  loading: boolean;
}

const LatestBooksSection: React.FC<LatestBooksSectionProps> = ({ books, loading }) => (
  <div className={styles.section}>
    <SectionHeader title={TEXTS.SECTION_LATEST_BOOKS} />
    
    {loading ? (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    ) : (
      <div className={styles.booksSection}>
        <div className="book-grid">
          {books.map((book) => (
            <motion.div 
              key={book.id} 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <BookCard
                id={book.id}
                title={book.title}
                author={book.author}
                coverImageUrl={book.coverImageUrl || '/src/assets/images/placeholder.png'}
                publicationYear={book.publicationYear}
                showRating={true}
                rating={book.rating || 0}
              />
            </motion.div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Компонент секции с популярными категориями
interface PopularCategoriesSectionProps {
  categories: CategoryWithCount[];
  loading: boolean;
}

const PopularCategoriesSection: React.FC<PopularCategoriesSectionProps> = ({ 
  categories, 
  loading 
}) => (
  <div className={styles.section}>
    <SectionHeader title={TEXTS.SECTION_POPULAR_CATEGORIES} />

    {loading ? (
      <div className={styles.categoriesLoadingContainer}>
        <Spin size="large" />
      </div>
    ) : (
      <div className={styles.categoriesContainer}>
        {categories.map((category, index) => {
          const IconComponent = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
          const isSecondary = index === 5;
          
          return (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.categoryButtonContainer}
            >
              <Link to={`/categories/${category.id}`}>
                <Button 
                  size="large" 
                  className={`${styles.categoryButton} ${
                    isSecondary ? styles.categoryButtonSecondary : styles.categoryButtonPrimary
                  }`}
                >
                  <IconComponent className={styles.categoryIcon} />
                  {category.name} ({category.bookCount})
                </Button>
              </Link>
            </motion.div>
          );
        })}
      </div>
    )}
  </div>
);

export default HomePage; 
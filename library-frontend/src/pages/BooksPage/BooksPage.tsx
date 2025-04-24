import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Typography, Spin, Empty, Input, Button } from '../../shared/ui';
import {
  BooksPageContainer,
  BooksPageContent,
  BooksPageSection,
  SearchSection,
  BooksGrid,
  BookCard,
  BookImage,
  BookInfo,
  BookTitle,
  BookAuthor,
  FiltersSection
} from './BooksPage.styles';
import { useBooks } from '../../features/books';
import { BookSearchParams } from '../../features/books/types';

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

export const BooksPage: React.FC = () => {
  const {
    books,
    categories,
    isLoading,
    error,
    loadBooks,
    loadCategories
  } = useBooks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const currentPage = 0;
  const pageSize = 12;

  useEffect(() => {
    // Загрузка категорий и книг при монтировании компонента
    loadCategories();
    
    const params: BookSearchParams = {
      page: currentPage,
      size: pageSize
    };
    loadBooks(params);
  }, [loadBooks, loadCategories, currentPage, pageSize]);

  const handleSearch = () => {
    const params: BookSearchParams = {
      query: searchQuery,
      categoryId: selectedCategory || undefined,
      page: 0,
      size: pageSize
    };
    loadBooks(params);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    const params: BookSearchParams = {
      query: searchQuery,
      categoryId: categoryId || undefined,
      page: 0,
      size: pageSize
    };
    loadBooks(params);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    loadBooks({ page: 0, size: pageSize });
  };

  return (
    <BooksPageContainer>
      <BooksPageContent>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.div variants={slideUp}>
            <Typography.Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>
              Каталог книг
            </Typography.Title>
            
            <SearchSection>
              <Input 
                placeholder="Поиск книг по названию, автору..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: '100%', marginBottom: '16px' }}
              />
              <Button type="primary" onClick={handleSearch}>
                Искать
              </Button>
            </SearchSection>
            
            <FiltersSection>
              <div className="filter-title">Фильтр по категориям:</div>
              <div className="categories-filter">
                <button 
                  className={`category-button ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(null)}
                >
                  Все категории
                </button>
                {categories.map(category => (
                  <button 
                    key={category.id}
                    className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {(searchQuery || selectedCategory !== null) && (
                <Button type="link" onClick={handleClearFilters}>
                  Сбросить фильтры
                </Button>
              )}
            </FiltersSection>
            
            <BooksPageSection>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'red' }}>
                  <Typography.Text type="danger">{error}</Typography.Text>
                </div>
              ) : books.length === 0 ? (
                <Empty description="Книги не найдены" />
              ) : (
                <>
                  <Typography.Title level={3} style={{ marginBottom: '24px' }}>
                    Найдено книг: {books.length}
                  </Typography.Title>
                  
                  <BooksGrid
                    as={motion.div}
                    variants={staggerContainer}
                  >
                    {books.map((book) => (
                      <motion.div
                        key={book.id}
                        variants={fadeIn}
                        whileHover={{ y: -5 }}
                      >
                        <Link to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                          <BookCard>
                            <BookImage>
                              <img 
                                src={book.coverUrl || `https://picsum.photos/200/300?random=${book.id}`} 
                                alt={book.title} 
                              />
                            </BookImage>
                            <BookInfo>
                              <BookTitle>{book.title}</BookTitle>
                              <BookAuthor>
                                {book.authors.map(author => author.name).join(', ')}
                              </BookAuthor>
                            </BookInfo>
                          </BookCard>
                        </Link>
                      </motion.div>
                    ))}
                  </BooksGrid>
                  
                  {/* Здесь будет компонент пагинации */}
                </>
              )}
            </BooksPageSection>
          </motion.div>
        </motion.div>
      </BooksPageContent>
    </BooksPageContainer>
  );
};

export default BooksPage; 
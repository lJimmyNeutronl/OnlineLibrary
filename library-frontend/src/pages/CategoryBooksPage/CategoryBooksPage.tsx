import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { 
  Typography, 
  Card, 
  Divider, 
  Spin, 
  Empty, 
  Breadcrumb,
  Tag,
  Row,
  Col,
  HeaderSection,
  BackLink,
  Button
} from '../../shared/ui';
import { 
  CategoryBooksContainer, 
  BookImage, 
  RatingContainer, 
  BookDetails, 
  FilterSection, 
  PaginationContainer,
  BookOverlay,
  BookTitle,
  AuthorName,
  YearLabel,
  PriceTag,
  StarRating
} from './CategoryBooksPage.styles';
import { useBooks } from '../../features/books';
import { BookSearchParams } from '../../features/books/types';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
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

export const CategoryBooksPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { 
    books,
    isLoading,
    error,
    totalElements,
    totalPages,
    currentPage,
    loadBooksByCategory
  } = useBooks();
  
  const [category, setCategory] = useState<{ id: number; name: string } | null>(null);
  const [sortBy, setSortBy] = useState<string>('title');
  const pageSize = 9;

  useEffect(() => {
    // Загрузка категории и книг при монтировании и изменении categoryId
    if (categoryId) {
      const id = parseInt(categoryId);
      
      // В реальном приложении здесь должен быть запрос к API
      // для получения информации о категории
      const mockCategory = {
        id,
        name: getCategoryNameById(id)
      };
      setCategory(mockCategory);
      
      // Загрузка книг по категории
      const params: BookSearchParams = {
        page: 0,
        size: pageSize,
        sort: sortBy
      };
      loadBooksByCategory(id, params);
    }
  }, [categoryId, loadBooksByCategory, sortBy]);

  const getCategoryNameById = (id: number): string => {
    const categories: Record<number, string> = {
      1: 'Фантастика',
      2: 'Детективы',
      3: 'Научная литература',
      4: 'История',
      5: 'Искусство',
      6: 'Романы',
      7: 'Психология',
      8: 'Бизнес',
      9: 'Компьютерная литература',
      10: 'Хобби и досуг'
    };
    return categories[id] || 'Неизвестная категория';
  };

  const handlePageChange = (page: number) => {
    if (categoryId) {
      loadBooksByCategory(parseInt(categoryId), {
        page: page - 1, // API использует 0-индексацию для страниц
        size: pageSize,
        sort: sortBy
      });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <CategoryBooksContainer>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/">Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/categories">Категории</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{category?.name || 'Загрузка...'}</Breadcrumb.Item>
      </Breadcrumb>

      <HeaderSection>
        <BackLink to="/categories">
          <FiArrowLeft size={20} style={{ marginRight: '4px' }} /> Назад к категориям
        </BackLink>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {category?.name || 'Загрузка...'}
        </Typography.Title>
        <Tag color="blue" style={{ marginLeft: '12px' }}>
          {totalElements} книг
        </Tag>
      </HeaderSection>
      
      <Typography.Paragraph style={{ marginBottom: '32px' }}>
        Исследуйте нашу коллекцию книг в категории "{category?.name || 'Загрузка...'}".
        Выберите интересующую вас книгу для просмотра подробной информации.
      </Typography.Paragraph>

      <Divider />

      {/* Секция фильтров */}
      <FilterSection>
        <div>
          <label>Сортировать по: </label>
          <select 
            value={sortBy} 
            onChange={handleSortChange}
          >
            <option value="title">Название (А-Я)</option>
            <option value="-title">Название (Я-А)</option>
            <option value="price">Цена (по возрастанию)</option>
            <option value="-price">Цена (по убыванию)</option>
            <option value="rating">Рейтинг (по возрастанию)</option>
            <option value="-rating">Рейтинг (по убыванию)</option>
          </select>
        </div>
      </FilterSection>

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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <Row gutter={[24, 24]}>
              {books.map((book) => (
                <Col xs={24} sm={12} md={8} key={book.id}>
                  <motion.div 
                    variants={fadeIn}
                    whileHover={{ y: -5 }}
                  >
                    <Link to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        hoverable
                        cover={
                          <BookImage>
                            <img 
                              alt={book.title} 
                              src={book.coverUrl || `https://picsum.photos/200/300?random=${book.id}`} 
                              style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                            />
                            <BookOverlay>
                              <Button type="primary" size="small">Подробнее</Button>
                            </BookOverlay>
                          </BookImage>
                        }
                      >
                        <Card.Meta 
                          title={<BookTitle>{book.title}</BookTitle>} 
                          description={
                            <BookDetails>
                              <AuthorName>
                                {book.authors.map(author => author.name).join(', ')}
                              </AuthorName>
                              <YearLabel>{book.publicationYear || 'Неизвестно'} г.</YearLabel>
                              <RatingContainer>
                                <StarRating>
                                  <span role="img" aria-label="rating">★★★★☆</span>
                                  <small>{book.rating || '4.0'}/5.0</small>
                                </StarRating>
                                <PriceTag>₽{Math.floor(Math.random() * 1000) + 300}</PriceTag>
                              </RatingContainer>
                            </BookDetails>
                          } 
                        />
                      </Card>
                    </Link>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            {/* Пагинация */}
            {totalElements > pageSize && (
              <PaginationContainer>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page} 
                    onClick={() => handlePageChange(page)}
                    className={`pagination-button ${currentPage + 1 === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </PaginationContainer>
            )}
          </div>
        </>
      )}
    </CategoryBooksContainer>
  );
}; 
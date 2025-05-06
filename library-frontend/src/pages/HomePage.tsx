import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Typography from '../components/common/Typography';
import Divider from '../components/common/Divider';
import { Row, Col } from '../components/common/Grid';
import Icon from '../components/common/Icon';
import { Spin } from '../components/common';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsArrowRight } from 'react-icons/bs';
import { FaBook, FaBookOpen, FaBookReader, FaPencilAlt, FaGraduationCap, FaFeatherAlt } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';
import BookCard from '../components/books/BookCard';
import bookService, { Book } from '../services/bookService';
import categoryService, { CategoryWithCount } from '../services/categoryService';
import { Link } from 'react-router-dom';

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

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [featuredBooksLoading, setFeaturedBooksLoading] = useState<boolean>(true);
  const [popularCategories, setPopularCategories] = useState<CategoryWithCount[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  useEffect(() => {
    // Загрузка популярных книг при монтировании компонента
    const loadPopularBooks = async () => {
      setFeaturedBooksLoading(true);
      try {
        const books = await bookService.getPopularBooks(8);
        setPopularBooks(books);
      } catch (error) {
        console.error('Ошибка при загрузке популярных книг:', error);
      } finally {
        setFeaturedBooksLoading(false);
      }
    };

    // Загрузка популярных категорий
    const loadPopularCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoriesWithCount = await categoryService.getCategoriesWithBookCount();
        // Сортируем по количеству книг и берем топ-6
        const topCategories = [...categoriesWithCount]
          .sort((a, b) => b.bookCount - a.bookCount)
          .slice(0, 6);
        setPopularCategories(topCategories);
      } catch (error) {
        console.error('Ошибка при загрузке популярных категорий:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadPopularBooks();
    loadPopularCategories();
  }, []);

  const onSearch = (value: string) => {
    setSearchQuery(value);
    setLoading(true);
    
    // Имитация запроса к API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const featuredBooks = [
    { id: 1, title: 'Книга 1', author: 'Автор 1', cover: 'https://picsum.photos/200/300?random=1' },
    { id: 2, title: 'Книга 2', author: 'Автор 2', cover: 'https://picsum.photos/200/300?random=2' },
    { id: 3, title: 'Книга 3', author: 'Автор 3', cover: 'https://picsum.photos/200/300?random=3' },
    { id: 4, title: 'Книга 4', author: 'Автор 4', cover: 'https://picsum.photos/200/300?random=4' },
  ];

  return (
    <div className="home-container" style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      marginTop: 0
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
      
      <div className="hero-section" style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0 40px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}
        >
          <motion.div variants={slideUp} style={{ textAlign: 'center' }}>
            <div style={{ 
              marginBottom: '1.5rem', 
              background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              padding: '10px 0'
            }}>
              <h1 style={{ 
                fontSize: '3.5rem', 
                fontWeight: 'bold', 
                margin: 0,
                letterSpacing: '-0.03em',
                textShadow: '0 1px 1px rgba(0,0,0,0.1)'
              }}>
                Добро пожаловать в LitCloud
              </h1>
            </div>
            <Paragraph style={{ 
              fontSize: '1.25rem', 
              maxWidth: '800px', 
              margin: '0 auto 40px',
              lineHeight: '1.6',
              color: '#333'
            }}>
              Исследуйте тысячи книг, доступных для чтения онлайн. Находите новые истории, учитесь и развлекайтесь с нашей коллекцией электронных книг.
            </Paragraph>
          </motion.div>

          {/* Центральный поиск */}
          <motion.div variants={slideUp} style={{ 
            width: '100%', 
            maxWidth: '700px', 
            margin: '0 auto 60px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div 
              className={`search-container ${inputFocused ? 'focused' : ''}`} 
              style={{
                width: '100%',
                position: 'relative',
                background: 'white',
                borderRadius: '50px',
                padding: '0',
                boxShadow: inputFocused 
                  ? '0 10px 25px rgba(55, 105, 245, 0.2)' 
                  : '0 10px 25px rgba(55, 105, 245, 0.1)',
                transition: 'all 0.3s ease',
                height: '60px',
                overflow: 'hidden'
              }}
            >
              <div className="search-icon" style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}>
                <AiOutlineSearch size={24} color="#3769f5" />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Поиск по системе. Например: Органическая химия"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  padding: '0 100px 0 55px', // Отступы с обеих сторон для иконок
                  background: 'transparent',
                }}
              />
              {searchQuery && (
                <div 
                  className="clear-button"
                  style={{
                    position: 'absolute',
                    right: '70px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    cursor: 'pointer',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    transition: 'color 0.2s ease',
                  }}
                >
                  <MdClear 
                    size={22} 
                    color="#999" 
                    onClick={() => setSearchQuery('')}
                    style={{
                      transition: 'color 0.2s ease',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.color = '#666'}
                    onMouseUp={(e) => e.currentTarget.style.color = '#999'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                  />
                </div>
              )}
              <button 
                className="submit-button"
                onClick={() => onSearch(searchQuery)}
                type="button"
                aria-label="Искать"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 2,
                }}
              >
                <BsArrowRight size={22} color="white" />
              </button>
            </div>
          </motion.div>

          {/* Новые поступления */}
          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={3} style={{ margin: 0 }}>Новые поступления</Title>
              <Button type="link" style={{ color: '#3769f5' }}>
                Смотреть все <BsArrowRight style={{ marginLeft: '4px' }} />
              </Button>
            </div>
            
            {featuredBooksLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div className="book-grid">
                {popularBooks.map((book) => (
                  <div key={book.id} className="motion-container">
                    <BookCard
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      coverImageUrl={book.coverImageUrl || '/src/assets/images/placeholder.png'}
                      publicationYear={book.publicationYear}
                      showRating={true}
                      rating={book.rating || 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Популярные категории */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              margin: '40px 0 30px',
              textAlign: 'center'
            }}>
              <div style={{ 
                flex: 1, 
                height: '1px',
                background: 'linear-gradient(to right, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3))'
              }}></div>
              <Title level={3} style={{ 
                margin: '0 20px', 
                background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                letterSpacing: '0.5px'
              }}>
                Популярные категории
              </Title>
              <div style={{ 
                flex: 1, 
                height: '1px',
                background: 'linear-gradient(to left, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3))'
              }}></div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {categoriesLoading ? (
                <div style={{ padding: '20px 0' }}>
                  <Spin size="large" />
                </div>
              ) : (
                popularCategories.map((category, index) => {
                  // Выбираем иконку в зависимости от индекса
                  const icons = [
                    <FaBookReader style={{ marginRight: '8px' }} />,
                    <FaGraduationCap style={{ marginRight: '8px' }} />,
                    <FaFeatherAlt style={{ marginRight: '8px' }} />,
                    <FaBook style={{ marginRight: '8px' }} />,
                    <FaBookOpen style={{ marginRight: '8px' }} />,
                    <FaPencilAlt style={{ marginRight: '8px' }} />
                  ];
                  
                  return (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ display: 'inline-block', margin: '0 8px 16px' }}
                    >
                      <Link to={`/categories/${category.id}`} style={{ textDecoration: 'none' }}>
                        <Button 
                          size="large" 
                          style={{ 
                            borderRadius: '20px',
                            padding: '6px 20px',
                            background: index === 5 ? 'rgba(142, 84, 233, 0.15)' : 'rgba(55, 105, 245, 0.08)',
                            border: index === 5 ? '1px solid rgba(142, 84, 233, 0.3)' : '1px solid rgba(55, 105, 245, 0.2)',
                            color: index === 5 ? '#8e54e9' : '#3769f5',
                            transition: 'all 0.3s ease',
                            height: '42px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: index === 5 ? '0 2px 8px rgba(142, 84, 233, 0.15)' : '0 2px 8px rgba(55, 105, 245, 0.05)'
                          }}
                        >
                          {icons[index % icons.length]} {category.name} ({category.bookCount})
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage; 
import { useState, useEffect, useRef } from 'react';
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
import { 
  FaBook, 
  FaBookOpen, 
  FaBookReader, 
  FaPencilAlt, 
  FaGraduationCap, 
  FaFeatherAlt
} from 'react-icons/fa';
import { MdClear } from 'react-icons/md';
import BookCard from '../components/book-card/BookCard';
import bookService, { Book } from '../services/bookService';
import categoryService, { CategoryWithCount } from '../services/categoryService';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/common/AnimatedBackground';

const { Title, Paragraph, Text } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
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

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const suggestionsTimeoutRef = useRef<number | null>(null);
  
  const navigate = useNavigate();
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [featuredBooksLoading, setFeaturedBooksLoading] = useState<boolean>(true);
  const [popularCategories, setPopularCategories] = useState<CategoryWithCount[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);
  const [latestBooksLoading, setLatestBooksLoading] = useState<boolean>(true);

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

    // Загрузка последних добавленных книг
    const loadLatestBooks = async () => {
      setLatestBooksLoading(true);
      try {
        const books = await bookService.getLatestBooks(4); // Ограничиваем до 4 книг, чтобы не загромождать страницу
        setLatestBooks(books);
      } catch (error) {
        console.error('Ошибка при загрузке новых поступлений:', error);
      } finally {
        setLatestBooksLoading(false);
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

    // Загрузка истории поиска при монтировании компонента
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history);
    } catch (e) {
      console.error('Ошибка при загрузке истории поиска:', e);
      setSearchHistory([]);
    }

    loadPopularBooks();
    loadLatestBooks();
    loadPopularCategories();
  }, []);

  // Обработчик изменения текста в поле поиска
  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Получаем подсказки для поиска с задержкой (debounce)
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    
    if (value.trim().length >= 2) {
      setLoadingSuggestions(true);
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const newSuggestions = await bookService.getSearchSuggestions(value);
          setSuggestions(newSuggestions);
        } catch (error) {
          console.error('Ошибка при получении подсказок:', error);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 300); // Задержка в 300 мс
    } else {
      setSuggestions([]);
    }
  };

  const onSearch = (value: string) => {
    if (!value.trim()) return;
    
    setLoading(true);
    
    // Сохраняем запрос в истории поиска
    try {
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      
      // Добавляем новый запрос в начало массива, если его еще нет
      if (!searchHistory.includes(value)) {
        searchHistory.unshift(value);
        
        // Ограничиваем историю до 10 последних запросов
        if (searchHistory.length > 10) {
          searchHistory.pop();
        }
        
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      }
    } catch (e) {
      console.error('Ошибка при сохранении истории поиска:', e);
    }
    
    // Перенаправляем на страницу результатов поиска
    navigate(`/search?query=${encodeURIComponent(value)}`);
  };

  // Обработчик выбора запроса из истории или подсказок
  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  // Обработчик очистки истории поиска
  const clearSearchHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  const featuredBooks = [
    { id: 1, title: 'Книга 1', author: 'Автор 1', cover: 'https://picsum.photos/200/300?random=1' },
    { id: 2, title: 'Книга 2', author: 'Автор 2', cover: 'https://picsum.photos/200/300?random=2' },
    { id: 3, title: 'Книга 3', author: 'Автор 3', cover: 'https://picsum.photos/200/300?random=3' },
    { id: 4, title: 'Книга 4', author: 'Автор 4', cover: 'https://picsum.photos/200/300?random=4' },
  ];

  return (
    <AnimatedBackground>
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
                overflow: 'visible' // Изменено с 'hidden' на 'visible', чтобы выпадающие списки отображались
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
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => {
                  // Задержка, чтобы успеть кликнуть по элементу истории или подсказке
                  setTimeout(() => setInputFocused(false), 200);
                }}
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
              
              {/* Выпадающий список с подсказками */}
              {inputFocused && searchQuery.trim().length >= 2 && (
                <div 
                  className="search-suggestions-dropdown"
                  style={{
                    position: 'absolute',
                    top: '65px',
                    left: '0',
                    width: '100%',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 11, // Выше, чем история поиска
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '8px 0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: 500, color: '#666' }}>Подсказки</span>
                  </div>
                  
                  {loadingSuggestions ? (
                    <div style={{ padding: '15px', textAlign: 'center' }}>
                      <Spin size="small" />
                      <span style={{ marginLeft: '10px', color: '#666' }}>Поиск...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div 
                        key={`suggestion-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <AiOutlineSearch size={16} color="#3769f5" style={{ marginRight: '10px' }} />
                        <span style={{ color: '#333' }}>{suggestion}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px 16px', color: '#999' }}>
                      Подсказки не найдены
                    </div>
                  )}
                </div>
              )}
              
              {/* Выпадающий список с историей поиска, показываем только если нет подсказок */}
              {inputFocused && searchHistory.length > 0 && (!searchQuery || searchQuery.trim().length < 2) && (
                <div 
                  className="search-history-dropdown"
                  style={{
                    position: 'absolute',
                    top: '65px',
                    left: '0',
                    width: '100%',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '8px 0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: 500, color: '#666' }}>История поиска</span>
                    <button 
                      onClick={clearSearchHistory}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#3769f5',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Очистить
                    </button>
                  </div>
                  
                  {searchHistory.map((query, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSuggestionClick(query)}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <AiOutlineSearch size={16} color="#999" style={{ marginRight: '10px' }} />
                      <span>{query}</span>
                    </div>
                  ))}
                </div>
              )}
              
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
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
                Новые поступления
              </Title>
              <div style={{ 
                flex: 1, 
                height: '1px',
                background: 'linear-gradient(to left, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3))'
              }}></div>
            </div>
            
            {latestBooksLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
              }}>
                <div className="book-grid" style={{
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '30px'
                }}>
                  {latestBooks.map((book) => (
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
                <div style={{
                  maxWidth: '1000px',
                  margin: '0 auto',
                  textAlign: 'center'
                }}>
                  {popularCategories.map((category, index) => {
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
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default HomePage; 
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Typography, 
  Card, 
  Input,
  Row,
  Col
} from '../../shared/ui';
import { 
  FaBook, 
  FaBookOpen, 
  FaBookReader, 
  FaPencilAlt, 
  FaGraduationCap, 
  FaFeatherAlt 
} from 'react-icons/fa';
import { AiOutlineSearch } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { 
  HomeContainer,
  BackgroundImage,
  BackgroundFeather,
  HeroSection,
  SearchContainer,
  SearchInputWrapper,
  SearchButton,
  FeaturedBooksSection,
  SectionTitle,
  SectionDivider,
  SectionHeader,
  CategoryButton
} from './HomePage.styles';
import { MdClear } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';

const { Title, Paragraph } = Typography;

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
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut"
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

/**
 * Компонент главной страницы приложения
 */
const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [inputFocused, setInputFocused] = React.useState<boolean>(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Имитация запроса к API
    setTimeout(() => {
      // Здесь будет перенаправление на страницу с результатами поиска
    }, 800);
  };

  const featuredBooks = [
    { id: 1, title: 'Книга 1', author: 'Автор 1', cover: 'https://picsum.photos/200/300?random=1' },
    { id: 2, title: 'Книга 2', author: 'Автор 2', cover: 'https://picsum.photos/200/300?random=2' },
    { id: 3, title: 'Книга 3', author: 'Автор 3', cover: 'https://picsum.photos/200/300?random=3' },
    { id: 4, title: 'Книга 4', author: 'Автор 4', cover: 'https://picsum.photos/200/300?random=4' },
  ];

  const categories = [
    { name: 'Фантастика', icon: <FaBookReader style={{ marginRight: '8px' }} /> },
    { name: 'Детективы', icon: <FaGraduationCap style={{ marginRight: '8px' }} /> },
    { name: 'Романы', icon: <FaFeatherAlt style={{ marginRight: '8px' }} /> },
    { name: 'Наука', icon: <FaBook style={{ marginRight: '8px' }} /> },
    { name: 'История', icon: <FaBookOpen style={{ marginRight: '8px' }} /> },
    { name: 'Искусство', icon: <FaPencilAlt style={{ marginRight: '8px' }} /> }
  ];

  return (
    <HomeContainer>
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  padding: '0 100px 0 55px',
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
                  onClick={() => setSearchQuery('')}
                >
                  <MdClear 
                    size={22} 
                    color="#999" 
                  />
                </div>
              )}
              <button 
                className="submit-button"
                onClick={handleSearch}
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
                Новые поступления
              </Title>
              <div style={{ 
                flex: 1, 
                height: '1px',
                background: 'linear-gradient(to left, rgba(55, 105, 245, 0.05), rgba(55, 105, 245, 0.3))'
              }}></div>
            </div>

            <Row gutter={[0, 4]}>
              {featuredBooks.map((book) => (
                <Col xs={24} sm={12} md={6} lg={6} key={book.id} style={{ padding: '0 2px' }}>
                  <Link to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      hoverable
                      cover={
                        <div style={{ 
                          width: '100%',
                          height: '250px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                          borderRadius: '8px 8px 0 0',
                        }}>
                          <img 
                            alt={book.title} 
                            src={book.cover} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      }
                      className="new-arrival-card"
                    >
                      <Card.Meta
                        title={book.title}
                        description={book.author}
                      />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
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
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: 'inline-block', margin: '0 8px 16px' }}
                >
                  <CategoryButton 
                    active={index === 5}
                    onClick={() => {}}
                  >
                    {category.icon}
                    {category.name}
                  </CategoryButton>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </HomeContainer>
  );
};

export default HomePage; 
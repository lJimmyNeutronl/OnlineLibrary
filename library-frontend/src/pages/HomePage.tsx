import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Typography from '../components/common/Typography';
import Divider from '../components/common/Divider';
import { Row, Col } from '../components/common/Grid';
import Icon from '../components/common/Icon';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsArrowRight } from 'react-icons/bs';

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

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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
      {/* Декоративные элементы */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(55, 105, 245, 0.08)',
        top: '-150px',
        right: '-100px',
        zIndex: 0,
        transform: 'rotate(45deg)',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 25% 50%)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(55, 105, 245, 0.06)',
        bottom: '-100px',
        left: '-100px',
        zIndex: 0,
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        background: 'rgba(55, 105, 245, 0.04)',
        top: '30%',
        right: '10%',
        zIndex: 0,
        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
        animation: 'float 7s ease-in-out infinite'
      }} />
      
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
            <Typography level={1} style={{ marginBottom: '1rem', color: '#3769f5' }}>
              Добро пожаловать в Онлайн-библиотеку
            </Typography>
            <Typography type="paragraph" style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 40px' }}>
              Исследуйте тысячи книг, доступных для чтения онлайн. Находите новые истории, учитесь и развлекайтесь с нашей коллекцией электронных книг.
            </Typography>
          </motion.div>

          {/* Центральный поиск */}
          <motion.div variants={slideUp} style={{ 
            width: '100%', 
            maxWidth: '700px', 
            margin: '0 auto 60px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div className="search-container">
              <div className="search-icon">
                <AiOutlineSearch size={18} color="#3769f5" />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Искать книги, авторов или жанры..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
              />
              {searchQuery && (
                <button
                  className="clear-button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Очистить"
                  type="button"
                >
                  ×
                </button>
              )}
              <button 
                className="submit-button"
                onClick={() => onSearch(searchQuery)}
                type="button"
                aria-label="Искать"
              >
                <BsArrowRight size={22} color="white" />
              </button>
            </div>
          </motion.div>

          {/* Новые поступления */}
          <div style={{ marginBottom: '40px' }}>
            <Divider>
              <Typography level={3} style={{ margin: 0 }}>Новые поступления</Typography>
            </Divider>

            <Row gutter={[24, 24]}>
              {featuredBooks.map((book) => (
                <Col xs={24} sm={12} md={8} key={book.id}>
                  <motion.div 
                    variants={slideUp} 
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      hoverable
                      cover={
                        <div style={{ 
                          height: '220px', 
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <img 
                            alt={book.title} 
                            src={book.cover} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                          }} />
                        </div>
                      }
                      title={book.title}
                      description={book.author}
                    >
                      <Button 
                        type="primary" 
                        style={{ 
                          margin: '0 16px 16px',
                          width: 'calc(100% - 32px)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Подробнее
                      </Button>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Популярные категории */}
          <div style={{ marginBottom: '40px' }}>
            <Divider>
              <Typography level={3} style={{ margin: 0 }}>Популярные категории</Typography>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              {['Фантастика', 'Детективы', 'Романы', 'Наука', 'История', 'Искусство'].map((category, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: 'inline-block', margin: '0 8px 16px' }}
                >
                  <Button 
                    size="large" 
                    icon={<Icon type="book" style={{ fontSize: '16px' }} />}
                    style={{ 
                      borderRadius: '20px',
                      padding: '0 20px',
                      background: 'rgba(55, 105, 245, 0.1)',
                      border: 'none',
                      color: '#3769f5',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {category}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage; 
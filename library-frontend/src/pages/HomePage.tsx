import { useState } from 'react';
import { Input, Row, Col, Card, Typography, Divider, Button } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;
const { Search } = Input;

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
      position: 'relative'
    }}>
      {/* Декоративные элементы */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(64, 150, 255, 0.1)',
        top: '-150px',
        right: '-150px',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(64, 150, 255, 0.08)',
        bottom: '-100px',
        left: '-100px',
        zIndex: 0,
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
            <Title level={1} style={{ marginBottom: '1rem', color: '#4096ff' }}>
              Добро пожаловать в Онлайн-библиотеку
            </Title>
            <Paragraph style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto 40px' }}>
              Исследуйте тысячи книг, доступных для чтения онлайн. Находите новые истории, учитесь и развлекайтесь с нашей коллекцией электронных книг.
            </Paragraph>
          </motion.div>

          {/* Центральный поиск */}
          <motion.div variants={slideUp} style={{ width: '100%', maxWidth: '700px', margin: '0 auto 60px' }}>
            <Search
              placeholder="Поиск книг по названию, автору или жанру..."
              allowClear
              enterButton={<><SearchOutlined /> Найти</>}
              size="large"
              onSearch={onSearch}
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                width: '100%'
              }}
            />
          </motion.div>

          {/* Новые поступления */}
          <div style={{ marginBottom: '40px' }}>
            <Divider orientation="center">
              <Title level={3} style={{ margin: 0 }}>Новые поступления</Title>
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
                        <div style={{ height: '220px', overflow: 'hidden' }}>
                          <img 
                            alt={book.title} 
                            src={book.cover} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      }
                      style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
                    >
                      <Card.Meta 
                        title={book.title} 
                        description={book.author} 
                      />
                      <Button 
                        type="primary" 
                        style={{ marginTop: '16px', width: '100%' }}
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
            <Divider orientation="center">
              <Title level={3} style={{ margin: 0 }}>Популярные категории</Title>
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
                    icon={<BookOutlined />}
                    style={{ 
                      borderRadius: '20px',
                      padding: '0 20px'
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
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Row, 
  Col, 
  Card, 
  Divider, 
  Spin, 
  Empty, 
  Breadcrumb,
  Button
} from 'antd';
import { BookOutlined, RightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
  bookCount: number;
}

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

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Имитация загрузки категорий с сервера
    setTimeout(() => {
      // Временные тестовые данные
      const mockCategories: Category[] = [
        { id: 1, name: 'Фантастика', parentCategoryId: null, bookCount: 45 },
        { id: 2, name: 'Детективы', parentCategoryId: null, bookCount: 32 },
        { id: 3, name: 'Научная литература', parentCategoryId: null, bookCount: 28 },
        { id: 4, name: 'История', parentCategoryId: null, bookCount: 19 },
        { id: 5, name: 'Искусство', parentCategoryId: null, bookCount: 24 },
        { id: 6, name: 'Романы', parentCategoryId: null, bookCount: 38 },
        { id: 7, name: 'Психология', parentCategoryId: null, bookCount: 22 },
        { id: 8, name: 'Бизнес', parentCategoryId: null, bookCount: 17 },
        { id: 9, name: 'Компьютерная литература', parentCategoryId: null, bookCount: 31 },
        { id: 10, name: 'Хобби и досуг', parentCategoryId: null, bookCount: 14 },
      ];
      
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  const getRandomColor = () => {
    const colors = [
      'rgba(24, 144, 255, 0.1)',
      'rgba(250, 140, 22, 0.1)',
      'rgba(82, 196, 26, 0.1)',
      'rgba(47, 84, 235, 0.1)',
      'rgba(245, 34, 45, 0.1)',
      'rgba(114, 46, 209, 0.1)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="categories-container" style={{ padding: '24px 0' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/">Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Категории</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginBottom: '24px' }}>
        Категории книг
      </Title>
      
      <Paragraph style={{ marginBottom: '32px' }}>
        Исследуйте нашу коллекцию книг по категориям. Выберите категорию, чтобы увидеть все доступные книги в ней.
      </Paragraph>

      <Divider />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : categories.length === 0 ? (
        <Empty description="Категории не найдены" />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Row gutter={[24, 24]}>
            {categories.map((category) => (
              <Col xs={24} sm={12} md={8} lg={6} key={category.id}>
                <motion.div 
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/categories/${category.id}`}>
                    <Card
                      hoverable
                      style={{ 
                        borderRadius: '12px',
                        backgroundColor: getRandomColor(),
                        height: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '50px', marginBottom: '10px', opacity: 0.7 }}>
                            <BookOutlined />
                          </div>
                          <Title level={4} style={{ marginBottom: '8px' }}>
                            {category.name}
                          </Title>
                          <Paragraph>
                            Книг: {category.bookCount}
                          </Paragraph>
                        </div>
                        <RightOutlined style={{ fontSize: '20px', opacity: 0.6 }} />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      )}
    </div>
  );
};

export default CategoriesPage; 
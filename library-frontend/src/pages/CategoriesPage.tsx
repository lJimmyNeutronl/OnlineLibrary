import { motion } from 'framer-motion';
import Typography from '../components/common/Typography';
import Button from '../components/common/Button';
import { AiOutlineBook } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

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

const CategoriesPage = () => {
  const navigate = useNavigate();
  
  const categories = [
    { id: 1, name: 'Фантастика', count: 42 },
    { id: 2, name: 'Детективы', count: 35 },
    { id: 3, name: 'Романы', count: 28 },
    { id: 4, name: 'Научная литература', count: 56 },
    { id: 5, name: 'История', count: 31 },
    { id: 6, name: 'Искусство', count: 24 },
    { id: 7, name: 'Философия', count: 19 },
    { id: 8, name: 'Психология', count: 27 },
  ];

  return (
    <div style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      padding: '40px 0'
    }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        style={{ 
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 16px' 
        }}
      >
        <motion.div variants={slideUp}>
          <Typography level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Категории книг
          </Typography>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px'
          }}>
            <Typography type="paragraph" style={{ marginBottom: '30px' }}>
              Выберите интересующую вас категорию, чтобы увидеть соответствующие книги.
            </Typography>
            
            <motion.div
              variants={staggerContainer}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
              }}
            >
              {categories.map((category) => (
                <motion.div 
                  key={category.id}
                  variants={slideUp}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    style={{ 
                      background: 'rgba(55, 105, 245, 0.05)',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      border: '1px solid rgba(55, 105, 245, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate(`/categories/${category.id}`)}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '10px' 
                    }}>
                      <div style={{ 
                        background: '#3769f5',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <AiOutlineBook color="white" size={20} />
                      </div>
                      <div>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          color: '#333'
                        }}>
                          {category.name}
                        </h3>
                        <p style={{ 
                          margin: '5px 0 0 0', 
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          {category.count} книг
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary"
                      onClick={() => navigate(`/categories/${category.id}`)}
                      style={{ width: '100%', marginTop: '10px' }}
                    >
                      Просмотреть
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CategoriesPage; 
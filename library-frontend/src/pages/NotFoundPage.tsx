import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0
    }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        style={{ width: '100%', maxWidth: '600px', padding: '0 16px' }}
      >
        <motion.div variants={slideUp}>
          <div style={{ 
            background: 'white', 
            padding: '48px 32px', 
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              }}
            >
              <h1 style={{ 
                fontSize: '72px', 
                margin: '0',
                color: '#3769f5',
                fontWeight: 'bold'
              }}>
                404
              </h1>
            </motion.div>
            
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(0, 0, 0, 0.65)',
              margin: '16px 0 24px'
            }}>
              Извините, страница не найдена
            </p>
            
            <Button 
              type="primary"
              onClick={() => navigate('/')}
              style={{ padding: '0 24px', height: '40px' }}
            >
              Вернуться на главную
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage; 
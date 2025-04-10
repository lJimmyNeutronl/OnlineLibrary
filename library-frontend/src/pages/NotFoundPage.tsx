import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
          <Result
            status="404"
            title={
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20 
                }}
              >
                404
              </motion.div>
            }
            subTitle="Извините, страница не найдена"
            extra={
              <Button 
                type="primary" 
                onClick={() => navigate('/')}
                size="large"
              >
                Вернуться на главную
              </Button>
            }
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage; 
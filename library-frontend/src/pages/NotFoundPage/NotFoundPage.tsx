import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../shared/ui';
import { NotFoundPageContainer, NotFoundContent, NotFoundTitle, NotFoundMessage } from './NotFoundPage.styles';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <NotFoundPageContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        style={{ width: '100%', maxWidth: '600px', padding: '0 16px' }}
      >
        <motion.div variants={slideUp}>
          <NotFoundContent>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              }}
            >
              <NotFoundTitle>404</NotFoundTitle>
            </motion.div>
            
            <NotFoundMessage>
              Извините, страница не найдена
            </NotFoundMessage>
            
            <Button 
              type="primary"
              onClick={() => navigate('/')}
              style={{ padding: '0 24px', height: '40px' }}
            >
              Вернуться на главную
            </Button>
          </NotFoundContent>
        </motion.div>
      </motion.div>
    </NotFoundPageContainer>
  );
};

export default NotFoundPage; 
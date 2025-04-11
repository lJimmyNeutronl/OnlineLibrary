import { motion } from 'framer-motion';
import Typography from '../components/common/Typography';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const BooksPage = () => {
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
            Каталог книг
          </Typography>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px'
          }}>
            <Typography level={2} style={{ marginBottom: '20px' }}>
              Страница находится в разработке
            </Typography>
            <Typography type="paragraph">
              Здесь будет отображаться список всех доступных книг в библиотеке с возможностью поиска, 
              фильтрации по жанрам, авторам и другим параметрам.
            </Typography>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BooksPage; 
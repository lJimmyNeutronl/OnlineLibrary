import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoginForm } from '../../features/auth';
import { useAuth } from '../../features/auth';
import { FaBookOpen, FaGraduationCap, FaBook } from 'react-icons/fa';

// Импортируем стили из модуля auth
import {
  formPageContainerStyle,
  floatAnimation,
  rotateAnimation,
  pulseAnimation,
  topRightDecorativeStyle,
  bottomLeftDecorativeStyle,
  bottomRightDecorativeStyle,
  decorativeColors
} from '../../features/auth/styles';

/**
 * Страница входа пользователя
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div style={formPageContainerStyle}>
      {/* Декоративные элементы, связанные с книгами */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={topRightDecorativeStyle}
      >
        <FaBookOpen size={250} color={decorativeColors.primary} />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={rotateAnimation}
        style={bottomLeftDecorativeStyle}
      >
        <FaGraduationCap size={200} color={decorativeColors.primary} />
      </motion.div>
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pulseAnimation}
        style={bottomRightDecorativeStyle}
      >
        <FaBook size={130} color={decorativeColors.primary} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', width: '100%', maxWidth: '460px', zIndex: 1 }}
      >
        <LoginForm />

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <p>Нет аккаунта? <Link to="/register" style={{ color: '#3769f5', fontWeight: 600 }}>Зарегистрируйтесь</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 
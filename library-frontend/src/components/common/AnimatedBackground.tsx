import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaBookOpen, 
  FaPencilAlt, 
  FaGraduationCap, 
  FaFeatherAlt, 
  FaBookmark, 
  FaCoffee, 
  FaLightbulb, 
  FaGlasses, 
  FaStar
} from 'react-icons/fa';

// Анимации
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

const swayAnimation = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [0, -10, 0, 10, 0],
    rotate: [-5, 5, -3, 3, -5],
    transition: {
      duration: 10,
      repeat: Infinity,
      repeatType: "reverse" as const,
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

const fadeInOutAnimation = {
  initial: { opacity: 0.03 },
  animate: {
    opacity: [0.03, 0.07, 0.03],
    transition: {
      duration: 8,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

const slowFloatAnimation = {
  initial: { y: 0, x: 0 },
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    transition: {
      duration: 12,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut"
    }
  }
};

const driftAnimation = {
  initial: { x: 0, y: 0, rotate: 0 },
  animate: {
    x: [0, 15, -15, 0],
    y: [0, -10, 10, 0],
    rotate: [0, 3, -3, 0],
    transition: {
      duration: 15,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut"
    }
  }
};

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  children, 
  style,
  className = ''
}) => {
  return (
    <div 
      className={`animated-background-container ${className}`}
      style={{ 
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        marginTop: 0,
        ...style
      }}
    >
      {/* Открытая книга */}
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
      
      {/* Шапка выпускника */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={swayAnimation}
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
      
      {/* Карандаш */}
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

      {/* Перо */}
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

      {/* Чашка кофе */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={driftAnimation}
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          top: '65%',
          left: '15%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.05,
        }}
      >
        <FaCoffee size={90} color="#3769f5" />
      </motion.div>

      {/* Лампочка */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={fadeInOutAnimation}
        style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          top: '20%',
          right: '20%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.04,
        }}
      >
        <FaLightbulb size={120} color="#3769f5" />
      </motion.div>

      {/* Очки */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={slowFloatAnimation}
        style={{
          position: 'absolute',
          width: '160px',
          height: '160px',
          bottom: '20%',
          right: '15%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.05,
        }}
      >
        <FaGlasses size={110} color="#3769f5" />
      </motion.div>

      {/* Закладка */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={floatAnimation}
        style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          top: '40%',
          left: '20%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.06,
        }}
      >
        <FaBookmark size={80} color="#3769f5" />
      </motion.div>

      {/* Звезда */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pulseAnimation}
        style={{
          position: 'absolute',
          width: '90px',
          height: '90px',
          bottom: '35%',
          right: '30%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.04,
        }}
      >
        <FaStar size={70} color="#3769f5" />
      </motion.div>
      
      {/* Контент */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground; 
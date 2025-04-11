import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';

interface LoginFormValues {
  email: string;
  password: string;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/');
    } catch (error) {
      setError('Ошибка входа. Проверьте email и пароль');
    }
  };

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
        style={{ width: '100%', maxWidth: '400px', padding: '0 16px' }}
      >
        <motion.div variants={slideUp}>
          <div 
            style={{ 
              background: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Вход в систему</h2>
            
            {error && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#fff2f0', 
                border: '1px solid #ffccc7',
                color: '#f5222d', 
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 500 
                }}>
                  Email
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '0 11px'
                }}>
                  <AiOutlineUser style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ваш email"
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '12px 11px',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}>
                  Пароль
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '0 11px'
                }}>
                  <AiOutlineLock style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ваш пароль"
                    style={{
                      border: 'none',
                      outline: 'none',
                      padding: '12px 11px',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
              
                <Button 
                  type="primary" 
                style={{ 
                  width: '100%',
                  height: '45px', 
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                >
                  Войти
                </Button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button 
                  type="link" 
                  onClick={() => navigate('/register')} 
                  style={{ color: '#3769f5' }}
                >
                  Нет аккаунта? Зарегистрироваться
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 
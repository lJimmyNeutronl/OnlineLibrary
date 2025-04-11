import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { AiOutlineUser, AiOutlineLock, AiOutlineMail, AiOutlineIdcard } from 'react-icons/ai';

interface RegisterFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    try {
      await dispatch(register({ email, password, firstName, lastName })).unwrap();
      navigate('/login');
    } catch (error) {
      setError('Ошибка регистрации. Возможно, такой email уже существует');
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
        style={{ width: '100%', maxWidth: '500px', padding: '0 16px' }}
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
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Регистрация</h2>
            
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
                  <AiOutlineMail style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 500 
                }}>
                  Имя
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
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Ваше имя"
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 500 
                }}>
                  Фамилия
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '0 11px'
                }}>
                  <AiOutlineIdcard style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                  <input 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Ваша фамилия"
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

              <div style={{ marginBottom: '16px' }}>
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
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}>
                  Подтверждение пароля
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Подтвердите пароль"
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
                  Зарегистрироваться
                </Button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button 
                  type="link" 
                  onClick={() => navigate('/login')} 
                  style={{ color: '#3769f5' }}
                >
                  Уже есть аккаунт? Войти
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 
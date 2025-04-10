import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { motion } from 'framer-motion';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

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

  const onFinish = async (values: LoginFormValues) => {
    try {
      await dispatch(login(values)).unwrap();
      message.success('Успешный вход');
      navigate('/');
    } catch (error) {
      message.error('Ошибка входа. Проверьте email и пароль');
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
          <Card 
            title="Вход в систему" 
            bordered={false}
            className="card-hover"
            style={{ 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderRadius: '12px',
            }}
          >
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Пожалуйста, введите email' },
                  { type: 'email', message: 'Введите корректный email' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Ваш email" />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Ваш пароль" />
              </Form.Item>

              <Form.Item style={{ marginBottom: '12px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  style={{ height: '45px', borderRadius: '8px' }}
                >
                  Войти
                </Button>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="link" 
                  onClick={() => navigate('/register')} 
                  block
                  style={{ color: '#4096ff' }}
                >
                  Нет аккаунта? Зарегистрироваться
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 
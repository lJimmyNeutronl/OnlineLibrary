import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { motion } from 'framer-motion';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';

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

  const onFinish = async (values: RegisterFormValues) => {
    try {
      await dispatch(register(values)).unwrap();
      message.success('Регистрация успешна');
      navigate('/login');
    } catch (error) {
      message.error('Ошибка регистрации. Возможно, такой email уже существует');
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
          <Card 
            title="Регистрация" 
            bordered={false}
            className="card-hover"
            style={{ 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderRadius: '12px',
            }}
          >
            <Form
              name="register"
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
                <Input prefix={<MailOutlined />} placeholder="Ваш email" />
              </Form.Item>

              <Form.Item
                label="Имя"
                name="firstName"
                rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Ваше имя" />
              </Form.Item>

              <Form.Item
                label="Фамилия"
                name="lastName"
                rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="Ваша фамилия" />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[
                  { required: true, message: 'Пожалуйста, введите пароль' },
                  { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Ваш пароль" />
              </Form.Item>

              <Form.Item
                label="Подтверждение пароля"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Пожалуйста, подтвердите пароль' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Пароли не совпадают'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Подтвердите пароль" />
              </Form.Item>

              <Form.Item style={{ marginBottom: '12px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  style={{ height: '45px', borderRadius: '8px' }}
                >
                  Зарегистрироваться
                </Button>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="link" 
                  onClick={() => navigate('/login')} 
                  block
                  style={{ color: '#4096ff' }}
                >
                  Уже есть аккаунт? Войти
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 
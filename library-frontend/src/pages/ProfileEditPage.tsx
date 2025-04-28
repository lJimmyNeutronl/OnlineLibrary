import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiArrowLeft, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks/reduxHooks';
import userService, { UserProfileUpdateData } from '../services/userService';

// Импортируем наши пользовательские компоненты
import Typography from '../components/common/Typography';
import Row from '../components/common/Row';
import Col from '../components/common/Col';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Divider from '../components/common/Divider';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import message from '../components/common/message';
import Spin from '../components/common/Spin';

const { Title, Text } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const [form, setForm] = useState<UserProfileUpdateData>({
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Проверка аутентификации
    if (!isAuthenticated) {
      message.error('Для доступа к редактированию профиля необходимо авторизоваться');
      navigate('/login');
      return;
    }
    
    // Загрузка текущих данных пользователя
    loadUserData();
  }, [isAuthenticated, navigate]);
  
  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await userService.getCurrentUser();
      setForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      });
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      message.error('Не удалось загрузить данные пользователя');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await userService.updateProfile(form);
      message.success('Профиль успешно обновлен');
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      message.error('Не удалось обновить профиль');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (loading) {
    return <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="profile-edit-container"
      style={{ padding: '24px 0' }}
    >
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/">Главная</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/profile">Личный кабинет</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Редактирование профиля</Breadcrumb.Item>
      </Breadcrumb>
      
      <Row gutter={[0, 20]} justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={100} icon={<FiUser />} />
              <Title level={3} style={{ marginTop: '16px' }}>
                Редактирование профиля
              </Title>
              <Text type="secondary">Обновите информацию о себе</Text>
            </div>
            
            <Divider />
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="firstName" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Имя
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName || ''}
                  onChange={handleChange}
                  placeholder="Введите ваше имя"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="lastName" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Фамилия
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName || ''}
                  onChange={handleChange}
                  placeholder="Введите вашу фамилию"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  icon={<FiArrowLeft />}
                  onClick={() => navigate('/profile')}
                >
                  Назад
                </Button>
                
                <Button
                  type="primary"
                  icon={<FiSave />}
                  htmlType="submit"
                  loading={submitting}
                >
                  Сохранить
                </Button>
              </div>
            </form>
          </Card>
        </Col>
        
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Title level={4} style={{ marginTop: 0 }}>
              Смена пароля
            </Title>
            <Text type="secondary">
              Хотите изменить пароль для входа в систему?
            </Text>
            
            <div style={{ marginTop: '16px' }}>
              <Button
                type="primary"
                onClick={() => navigate('/profile/change-password')}
                style={{ width: '100%' }}
              >
                Перейти к смене пароля
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default ProfileEditPage; 
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Typography from '../components/common/Typography';
import Button from '../components/common/Button';
import { AiOutlineArrowLeft, AiOutlineFullscreen, AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineHeart } from 'react-icons/ai';
import { useAppSelector } from '../hooks/reduxHooks';

const { Title, Paragraph } = Typography;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const BookReaderPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  useEffect(() => {
    // Проверка аутентификации
    if (!isAuthenticated) {
      // В реальном приложении здесь будет уведомление пользователя
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ 
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      padding: '40px 0'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '16px 24px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            type="text" 
            onClick={() => navigate(`/books/${bookId}`)}
            style={{ marginRight: '16px' }}
          >
            <AiOutlineArrowLeft size={18} /> Назад
          </Button>
          <h2 style={{ margin: 0 }}>Просмотр книги {bookId}</h2>
        </div>
        <div>
          <Button type="text" style={{ marginRight: '8px' }}>
            <AiOutlineZoomIn size={18} />
          </Button>
          <Button type="text" style={{ marginRight: '8px' }}>
            <AiOutlineZoomOut size={18} />
          </Button>
          <Button type="text" style={{ marginRight: '8px' }}>
            <AiOutlineFullscreen size={18} />
          </Button>
          <Button type="text">
            <AiOutlineHeart size={18} />
          </Button>
        </div>
      </div>

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
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px'
          }}>
            <Title style={{ marginBottom: '20px', textAlign: 'center' }}>
              Функционал чтения в разработке
            </Title>

            <div style={{ 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              padding: '30px', 
              minHeight: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: '#f9f9f9'
            }}>
              <Paragraph style={{ marginBottom: '20px', textAlign: 'center' }}>
                Для просмотра полной версии PDF-документа необходимо авторизоваться и перейти к полной версии страницы.
              </Paragraph>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <Button type="primary" onClick={() => navigate(`/books/${bookId}`)}>
                  Вернуться к информации о книге
                </Button>
              </div>
            </div>

            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '20px',
              borderTop: '1px solid #eee',
              paddingTop: '20px'
            }}>
              <Button type="default" onClick={() => {}}>
                Предыдущая страница
              </Button>
              <div>
                Страница 1 из 10
              </div>
              <Button type="default" onClick={() => {}}>
                Следующая страница
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookReaderPage;
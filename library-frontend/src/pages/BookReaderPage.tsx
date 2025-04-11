import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  Spin, 
  Empty, 
  message, 
  Drawer, 
  List, 
  Slider, 
  Typography, 
  Tooltip,
  Breadcrumb,
  Space
} from 'antd';
import { 
  MenuOutlined, 
  BookOutlined, 
  HeartOutlined, 
  HeartFilled,
  FullscreenOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useAppSelector } from '../hooks/reduxHooks';

// Настройка worker для react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface BookInfo {
  id: number;
  title: string;
  author: string;
  coverImageUrl: string;
  totalPages: number;
  fileUrl: string;
}

const BookReaderPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { token } = useAppSelector(state => state.auth);
  const isAuthenticated = !!token;
  
  const [book, setBook] = useState<BookInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  useEffect(() => {
    // Проверка аутентификации
    if (!isAuthenticated) {
      message.error('Для чтения книги необходимо авторизоваться');
      navigate('/login');
      return;
    }
    
    // Имитация загрузки данных с сервера
    setLoading(true);

    setTimeout(() => {
      // Мок данных книги (в реальном приложении это будет API-запрос)
      const mockBook: BookInfo = {
        id: parseInt(bookId || '0'),
        title: `Книга ${bookId}`,
        author: 'Известный Автор',
        coverImageUrl: `https://picsum.photos/400/600?random=${bookId}`,
        totalPages: 10,
        // Используем тестовый PDF для демонстрации
        fileUrl: 'https://arxiv.org/pdf/2006.11239.pdf'
      };
      
      setBook(mockBook);
      setLoading(false);
      
      // В реальном приложении здесь следует загрузить последнюю прочитанную страницу пользователя
      setPageNumber(1);
    }, 1000);
  }, [bookId, isAuthenticated, navigate]);

  // Обработка загрузки PDF
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Переход на следующую страницу
  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
      saveReadingProgress(pageNumber + 1);
    }
  };

  // Переход на предыдущую страницу
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      saveReadingProgress(pageNumber - 1);
    }
  };

  // Изменение масштаба
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  // Переключение в полноэкранный режим
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Сохранение прогресса чтения
  const saveReadingProgress = (page: number) => {
    // В реальном приложении здесь будет API-запрос для сохранения прогресса
    console.log(`Сохранен прогресс чтения для книги ${bookId}: страница ${page}`);
  };

  // Добавление/удаление из избранного
  const toggleFavorite = () => {
    // В реальном приложении здесь будет API-запрос
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? 'Книга удалена из избранного' : 'Книга добавлена в избранное');
  };

  // Генерация списка страниц для навигации
  const renderPageList = () => {
    if (!numPages) return null;
    
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        <List.Item 
          key={i} 
          onClick={() => { setPageNumber(i); saveReadingProgress(i); }}
          style={{ 
            cursor: 'pointer',
            backgroundColor: pageNumber === i ? '#e6f7ff' : 'transparent',
            padding: '8px 16px'
          }}
        >
          <Text strong={pageNumber === i}>Страница {i}</Text>
        </List.Item>
      );
    }
    return pages;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return <Empty description="Книга не найдена" />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(`/books/${bookId}`)}
            style={{ marginRight: '16px' }}
          >
            Назад
          </Button>
          
          <Button 
            icon={<MenuOutlined />} 
            onClick={() => setDrawerVisible(true)}
            style={{ marginRight: '16px' }}
          >
            Оглавление
          </Button>
          
          <div>
            <Title level={5} style={{ margin: 0 }}>{book.title}</Title>
            <Text type="secondary">{book.author}</Text>
          </div>
        </div>
        
        <Space>
          <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
          <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
          <Button icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
          <Button 
            icon={isFavorite ? <HeartFilled /> : <HeartOutlined />} 
            onClick={toggleFavorite}
          />
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => navigate(`/books/${bookId}`)}
          />
        </Space>
      </Header>
      
      <Content style={{ 
        backgroundColor: '#f0f2f5',
        padding: '24px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '24px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px'
        }}>
          <Document
            file={book.fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Spin />}
            error={<div>Не удалось загрузить PDF. Пожалуйста, попробуйте позже.</div>}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          maxWidth: '600px', 
          marginTop: '16px' 
        }}>
          <Button 
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            size="large"
          >
            Предыдущая
          </Button>
          
          <div style={{ textAlign: 'center' }}>
            <Text>Страница {pageNumber} из {numPages || '?'}</Text>
            <br />
            <Slider
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={(value) => { setPageNumber(value); saveReadingProgress(value); }}
              style={{ width: '200px', margin: '0 16px' }}
            />
          </div>
          
          <Button 
            onClick={goToNextPage}
            disabled={numPages !== null && pageNumber >= numPages}
            size="large"
          >
            Следующая
          </Button>
        </div>
      </Content>
      
      <Drawer
        title="Оглавление"
        placement="left"
        width={300}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Button icon={<CloseOutlined />} onClick={() => setDrawerVisible(false)} />
        }
      >
        <List>
          {renderPageList()}
        </List>
      </Drawer>
    </Layout>
  );
};

export default BookReaderPage;
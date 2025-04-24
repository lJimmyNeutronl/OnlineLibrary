import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../../features/books/types';
import { 
  Typography, 
  Tag,
  Divider,
  Tabs,
  Row, 
  Col,
  Space,
  Button
} from '../../../shared/ui';
import { TabPane } from '../../../shared/ui/Tabs';
import { 
  FiShare2, 
  FiUser 
} from 'react-icons/fi';
import { 
  BookInfoHeader,
  CategoryTagsContainer,
  BottomActionsContainer
} from '../BookDetailPage.styles';

const { Title, Text, Paragraph } = Typography;

interface BookInfoProps {
  book: Book;
}

/**
 * Компонент для отображения информации о книге
 */
const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
  return (
    <>
      <Title level={2} style={{ marginTop: 0 }}>{book.title}</Title>
      
      <BookInfoHeader>
        <Text strong style={{ fontSize: '18px' }}>
          {book.authors.map(author => author.name).join(', ')}
        </Text>
      </BookInfoHeader>
      
      <CategoryTagsContainer>
        {book.categories.map(category => (
          <Tag color="blue" key={category.id} style={{ marginRight: '8px' }}>
            <Link to={`/categories/${category.id}`} style={{ color: 'inherit' }}>
              {category.name}
            </Link>
          </Tag>
        ))}
      </CategoryTagsContainer>
      
      <Divider />
      
      <Tabs defaultActiveKey="description">
        <TabPane tab="Описание" key="description">
          <Paragraph>{book.description}</Paragraph>
        </TabPane>
        
        <TabPane tab="Информация" key="info">
          <Row gutter={[16, 16]}>
            {book.publicationYear && (
              <Col span={12}>
                <Text strong>Год издания:</Text>
                <Paragraph>{book.publicationYear}</Paragraph>
              </Col>
            )}
            <Col span={12}>
              <Text strong>Язык:</Text>
              <Paragraph>{book.language || 'Не указан'}</Paragraph>
            </Col>
            {book.pages && (
              <Col span={12}>
                <Text strong>Количество страниц:</Text>
                <Paragraph>{book.pages}</Paragraph>
              </Col>
            )}
            {book.isbn && (
              <Col span={24}>
                <Text strong>ISBN:</Text>
                <Paragraph>{book.isbn}</Paragraph>
              </Col>
            )}
          </Row>
        </TabPane>
      </Tabs>
      
      <Divider />
      
      <BottomActionsContainer>
        <Space>
          <Button icon={<FiShare2 size={20} />}>Поделиться</Button>
          <Button icon={<FiUser size={20} />}>Другие книги автора</Button>
        </Space>
      </BottomActionsContainer>
    </>
  );
};

export default BookInfo; 
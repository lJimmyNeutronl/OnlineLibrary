import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Input, 
  Spin
} from '../../../shared/ui';
import { 
  BooksPageContainer,
  BooksPageHeader,
  BooksPageContent,
  ActionsSection,
  TableContainer
} from './BooksPage.styles';
import { FiPlus } from 'react-icons/fi';
import { useBooks } from '../../../features/books/hooks/useBooks';
import { useAdminBooks } from './hooks/useAdminBooks';
import BookTable from './components/BookTable';

const { Title } = Typography;

/**
 * Страница управления книгами в административной панели
 */
const BooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, isLoading } = useBooks();
  const { 
    filteredBooks, 
    searchText, 
    pagination, 
    handleSearch, 
    handleDeleteBook, 
    handleTableChange 
  } = useAdminBooks(books);

  const handleEditBook = (id: number) => {
    navigate(`/admin/books/edit/${id}`);
  };

  return (
    <BooksPageContainer>
      <BooksPageHeader>
        <Title level={2}>Управление книгами</Title>
        <Button 
          type="primary" 
          icon={<FiPlus />}
          onClick={() => navigate('/admin/books/add')}
        >
          Добавить книгу
        </Button>
      </BooksPageHeader>
      
      <ActionsSection>
        <Input 
          placeholder="Поиск по названию или автору" 
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<FiPlus />}
          style={{ width: 300 }}
        />
      </ActionsSection>
      
      <BooksPageContent>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <TableContainer>
            <BookTable 
              books={filteredBooks}
              pagination={pagination}
              onTableChange={handleTableChange}
              onViewBook={(id) => navigate(`/books/${id}`)}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
            />
          </TableContainer>
        )}
      </BooksPageContent>
    </BooksPageContainer>
  );
};

export default BooksPage; 
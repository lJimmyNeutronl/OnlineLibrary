import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Typography, 
  Tag, 
  Tooltip, 
  Modal,
  message,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;

interface Book {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
  categories: { id: number; name: string }[];
  uploadDate: string;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const AdminBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    // Имитация загрузки списка книг
    setLoading(true);
    setTimeout(() => {
      const mockBooks: Book[] = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        title: `Книга ${index + 1}`,
        author: `Автор ${(index % 5) + 1}`,
        publicationYear: 2020 - (index % 10),
        categories: [
          { id: (index % 6) + 1, name: getCategoryName((index % 6) + 1) }
        ],
        uploadDate: new Date(Date.now() - (index * 86400000)).toISOString()
      }));
      
      setBooks(mockBooks);
      setFilteredBooks(mockBooks);
      setPagination(prev => ({ ...prev, total: mockBooks.length }));
      setLoading(false);
    }, 1000);
  }, []);

  const getCategoryName = (id: number): string => {
    const categoriesMap = {
      1: 'Фантастика',
      2: 'Детективы',
      3: 'Научная литература',
      4: 'История',
      5: 'Искусство',
      6: 'Романы'
    };
    return (categoriesMap as any)[id] || 'Категория';
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value) {
      const filtered = books.filter(
        book => 
          book.title.toLowerCase().includes(value.toLowerCase()) ||
          book.author.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBooks(filtered);
      setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
    } else {
      setFilteredBooks(books);
      setPagination(prev => ({ ...prev, current: 1, total: books.length }));
    }
  };

  const handleEditBook = (id: number) => {
    navigate(`/admin/books/edit/${id}`);
  };

  const handleDeleteBook = (id: number) => {
    // В реальном приложении здесь будет API-запрос для удаления книги
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    
    // Обновляем также отфильтрованный список
    const updatedFilteredBooks = filteredBooks.filter(book => book.id !== id);
    setFilteredBooks(updatedFilteredBooks);
    
    // Обновляем пагинацию
    setPagination(prev => ({ ...prev, total: updatedFilteredBooks.length }));
    
    message.success('Книга успешно удалена');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
      total: pagination.total
    });
  };

  const columns: ColumnsType<Book> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <a onClick={() => navigate(`/books/${record.id}`)}>{text}</a>
      )
    },
    {
      title: 'Автор',
      dataIndex: 'author',
      key: 'author',
      sorter: (a, b) => a.author.localeCompare(b.author)
    },
    {
      title: 'Год',
      dataIndex: 'publicationYear',
      key: 'publicationYear',
      width: 100,
      sorter: (a, b) => a.publicationYear - b.publicationYear
    },
    {
      title: 'Категории',
      key: 'categories',
      dataIndex: 'categories',
      render: (_, { categories }) => (
        <>
          {categories.map(category => (
            <Tag color="blue" key={category.id}>
              {category.name}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
    },
    {
      title: 'Действия',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Просмотр">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/books/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditBook(record.id)}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Popconfirm
              title="Удалить книгу"
              description="Вы уверены, что хотите удалить эту книгу?"
              onConfirm={() => handleDeleteBook(record.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-books-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <Title level={2}>Управление книгами</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/books/add')}
        >
          Добавить книгу
        </Button>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Поиск по названию или автору"
          allowClear
          enterButton={<><SearchOutlined /> Найти</>}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ maxWidth: '500px' }}
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredBooks}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(newPagination) => handleTableChange(newPagination)}
      />
    </div>
  );
};

export default AdminBooks; 
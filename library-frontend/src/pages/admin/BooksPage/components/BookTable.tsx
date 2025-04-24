import React from 'react';
import { 
  Table, 
  Space, 
  Button, 
  Tag, 
  Tooltip 
} from '../../../../shared/ui';
import { Book } from '../../../../features/books/types';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

interface BookTableProps {
  books: Book[];
  pagination: PaginationState;
  onTableChange: (pagination: any) => void;
  onViewBook: (id: number) => void;
  onEditBook: (id: number) => void;
  onDeleteBook: (id: number) => void;
}

/**
 * Компонент для отображения таблицы книг в административной панели
 */
const BookTable: React.FC<BookTableProps> = ({
  books,
  pagination,
  onTableChange,
  onViewBook,
  onEditBook,
  onDeleteBook
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a: Book, b: Book) => a.id - b.id
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: Book, b: Book) => a.title.localeCompare(b.title),
      render: (text: string, record: Book) => (
        <a onClick={() => onViewBook(record.id)}>{text}</a>
      )
    },
    {
      title: 'Авторы',
      key: 'authors',
      render: (_: any, record: Book) => (
        <span>
          {record.authors.map(author => author.name).join(', ')}
        </span>
      )
    },
    {
      title: 'Год',
      dataIndex: 'publicationYear',
      key: 'publicationYear',
      width: 100
    },
    {
      title: 'Категории',
      key: 'categories',
      render: (_: any, record: Book) => (
        <>
          {record.categories.map(category => (
            <Tag color="blue" key={category.id} style={{ marginRight: '4px' }}>
              {category.name}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: 'Добавлена',
      key: 'createdAt',
      render: (_: any, record: Book) => (
        <span>{formatDate(record.createdAt)}</span>
      )
    },
    {
      title: 'Действия',
      key: 'action',
      width: 180,
      render: (_: any, record: Book) => (
        <Space size="small">
          <Tooltip title="Просмотр">
            <Button 
              type="text" 
              onClick={() => onViewBook(record.id)}
            >
              <FiEye size={18} />
            </Button>
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button 
              type="text" 
              onClick={() => onEditBook(record.id)}
            >
              <FiEdit size={18} />
            </Button>
          </Tooltip>
          <Tooltip title="Удалить">
            <Button 
              type="text" 
              danger 
              onClick={() => {
                if (window.confirm('Вы действительно хотите удалить эту книгу?')) {
                  onDeleteBook(record.id);
                }
              }}
            >
              <FiTrash2 size={18} />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={books}
      rowKey="id"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total: number) => `Всего ${total} книг`
      }}
      onChange={onTableChange}
    />
  );
};

export default BookTable; 
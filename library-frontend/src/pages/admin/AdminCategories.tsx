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
  Form,
  Select,
  message,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  BookOutlined,
  SaveOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;

interface Category {
  id: number;
  name: string;
  bookCount: number;
  parentCategoryId: number | null;
  parentCategoryName?: string;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const AdminCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Имитация загрузки списка категорий
    setLoading(true);
    setTimeout(() => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Фантастика', bookCount: 45, parentCategoryId: null },
        { id: 2, name: 'Детективы', bookCount: 32, parentCategoryId: null },
        { id: 3, name: 'Научная литература', bookCount: 28, parentCategoryId: null },
        { id: 4, name: 'История', bookCount: 19, parentCategoryId: null },
        { id: 5, name: 'Искусство', bookCount: 24, parentCategoryId: null },
        { id: 6, name: 'Романы', bookCount: 38, parentCategoryId: null },
        { id: 7, name: 'Фэнтези', bookCount: 29, parentCategoryId: 1, parentCategoryName: 'Фантастика' },
        { id: 8, name: 'Научная фантастика', bookCount: 16, parentCategoryId: 1, parentCategoryName: 'Фантастика' },
        { id: 9, name: 'Криминальный детектив', bookCount: 18, parentCategoryId: 2, parentCategoryName: 'Детективы' },
        { id: 10, name: 'Исторический детектив', bookCount: 14, parentCategoryId: 2, parentCategoryName: 'Детективы' },
      ];
      
      setCategories(mockCategories);
      setFilteredCategories(mockCategories);
      setPagination(prev => ({ ...prev, total: mockCategories.length }));
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value) {
      const filtered = categories.filter(
        category => category.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
      setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
    } else {
      setFilteredCategories(categories);
      setPagination(prev => ({ ...prev, current: 1, total: categories.length }));
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCategory = (id: number) => {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue({
        name: category.name,
        parentCategoryId: category.parentCategoryId
      });
      setIsModalVisible(true);
    }
  };

  const handleDeleteCategory = (id: number) => {
    // В реальном приложении здесь будет API-запрос для удаления категории
    const updatedCategories = categories.filter(category => category.id !== id);
    setCategories(updatedCategories);
    
    // Обновляем также отфильтрованный список
    const updatedFilteredCategories = filteredCategories.filter(category => category.id !== id);
    setFilteredCategories(updatedFilteredCategories);
    
    // Обновляем пагинацию
    setPagination(prev => ({ ...prev, total: updatedFilteredCategories.length }));
    
    message.success('Категория успешно удалена');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalSubmit = () => {
    form.validateFields().then(values => {
      if (editingCategory) {
        // Редактирование категории
        const updatedCategories = categories.map(category => {
          if (category.id === editingCategory.id) {
            const parentCategory = values.parentCategoryId 
              ? categories.find(cat => cat.id === values.parentCategoryId) 
              : null;
            
            return {
              ...category,
              name: values.name,
              parentCategoryId: values.parentCategoryId,
              parentCategoryName: parentCategory ? parentCategory.name : undefined
            };
          }
          return category;
        });
        
        setCategories(updatedCategories);
        setFilteredCategories(updatedCategories);
        message.success('Категория успешно обновлена');
      } else {
        // Добавление новой категории
        const newId = Math.max(...categories.map(c => c.id)) + 1;
        const parentCategory = values.parentCategoryId 
          ? categories.find(cat => cat.id === values.parentCategoryId) 
          : null;
          
        const newCategory: Category = {
          id: newId,
          name: values.name,
          bookCount: 0,
          parentCategoryId: values.parentCategoryId,
          parentCategoryName: parentCategory ? parentCategory.name : undefined
        };
        
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        setFilteredCategories(updatedCategories);
        setPagination(prev => ({ ...prev, total: updatedCategories.length }));
        message.success('Категория успешно добавлена');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
      total: pagination.total
    });
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Родительская категория',
      key: 'parentCategory',
      render: (_, record) => (
        record.parentCategoryName ? <Tag color="blue">{record.parentCategoryName}</Tag> : <span>—</span>
      )
    },
    {
      title: 'Книг',
      dataIndex: 'bookCount',
      key: 'bookCount',
      width: 100,
      sorter: (a, b) => a.bookCount - b.bookCount
    },
    {
      title: 'Действия',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Просмотр книг">
            <Button 
              type="text" 
              icon={<BookOutlined />} 
              onClick={() => navigate(`/categories/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditCategory(record.id)}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Popconfirm
              title="Удалить категорию"
              description="Вы уверены, что хотите удалить эту категорию?"
              onConfirm={() => handleDeleteCategory(record.id)}
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
    <div className="admin-categories-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <Title level={2}>Управление категориями</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddCategory}
        >
          Добавить категорию
        </Button>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Поиск по названию"
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
        dataSource={filteredCategories}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(newPagination) => handleTableChange(newPagination)}
      />
      
      <Modal
        title={editingCategory ? "Редактирование категории" : "Добавление категории"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Отмена
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleModalSubmit}
          >
            {editingCategory ? "Сохранить" : "Добавить"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="categoryForm"
        >
          <Form.Item
            name="name"
            label="Название категории"
            rules={[{ required: true, message: 'Пожалуйста, введите название категории' }]}
          >
            <Input placeholder="Введите название категории" />
          </Form.Item>
          
          <Form.Item
            name="parentCategoryId"
            label="Родительская категория"
          >
            <Select
              allowClear
              placeholder="Выберите родительскую категорию"
              options={categories
                .filter(cat => !cat.parentCategoryId && (!editingCategory || cat.id !== editingCategory.id))
                .map(cat => ({ value: cat.id, label: cat.name }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories; 
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  Create,
  SimpleForm,
  TextInput,
  required,
  Edit,
  Show,
  SimpleShowLayout,
  Filter,
  SearchInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  NumberField,
  DateField,
  ReferenceInput,
  SelectInput,
  ReferenceField,
  FunctionField,
  useRecordContext,
  useNotify,
  usePermissions,
  Button,
} from 'react-admin';
import {
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import './categories.css';

// Фильтры для списка категорий
const CategoryFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput placeholder="Поиск по названию" source="q" alwaysOn />
    <SelectInput 
      source="isRoot" 
      label="Тип категории"
      choices={[
        { id: 'true', name: 'Только родительские' },
        { id: 'false', name: 'Только подкатегории' },
      ]}
      emptyText="Все категории"
    />
  </Filter>
);

// Действия для списка категорий
const CategoryListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

// Список категорий
export const CategoryList = () => (
  <List
    filters={<CategoryFilter />}
    actions={<CategoryListActions />}
    perPage={25}
    sort={{ field: 'name', order: 'ASC' }}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="name" label="Название" />
      <FunctionField 
        label="Тип" 
        render={(record: any) => {
          const isRoot = !record.parentCategoryId;
          return (
            <Chip
              label={isRoot ? 'Родительская' : 'Подкатегория'}
              color={isRoot ? 'primary' : 'secondary'}
              size="small"
            />
          );
        }}
      />
      <FunctionField 
        label="Количество книг" 
        render={(record: any) => {
          // CategoryWithCountDTO возвращает поле bookCount
          return record.bookCount !== undefined ? record.bookCount : 0;
        }}
      />
    </Datagrid>
  </List>
);

// Создание категории
export const CategoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Название" validate={required()} fullWidth />
      <ReferenceInput 
        source="parentCategoryId" 
        reference="categories" 
        label="Родительская категория"
        filter={{ parentCategoryId: null }} // Показываем только родительские категории
      >
        <SelectInput 
          optionText="name" 
          emptyText="Создать как родительскую категорию"
        />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

// Редактирование категории
export const CategoryEdit = () => {
  const { permissions } = usePermissions();
  
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" label="Название" validate={required()} fullWidth />
        <ReferenceInput 
          source="parentCategoryId" 
          reference="categories" 
          label="Родительская категория"
          filter={{ parentCategoryId: null }} // Показываем только родительские категории
        >
          <SelectInput 
            optionText="name" 
            emptyText="Сделать родительской категорией"
          />
        </ReferenceInput>
      </SimpleForm>
      
      {/* Показываем кнопку принудительного удаления только для суперадминов */}
      {permissions && isSuperAdminUser(permissions) && (
        <TopToolbar>
          <ForceDeleteButton />
        </TopToolbar>
      )}
    </Edit>
  );
};

// Просмотр категории
export const CategoryShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" label="Название" />
      <FunctionField 
        label="Тип категории" 
        render={(record: any) => {
          const isRoot = !record.parentCategoryId;
          return (
            <Chip
              label={isRoot ? 'Родительская' : 'Подкатегория'}
              color={isRoot ? 'primary' : 'secondary'}
              size="small"
            />
          );
        }}
      />
      <FunctionField 
        label="Родительская категория" 
        render={(record: any) => {
          if (!record.parentCategoryId) {
            return <Typography variant="body2" className="empty-field-text">—</Typography>;
          }
          return (
            <ReferenceField 
              source="parentCategoryId" 
              reference="categories" 
              link={false}
              record={record}
            >
              <TextField source="name" />
            </ReferenceField>
          );
        }}
      />
      <FunctionField 
        label="Количество книг" 
        render={(record: any) => {
          return record.bookCount !== undefined ? record.bookCount : 0;
        }}
      />
      <DateField source="createdAt" label="Создано" showTime />
      <DateField source="updatedAt" label="Обновлено" showTime />
    </SimpleShowLayout>
  </Show>
);

// Функция для проверки, является ли пользователь суперадмином
const isSuperAdminUser = (permissions: string[]): boolean => {
  return permissions.includes('ROLE_SUPERADMIN');
};

// Кнопка принудительного удаления для суперадминов
const ForceDeleteButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  if (!record) return null;

  const handleForceDelete = () => {
    const url = `/api/categories/${record.id}/force`;
    
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка принудительного удаления категории');
      }
      notify('Категория принудительно удалена со всеми подкатегориями', { type: 'success' });
      setDialogOpen(false);
      // Перенаправляем на список категорий
      window.location.href = '/admin/categories';
    })
    .catch((error) => {
      notify(error.message, { type: 'error' });
      setDialogOpen(false);
    });
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        startIcon={<DeleteForeverIcon />}
        variant="contained"
        color="error"
        size="small"
      >
        Принудительное удаление
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Принудительное удаление категории "{record.name}"</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom color="error">
            <strong>ВНИМАНИЕ!</strong> Это действие нельзя отменить.
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Принудительное удаление:
          </Typography>
          <ul>
            <li>Удалит категорию "{record.name}"</li>
            <li>Удалит все её подкатегории</li>
            <li>Уберет связи с книгами (сами книги останутся)</li>
          </ul>
          
          <Typography variant="body2" color="textSecondary" mt={2}>
            Используйте эту функцию только если обычное удаление не работает из-за наличия подкатегорий или книг.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleForceDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteForeverIcon />}
          >
            Принудительно удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 
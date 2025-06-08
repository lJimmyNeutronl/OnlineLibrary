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
} from 'react-admin';
import {
  Chip,
  Typography,
} from '@mui/material';
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
      <TextInput source="description" label="Описание" multiline rows={3} fullWidth />
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
export const CategoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Название" validate={required()} fullWidth />
      <TextInput source="description" label="Описание" multiline rows={3} fullWidth />
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
  </Edit>
);

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
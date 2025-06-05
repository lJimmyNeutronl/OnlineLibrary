import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  required,
  minValue,
  maxValue,
  Filter,
  SearchInput,
  ReferenceArrayInput,
  AutocompleteArrayInput,
  useRecordContext,
  TopToolbar,
  CreateButton,
  ExportButton,
  Edit,
  Show,
  SimpleShowLayout,
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Book as BookIcon,
  DateRange as DateIcon,
  Language as LanguageIcon,
  Description as PagesIcon,
} from '@mui/icons-material';

// Фильтры для списка книг
const BookFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput placeholder="Поиск по названию или автору" source="q" alwaysOn />
    <SelectInput
      source="language"
      choices={[
        { id: 'ru', name: 'Русский' },
        { id: 'en', name: 'English' },
        { id: 'de', name: 'Deutsch' },
        { id: 'fr', name: 'Français' },
      ]}
      emptyText="Все языки"
    />
    <NumberInput source="yearFrom" label="Год от" />
    <NumberInput source="yearTo" label="Год до" />
    <NumberInput source="minRating" label="Мин. рейтинг" step={0.1} />
  </Filter>
);

// Компонент для отображения категорий
const CategoriesField = () => {
  const record = useRecordContext();
  if (!record || !record.categories) return null;
  
  return (
    <Box>
      {record.categories.map((category: any) => (
        <Chip
          key={category.id}
          label={category.name}
          size="small"
          variant="outlined"
          style={{ margin: '2px' }}
        />
      ))}
    </Box>
  );
};

// Компонент для отображения обложки книги
const BookCoverField = () => {
  const record = useRecordContext();
  if (!record || !record.coverImageUrl) return null;
  
  return (
    <Avatar
      src={record.coverImageUrl}
      alt={record.title}
      variant="rounded"
      sx={{ width: 60, height: 80 }}
    >
      <BookIcon />
    </Avatar>
  );
};

// Компонент для отображения рейтинга в списке
const RatingField = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const rating = record.rating ? parseFloat(record.rating).toFixed(1) : 'Нет оценок';
  const ratingsCount = record.ratingsCount || 0;
  
  return (
    <Box>
      <Typography variant="body2">
        ⭐ {rating}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        ({ratingsCount} оценок)
      </Typography>
    </Box>
  );
};

// Компонент для отображения рейтинга в детальном просмотре
const DetailedRatingField = () => {
  const record = useRecordContext();
  
  if (!record) return null;
  
  // Используем ту же логику, что и в RatingField
  const rating = record.rating ? parseFloat(record.rating).toFixed(1) : 'Нет оценок';
  const ratingsCount = record.ratingsCount || 0;
  
  return (
    <Box>
      <Typography variant="body2">
        ⭐ {rating}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        ({ratingsCount} оценок)
      </Typography>
    </Box>
  );
};

// Действия для списка книг (без FilterButton, так как фильтры уже переданы в List)
const BookListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

// Список книг
export const BookList = () => (
  <List
    filters={<BookFilter />}
    actions={<BookListActions />}
    perPage={25}
    sort={{ field: 'uploadDate', order: 'DESC' }}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <BookCoverField />
      <TextField source="title" label="Название" />
      <TextField source="author" label="Автор" />
      <CategoriesField />
      <NumberField source="publicationYear" label="Год" />
      <TextField source="language" label="Язык" />
      <NumberField source="pageCount" label="Страниц" />
      <RatingField />
      <DateField source="uploadDate" label="Добавлено" showTime />
    </Datagrid>
  </List>
);

// Создание книги
export const BookCreate = () => (
  <Create>
    <SimpleForm>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <TextInput source="title" label="Название" validate={required()} fullWidth />
            <TextInput source="author" label="Автор" validate={required()} fullWidth />
            <TextInput source="description" label="Описание" multiline rows={4} fullWidth />
            <TextInput source="isbn" label="ISBN" fullWidth />
          </Box>
          
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <NumberInput 
              source="publicationYear" 
              label="Год публикации" 
              validate={[minValue(1000), maxValue(new Date().getFullYear())]}
              fullWidth 
            />
            <TextInput source="publisher" label="Издательство" fullWidth />
            <SelectInput
              source="language"
              label="Язык"
              choices={[
                { id: 'ru', name: 'Русский' },
                { id: 'en', name: 'English' },
                { id: 'de', name: 'Deutsch' },
                { id: 'fr', name: 'Français' },
              ]}
              validate={required()}
              fullWidth
            />
            <NumberInput 
              source="pageCount" 
              label="Количество страниц" 
              validate={minValue(1)}
              fullWidth 
            />
          </Box>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <TextInput source="fileUrl" label="URL файла книги" validate={required()} fullWidth />
          <TextInput source="coverImageUrl" label="URL обложки" fullWidth />
          <ReferenceArrayInput
            source="categoryIds"
            reference="categories"
            label="Категории"
          >
            <AutocompleteArrayInput 
              optionText="name"
              optionValue="id"
              fullWidth
            />
          </ReferenceArrayInput>
        </Box>
      </Box>
    </SimpleForm>
  </Create>
);

// Редактирование книги
export const BookEdit = () => (
  <Edit>
    <SimpleForm>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <TextInput source="title" label="Название" validate={required()} fullWidth />
            <TextInput source="author" label="Автор" validate={required()} fullWidth />
            <TextInput source="description" label="Описание" multiline rows={4} fullWidth />
            <TextInput source="isbn" label="ISBN" fullWidth />
          </Box>
          
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <NumberInput 
              source="publicationYear" 
              label="Год публикации" 
              validate={[minValue(1000), maxValue(new Date().getFullYear())]}
              fullWidth 
            />
            <TextInput source="publisher" label="Издательство" fullWidth />
            <SelectInput
              source="language"
              label="Язык"
              choices={[
                { id: 'ru', name: 'Русский' },
                { id: 'en', name: 'English' },
                { id: 'de', name: 'Deutsch' },
                { id: 'fr', name: 'Français' },
              ]}
              validate={required()}
              fullWidth
            />
            <NumberInput 
              source="pageCount" 
              label="Количество страниц" 
              validate={minValue(1)}
              fullWidth 
            />
          </Box>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextInput 
              source="rating" 
              label="Рейтинг"
              disabled
              helperText="Рейтинг рассчитывается автоматически на основе оценок пользователей"
              sx={{ width: '200px' }}
            />
            <TextInput 
              source="ratingsCount" 
              label="Количество оценок"
              disabled
              sx={{ width: '200px' }}
            />
          </Box>
          
          <TextInput source="fileUrl" label="URL файла книги" validate={required()} fullWidth />
          <TextInput source="coverImageUrl" label="URL обложки" fullWidth />
          <ReferenceArrayInput
            source="categoryIds"
            reference="categories"
            label="Категории"
          >
            <AutocompleteArrayInput 
              optionText="name"
              optionValue="id"
              fullWidth
            />
          </ReferenceArrayInput>
        </Box>
      </Box>
    </SimpleForm>
  </Edit>
);

// Просмотр книги
export const BookShow = () => (
  <Show>
    <SimpleShowLayout>
      <Card sx={{ maxWidth: 1200, margin: 'auto', mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Обложка книги */}
            <Box sx={{ minWidth: 200, textAlign: 'center' }}>
              <BookCoverField />
            </Box>
            
            {/* Основная информация */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography variant="h4" gutterBottom>
                <TextField source="title" />
              </Typography>
              
              <Typography variant="h6" color="text.secondary" gutterBottom>
                <TextField source="author" />
              </Typography>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <CategoriesField />
              </Box>
              
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Год публикации
                      </Typography>
                      <Typography>
                        <NumberField source="publicationYear" />
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Язык
                      </Typography>
                      <Typography>
                        <TextField source="language" />
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PagesIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Страниц
                      </Typography>
                      <Typography>
                        <NumberField source="pageCount" />
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Рейтинг
                    </Typography>
                    <DetailedRatingField />
                  </Box>
                </Box>
              </Paper>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Описание
              </Typography>
              <Typography variant="body1" paragraph>
                <TextField source="description" />
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Дополнительная информация
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Издательство
                    </Typography>
                    <Typography>
                      <TextField source="publisher" />
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ISBN
                    </Typography>
                    <Typography>
                      <TextField source="isbn" />
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Дата загрузки
                    </Typography>
                    <Typography>
                      <DateField source="uploadDate" showTime />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </SimpleShowLayout>
  </Show>
); 
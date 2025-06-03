import { Admin, Resource, Layout, AppBar, Menu, MenuItemLink, UserMenu, Logout } from 'react-admin';
import { Dashboard as DashboardIcon, People as PeopleIcon, Book as BookIcon, Category as CategoryIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, MenuItem } from '@mui/material';

import dataProvider from './providers/dataProvider';
import authProvider from './providers/authProvider';
import Dashboard from './components/Dashboard';
import { UserList, UserShow } from './resources/users';
import { BookList, BookCreate, BookEdit, BookShow } from './resources/books.tsx';
import { CategoryList, CategoryCreate, CategoryEdit, CategoryShow } from './resources/categories';
import { useAppSelector } from '../hooks/reduxHooks';

// Кастомное меню
const AdminMenu = () => (
  <Menu>
    <MenuItemLink to="/admin" primaryText="Панель управления" leftIcon={<DashboardIcon />} />
    <MenuItemLink to="/admin/users" primaryText="Пользователи" leftIcon={<PeopleIcon />} />
    <MenuItemLink to="/admin/books" primaryText="Книги" leftIcon={<BookIcon />} />
    <MenuItemLink to="/admin/categories" primaryText="Категории" leftIcon={<CategoryIcon />} />
  </Menu>
);

// Кастомная панель пользователя
const AdminUserMenu = () => {
  const navigate = useNavigate();
  
  return (
    <UserMenu>
      <MenuItem onClick={() => navigate('/')}>
        Вернуться на сайт
      </MenuItem>
      <Logout />
    </UserMenu>
  );
};

// Кастомный AppBar
const AdminAppBar = () => (
  <AppBar userMenu={<AdminUserMenu />}>
    <Typography variant="h6" color="inherit" sx={{ flex: 1 }}>
      Административная панель - Онлайн библиотека
    </Typography>
  </AppBar>
);

// Кастомный Layout
const AdminLayout = (props: any) => (
  <Layout 
    {...props} 
    menu={AdminMenu}
    appBar={AdminAppBar}
  />
);

const AdminApp = () => {
  const { user } = useAppSelector(state => state.auth);

  // Проверяем, есть ли у пользователя права администратора
  const hasAdminRights = user?.roles?.some((role: any) => 
    role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN' || 
    role.name === 'ROLE_ADMIN' || role.name === 'ROLE_SUPERADMIN'
  );

  if (!user || !hasAdminRights) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column">
        <Typography variant="h4" color="error" gutterBottom>
          Доступ запрещен
        </Typography>
        <Typography variant="body1" color="textSecondary">
          У вас нет прав для доступа к административной панели
        </Typography>
      </Box>
    );
  }

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      layout={AdminLayout}
      basename="/admin"
      title="Админ-панель"
    >
      <Resource 
        name="users" 
        list={UserList} 
        show={UserShow}
        icon={PeopleIcon}
        options={{ label: 'Пользователи' }}
      />
      <Resource 
        name="books" 
        list={BookList} 
        create={BookCreate}
        edit={BookEdit} 
        show={BookShow}
        icon={BookIcon}
        options={{ label: 'Книги' }}
      />
      <Resource 
        name="categories" 
        list={CategoryList}
        create={CategoryCreate}
        edit={CategoryEdit}
        show={CategoryShow}
        icon={CategoryIcon}
        options={{ label: 'Категории' }}
      />
    </Admin>
  );
};

export default AdminApp; 
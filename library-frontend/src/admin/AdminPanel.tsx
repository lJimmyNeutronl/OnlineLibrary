import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';

const drawerWidth = 240;

interface AdminPanelProps {}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleExitPanel = () => {
    navigate('/');
  };

  const menuItems = [
    {
      id: 'dashboard',
      text: 'Панель управления',
      icon: <DashboardIcon />,
    },
    {
      id: 'users',
      text: 'Пользователи',
      icon: <PeopleIcon />,
    },
    {
      id: 'books',
      text: 'Книги',
      icon: <BookIcon />,
      disabled: true,
    },
    {
      id: 'categories',
      text: 'Категории',
      icon: <CategoryIcon />,
      disabled: true,
    },
    {
      id: 'settings',
      text: 'Настройки',
      icon: <SettingsIcon />,
      disabled: true,
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'books':
        return (
          <div style={{ padding: '24px' }}>
            <Typography variant="h4">Управление книгами</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Эта функция скоро будет доступна
            </Typography>
          </div>
        );
      case 'categories':
        return (
          <div style={{ padding: '24px' }}>
            <Typography variant="h4">Управление категориями</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Эта функция скоро будет доступна
            </Typography>
          </div>
        );
      case 'settings':
        return (
          <div style={{ padding: '24px' }}>
            <Typography variant="h4">Настройки системы</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Эта функция скоро будет доступна
            </Typography>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Админ-панель
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedTab === item.id}
              onClick={() => handleTabChange(item.id)}
              disabled={item.disabled}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  color: item.disabled ? 'text.disabled' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleExitPanel}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Выйти из панели" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Административная панель - Онлайн библиотека
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AdminPanel; 
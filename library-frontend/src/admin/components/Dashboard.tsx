import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { People, Book, Category, AdminPanelSettings } from '@mui/icons-material';
import axios from 'axios';

interface StatisticsData {
  totalUsers: number;
  adminCount?: number;
  totalBooks: number;
  totalCategories: number;
}

const Dashboard = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Нет токена авторизации');
        }

        // Получаем статистику пользователей
        const usersResponse = await axios.get('http://localhost:8080/api/users/admin/statistics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Получаем количество книг
        const booksResponse = await axios.get('http://localhost:8080/api/books?page=0&size=1', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Получаем количество категорий
        const categoriesResponse = await axios.get('http://localhost:8080/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStatistics({
          ...usersResponse.data,
          totalBooks: booksResponse.data.totalElements || 0,
          totalCategories: Array.isArray(categoriesResponse.data) ? categoriesResponse.data.length : 0,
        });
      } catch (err: any) {
        console.error('Ошибка загрузки статистики:', err);
        setError(err.response?.data?.message || err.message || 'Ошибка загрузки статистики');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          Ошибка: {error}
        </Typography>
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card sx={{ height: '100%', minHeight: '120px' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель администратора
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        Добро пожаловать в административную панель онлайн-библиотеки!
      </Typography>

      {/* Статистические карточки */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <StatCard
          title="Всего пользователей"
          value={statistics?.totalUsers || 0}
          icon={<People />}
          color="#1976d2"
        />

        {statistics?.adminCount !== undefined && (
          <StatCard
            title="Администраторы"
            value={statistics.adminCount}
            icon={<AdminPanelSettings />}
            color="#ed6c02"
          />
        )}

        <StatCard
          title="Книги"
          value={statistics?.totalBooks || 0}
          icon={<Book />}
          color="#2e7d32"
        />

        <StatCard
          title="Категории"
          value={statistics?.totalCategories || 0}
          icon={<Category />}
          color="#9c27b0"
        />
      </div>

      {/* Информационные карточки */}
      <Box mt={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Возможности админ-панели
        </Typography>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Управление пользователями
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Просмотр списка всех пользователей<br/>
                • Назначение и отзыв роли администратора<br/>
                • Блокировка пользователей<br/>
                • Просмотр статистики пользователей
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Управление контентом
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Управление книгами и категориями<br/>
                • Добавление и редактирование книг<br/>
                • Создание и изменение категорий<br/>
                • Просмотр статистики контента
              </Typography>
            </CardContent>
          </Card>
        </div>
      </Box>
    </div>
  );
};

export default Dashboard; 
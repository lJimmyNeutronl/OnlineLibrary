import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { MainLayout } from '../../widgets/layouts/MainLayout';

// Импортируем страницы
import HomePage from '../../pages/HomePage';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import BooksPage from '../../pages/BooksPage';
import BookDetailPage from '../../pages/BookDetailPage';
import BookReaderPage from '../../pages/BookReaderPage';
import { ProfilePage } from '../../features/profile';
import NotFoundPage from '../../pages/NotFoundPage';

// Импортируем административные страницы
import { AdminBooksPage } from '../../pages/admin';

/**
 * Основной компонент маршрутизации приложения
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/:bookId" element={<BookDetailPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="books/:bookId/read" element={<BookReaderPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="admin">
            <Route index element={<div>Dashboard</div>} />
            <Route path="books" element={<AdminBooksPage />} />
            <Route path="books/add" element={<div>Add Book</div>} />
            <Route path="books/edit/:id" element={<div>Edit Book</div>} />
            <Route path="categories" element={<div>Categories</div>} />
            <Route path="users" element={<div>Users</div>} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 
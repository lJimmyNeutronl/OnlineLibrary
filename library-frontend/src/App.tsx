import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import { loadCurrentUser } from './store/slices/authSlice';
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import BookReaderPage from './pages/BookReaderPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryBooksPage from './pages/CategoryBooksPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/profile/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import EditProfilePage from './pages/profile/EditProfilePage';
import ChangePasswordPage from '@pages/profile/ChangePasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector(state => state.auth);

  // При первом рендере проверяем наличие токена и загружаем данные пользователя
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !user && !isLoading) {
      // Загружаем данные пользователя только если есть токен и нет данных
      dispatch(loadCurrentUser());
    }
  }, [dispatch, user, isLoading]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="books/:bookId" element={<BookDetailPage />} />
          <Route path="books/:bookId/read" element={<BookReaderPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/:categoryId" element={<CategoryBooksPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="favorites" element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } />
          <Route path="profile/edit" element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } />
          <Route path="profile/change-password" element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

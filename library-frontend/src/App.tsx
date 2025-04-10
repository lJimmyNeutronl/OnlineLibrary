import { ConfigProvider } from 'antd';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import theme from './theme/theme';
import './App.css';

// Конфигурация маршрутов
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </Provider>
  );
}

export default App;

import { Outlet } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import AppFooter from '../common/AppFooter';

const MainLayout = () => {
  return (
    <div className="app-layout" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      margin: 0,
      padding: 0
    }}>
      <AppHeader />
      <main className="app-content" style={{ marginTop: '64px', paddingTop: 0 }}>
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};

export default MainLayout; 
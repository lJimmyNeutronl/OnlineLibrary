import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../Header';
import Footer from '../../Footer';

export const MainLayout = () => {
  return (
    <div className="app-layout" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      margin: 0,
      padding: 0
    }}>
      <Header />
      <main className="app-content" style={{ marginTop: '64px', paddingTop: 0 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 
import React from 'react';

const AppFooter = () => {
  return (
    <footer className="app-footer" style={{ 
      textAlign: 'center',
      backgroundColor: 'var(--primary-color, #3769f5)',
      color: 'white',
      padding: '16px',
      width: '100%'
    }}>
      Онлайн-библиотека ©{new Date().getFullYear()} Создано с помощью React
    </footer>
  );
};

export default AppFooter; 
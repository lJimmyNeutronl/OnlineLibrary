import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ 
      textAlign: 'center',
      backgroundColor: '#3769f5',
      color: 'white'
    }}>
      Онлайн-библиотека ©{new Date().getFullYear()} Создано с помощью React и Ant Design
    </Footer>
  );
};

export default AppFooter; 
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: 'center' }}>
      Онлайн-библиотека ©{new Date().getFullYear()} Создано с помощью React и Ant Design
    </Footer>
  );
};

export default AppFooter; 
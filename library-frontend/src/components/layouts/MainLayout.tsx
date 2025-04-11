import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from '../common/AppHeader';
import AppFooter from '../common/AppFooter';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ marginTop: 64 }}>
        <Outlet />
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default MainLayout; 
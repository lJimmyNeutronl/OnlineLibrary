import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from '../common/AppHeader';
import AppFooter from '../common/AppFooter';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px 50px', marginTop: 64 }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
          <Outlet />
        </div>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default MainLayout; 
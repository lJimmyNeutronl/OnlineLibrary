import { ThemeConfig } from 'antd';

// Настройка темы для Ant Design
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    borderRadius: 4,
  },
  components: {
    Button: {
      controlHeight: 40,
    },
    Card: {
      boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    },
  },
}; 
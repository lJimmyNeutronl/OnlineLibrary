import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

const customTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#4096ff',
    colorInfo: '#4096ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorTextBase: '#333',
    colorBgBase: '#f8f9fa',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#4096ff',
      bodyBg: '#f8f9fa',
      footerBg: '#f0f2f5',
    },
    Menu: {
      itemSelectedBg: '#1677ff',
      horizontalItemSelectedColor: '#ffffff',
      horizontalItemHoverColor: 'rgba(255, 255, 255, 0.85)',
    },
    Button: {
      defaultBg: '#ffffff',
      defaultColor: '#4096ff',
      defaultBorderColor: '#4096ff',
    },
    Card: {
      colorBorderSecondary: '#e8e8e8',
      boxShadowTertiary: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    Input: {
      activeBorderColor: '#4096ff',
      hoverBorderColor: '#69b1ff',
    },
  },
};

export default customTheme; 
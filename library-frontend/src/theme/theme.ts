import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

const customTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#3769f5',
    colorInfo: '#3769f5',
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
      headerBg: '#3769f5',
      bodyBg: '#f8f9fa',
      footerBg: '#f0f2f5',
    },
    Menu: {
      itemSelectedBg: '#2d55c8',
      horizontalItemSelectedColor: '#ffffff',
      horizontalItemHoverColor: 'rgba(255, 255, 255, 0.85)',
    },
    Button: {
      defaultBg: '#ffffff',
      defaultColor: '#3769f5',
      defaultBorderColor: '#3769f5',
    },
    Card: {
      colorBorderSecondary: '#e8e8e8',
      boxShadowTertiary: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    Input: {
      activeBorderColor: '#3769f5',
      hoverBorderColor: '#5885f7',
    },
  },
};

export default customTheme; 
import React, { useState, ReactNode } from 'react';

interface TabPaneProps {
  tab: ReactNode;
  key: string;
  children: ReactNode;
}

export const TabPane: React.FC<TabPaneProps> = ({ children }) => {
  return <div className="tab-pane">{children}</div>;
};

interface TabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Tabs: React.FC<TabsProps> = ({
  activeKey,
  defaultActiveKey,
  onChange,
  children,
  className = '',
  style = {},
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(defaultActiveKey || '');
  
  const currentActiveKey = activeKey || internalActiveKey;
  
  const handleTabClick = (key: string) => {
    if (!activeKey) {
      setInternalActiveKey(key);
    }
    
    if (onChange) {
      onChange(key);
    }
  };
  
  const renderTabBar = () => {
    const tabs = React.Children.map(children, (child) => {
      if (React.isValidElement<TabPaneProps>(child) && child.type === TabPane) {
        const { key, tab } = child.props;
        
        return (
          <div
            key={key}
            className={`tab-item ${currentActiveKey === key ? 'active' : ''}`}
            onClick={() => handleTabClick(key)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: currentActiveKey === key ? '2px solid #3769f5' : '2px solid transparent',
              color: currentActiveKey === key ? '#3769f5' : 'inherit',
              fontWeight: currentActiveKey === key ? 600 : 400,
              marginRight: '16px',
              transition: 'all 0.3s',
            }}
          >
            {tab}
          </div>
        );
      }
      return null;
    });
    
    return <div className="tabs-bar" style={{ display: 'flex', borderBottom: '1px solid #e8e8e8' }}>{tabs}</div>;
  };
  
  const renderContent = () => {
    const content = React.Children.map(children, (child) => {
      if (React.isValidElement<TabPaneProps>(child) && child.type === TabPane) {
        const { key } = child.props;
        
        return (
          <div
            key={key}
            className={`tab-content ${currentActiveKey === key ? 'active' : ''}`}
            style={{ 
              display: currentActiveKey === key ? 'block' : 'none',
              paddingTop: '16px'
            }}
          >
            {child}
          </div>
        );
      }
      return null;
    });
    
    return <div className="tabs-content">{content}</div>;
  };
  
  return (
    <div className={`tabs ${className}`} style={style}>
      {renderTabBar()}
      {renderContent()}
    </div>
  );
};

export default Tabs; 
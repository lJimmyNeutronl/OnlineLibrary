import React, { ReactNode } from 'react';

interface ListItemMetaProps {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}

const ListItemMeta: React.FC<ListItemMetaProps> = ({ avatar, title, description }) => {
  return (
    <div className="list-item-meta" style={{ display: 'flex' }}>
      {avatar && (
        <div className="list-item-meta-avatar" style={{ marginRight: '16px' }}>
          {avatar}
        </div>
      )}
      <div className="list-item-meta-content">
        {title && (
          <div className="list-item-meta-title" style={{ 
            color: 'rgba(0, 0, 0, 0.85)', 
            fontSize: '16px',
            marginBottom: '4px' 
          }}>
            {title}
          </div>
        )}
        {description && (
          <div className="list-item-meta-description" style={{ 
            color: 'rgba(0, 0, 0, 0.45)', 
            fontSize: '14px' 
          }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

interface ListItemProps {
  children?: ReactNode;
  actions?: ReactNode[];
  style?: React.CSSProperties;
  className?: string;
}

const ListItem: React.FC<ListItemProps> & {
  Meta: React.FC<ListItemMetaProps>;
} = ({ children, actions, style = {}, className = '' }) => {
  return (
    <div 
      className={`list-item ${className}`} 
      style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f0f0f0',
        ...style 
      }}
    >
      <div className="list-item-content">
        {children}
      </div>
      {actions && actions.length > 0 && (
        <ul className="list-item-actions" style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: 0,
          margin: 0,
          listStyle: 'none'
        }}>
          {actions.map((action, index) => (
            <li key={`action-${index}`} style={{ marginLeft: '12px' }}>
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

ListItem.Meta = ListItemMeta;

interface ListProps {
  dataSource?: any[];
  renderItem?: (item: any, index: number) => ReactNode;
  loading?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children?: ReactNode;
}

interface ListComponent extends React.FC<ListProps> {
  Item: typeof ListItem;
}

const List: ListComponent = ({
  dataSource = [],
  renderItem,
  loading = false,
  style = {},
  className = '',
  children,
}) => {
  const renderItems = () => {
    if (children) {
      return children;
    }
    
    if (renderItem && dataSource.length > 0) {
      return dataSource.map((item, index) => renderItem(item, index));
    }
    
    return null;
  };
  
  return (
    <div className={`list ${className}`} style={{ ...style }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div>Загрузка...</div>
        </div>
      ) : (
        renderItems()
      )}
    </div>
  );
};

// Добавляем подкомпоненты к List
List.Item = ListItem;

export default List; 
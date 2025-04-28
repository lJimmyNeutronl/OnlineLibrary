import React from 'react';

interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  className?: string;
  style?: React.CSSProperties;
}

interface FormItemProps {
  label?: React.ReactNode;
  name?: string;
  required?: boolean;
  help?: React.ReactNode;
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface FormComponent extends React.FC<FormProps> {
  Item: React.FC<FormItemProps>;
}

// Подкомпонент FormItem
const FormItem: React.FC<FormItemProps> = ({
  label,
  name,
  required = false,
  help,
  validateStatus,
  children,
  className = '',
  style = {},
}) => {
  // Определение стилей для статуса валидации
  const getStatusColor = () => {
    switch (validateStatus) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`form-item ${validateStatus ? `form-item-${validateStatus}` : ''} ${className}`}
      style={{ 
        marginBottom: '24px',
        ...style
      }}
    >
      {label && (
        <div 
          className="form-item-label" 
          style={{ 
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '22px',
            color: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <label htmlFor={name}>
            {label}
            {required && (
              <span 
                className="form-item-required" 
                style={{ 
                  color: '#ff4d4f',
                  marginLeft: '4px',
                  fontSize: '14px'
                }}
              >
                *
              </span>
            )}
          </label>
        </div>
      )}
      <div 
        className="form-item-control" 
        style={{ 
          position: 'relative',
          ...(validateStatus && { borderColor: getStatusColor() })
        }}
      >
        <div className="form-item-control-input">
          {children}
        </div>
        {help && (
          <div 
            className="form-item-explain" 
            style={{ 
              fontSize: '14px',
              lineHeight: '22px',
              color: getStatusColor() || 'rgba(0, 0, 0, 0.45)',
              marginTop: '4px'
            }}
          >
            {help}
          </div>
        )}
      </div>
    </div>
  );
};

// Основной компонент Form
const Form: FormComponent = ({
  children,
  onSubmit,
  layout = 'vertical',
  className = '',
  style = {},
}) => {
  // Определение стилей в зависимости от layout
  const formStyle: React.CSSProperties = {
    ...style,
  };

  if (layout === 'inline') {
    formStyle.display = 'flex';
    formStyle.alignItems = 'flex-start';
    formStyle.flexWrap = 'wrap';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      className={`form form-${layout} ${className}`}
      style={formStyle}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
};

// Добавляем подкомпонент Form.Item
Form.Item = FormItem;

export default Form; 
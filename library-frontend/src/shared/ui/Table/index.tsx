import React, { ReactNode } from 'react';
import styled from 'styled-components';

export interface TableColumn<T> {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number;
  render?: (text: any, record: T, index: number) => ReactNode;
  sorter?: (a: T, b: T) => number;
}

export interface TablePaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  showTotal?: (total: number) => string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey: string;
  pagination?: TablePaginationConfig;
  onChange?: (pagination: TablePaginationConfig) => void;
}

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e8e8e8;
  }
  
  th {
    background-color: #fafafa;
    font-weight: 500;
  }
  
  tr:hover td {
    background-color: #fafafa;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
`;

const PageInfo = styled.div`
  margin-right: 16px;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 4px 8px;
  border: 1px solid ${props => props.$active ? 'var(--primary-color, #3769f5)' : '#d9d9d9'};
  background-color: ${props => props.$active ? 'var(--primary-color, #3769f5)' : 'white'};
  color: ${props => props.$active ? 'white' : 'rgba(0, 0, 0, 0.65)'};
  cursor: pointer;
  border-radius: 2px;
  
  &:hover {
    border-color: var(--primary-color, #3769f5);
    color: ${props => props.$active ? 'white' : 'var(--primary-color, #3769f5)'};
  }
  
  &:disabled {
    color: rgba(0, 0, 0, 0.25);
    border-color: #d9d9d9;
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const PageSizeSelector = styled.select`
  margin-left: 16px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
`;

function Table<T extends Record<string, any>>({ 
  columns, 
  dataSource, 
  rowKey, 
  pagination,
  onChange 
}: TableProps<T>) {
  const handlePageChange = (page: number) => {
    if (pagination && onChange) {
      onChange({
        ...pagination,
        current: page
      });
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (pagination && onChange) {
      onChange({
        ...pagination,
        pageSize: Number(event.target.value),
        current: 1
      });
    }
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, showSizeChanger, pageSizeOptions, showTotal } = pagination;
    const totalPages = Math.ceil(total / pageSize);

    // Generate page buttons
    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - 1 && i <= current + 1)
      ) {
        pageButtons.push(
          <PageButton
            key={i}
            $active={i === current}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PageButton>
        );
      } else if (i === current - 2 || i === current + 2) {
        pageButtons.push(<span key={i}>...</span>);
      }
    }

    return (
      <PaginationContainer>
        {showTotal && <PageInfo>{showTotal(total)}</PageInfo>}
        
        <PageButtons>
          <PageButton
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
          >
            Пред.
          </PageButton>
          
          {pageButtons}
          
          <PageButton
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
          >
            След.
          </PageButton>
        </PageButtons>
        
        {showSizeChanger && (
          <PageSizeSelector value={pageSize} onChange={handlePageSizeChange}>
            {(pageSizeOptions || ['10', '20', '50']).map(size => (
              <option key={size} value={size}>{size} / стр.</option>
            ))}
          </PageSizeSelector>
        )}
      </PaginationContainer>
    );
  };

  // Calculate current page data
  const currentData = pagination
    ? dataSource.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      )
    : dataSource;

  return (
    <div>
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} style={{ width: column.width ? `${column.width}px` : 'auto' }}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((record, index) => (
              <tr key={record[rowKey]}>
                {columns.map(column => (
                  <td key={column.key}>
                    {column.render 
                      ? column.render(column.dataIndex ? record[column.dataIndex] : null, record, index)
                      : column.dataIndex ? record[column.dataIndex] : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
      
      {renderPagination()}
    </div>
  );
}

export default Table; 
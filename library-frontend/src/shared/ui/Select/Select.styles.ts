import styled, { css } from 'styled-components';

export const SelectContainer = styled.div<{ disabled?: boolean }>`
  position: relative;
  display: inline-block;
  font-size: 14px;
  
  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
  `}
`;

export const SelectInput = styled.div`
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1890ff;
  }
  
  &:focus, &:active {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

export const SelectValue = styled.span`
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SelectPlaceholder = styled.span`
  color: #bfbfbf;
`;

export const SelectArrow = styled.span<{ $isOpen: boolean }>`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #999;
  margin-left: 10px;
  transition: transform 0.2s;
  
  ${props => props.$isOpen && css`
    transform: rotate(180deg);
  `}
`;

export const SelectDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
`;

export const SelectOption = styled.div<{ $selected?: boolean; $disabled?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${props => props.$selected && css`
    background-color: #e6f7ff;
    font-weight: 500;
  `}
  
  ${props => props.$disabled ? css`
    color: #d9d9d9;
    cursor: not-allowed;
  ` : css`
    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

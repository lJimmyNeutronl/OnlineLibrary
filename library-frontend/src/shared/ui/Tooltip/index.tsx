import React, { ReactNode, useState, useRef } from 'react';
import styled from 'styled-components';
import { useClickOutside } from '../../hooks/useClickOutside';

interface TooltipProps {
  title: string;
  children: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
}

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div<{ $placement: string; $visible: boolean }>`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 6px 8px;
  border-radius: 2px;
  font-size: 12px;
  z-index: 1000;
  white-space: nowrap;
  transition: opacity 0.3s;
  opacity: ${props => (props.$visible ? 1 : 0)};
  pointer-events: ${props => (props.$visible ? 'auto' : 'none')};
  
  ${props => {
    switch (props.$placement) {
      case 'top':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 4px;
            border-style: solid;
            border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
          }
        `;
      case 'right':
        return `
          top: 50%;
          left: 100%;
          transform: translateY(-50%) translateX(4px);
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 100%;
            transform: translateY(-50%);
            border-width: 4px;
            border-style: solid;
            border-color: transparent rgba(0, 0, 0, 0.85) transparent transparent;
          }
        `;
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          &::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 4px;
            border-style: solid;
            border-color: transparent transparent rgba(0, 0, 0, 0.85) transparent;
          }
        `;
      case 'left':
        return `
          top: 50%;
          right: 100%;
          transform: translateY(-50%) translateX(-4px);
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 100%;
            transform: translateY(-50%);
            border-width: 4px;
            border-style: solid;
            border-color: transparent transparent transparent rgba(0, 0, 0, 0.85);
          }
        `;
      default:
        return '';
    }
  }}
`;

const Tooltip: React.FC<TooltipProps> = ({ 
  title, 
  children, 
  placement = 'top' 
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(tooltipRef, () => {
    if (visible) {
      setVisible(false);
    }
  });

  const handleMouseEnter = () => setVisible(true);
  const handleMouseLeave = () => setVisible(false);

  return (
    <TooltipContainer 
      ref={tooltipRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <TooltipContent $placement={placement} $visible={visible}>
        {title}
      </TooltipContent>
    </TooltipContainer>
  );
};

export default Tooltip; 
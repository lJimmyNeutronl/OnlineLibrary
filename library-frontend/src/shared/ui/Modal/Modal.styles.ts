import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
`;

export const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 108px); /* вычитаем высоту хедера и футера */
`;

export const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  color: #999;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`; 
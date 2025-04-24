import styled from 'styled-components';

export const LoginFormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .error-message {
    margin-bottom: 16px;
    padding: 10px;
    color: #f5222d;
    background-color: #fff1f0;
    border: 1px solid #ffccc7;
    border-radius: 8px;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    
    input {
      margin-right: 8px;
    }
  }
`;

export const FormFooter = styled.div`
  margin-top: 16px;
  text-align: center;

  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`; 
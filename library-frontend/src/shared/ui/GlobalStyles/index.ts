import { createGlobalStyle } from 'styled-components';
import '../../../app/styles';

/**
 * Компонент глобальных стилей
 * Внимание: Базовые стили теперь импортируются из app/styles
 * Этот компонент остается для совместимости и может содержать 
 * только дополнительные стили специфичные для styled-components
 */
const GlobalStyles = createGlobalStyle`
  /* Все базовые стили теперь определены в app/styles */
`;

export default GlobalStyles; 
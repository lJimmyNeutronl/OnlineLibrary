import { AppProviders, AppRoutes } from './app';
import { GlobalStyles } from './shared/ui';

/**
 * Корневой компонент приложения
 */
const App = () => {
  return (
    <AppProviders>
      <GlobalStyles />
      <AppRoutes />
    </AppProviders>
  );
};

export default App;

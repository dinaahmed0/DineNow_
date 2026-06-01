import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ErrorBoundary } from './Components/common/ErrorBoundary';
import AppRoutes from './routes';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <NavigationProvider>
              <Toaster position="top-right" />
              <AppRoutes />
            </NavigationProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
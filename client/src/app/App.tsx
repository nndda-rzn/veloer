import { Providers } from './providers';
import { AppRouter } from './router';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  );
}

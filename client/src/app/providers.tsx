import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth';
import { SyncProvider } from '@/features/activity';
import { ToasterProvider } from '@/shared/components/feedback/Toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToasterProvider>
        <SyncProvider>
          <AuthProvider>{children}</AuthProvider>
        </SyncProvider>
      </ToasterProvider>
    </QueryClientProvider>
  );
}

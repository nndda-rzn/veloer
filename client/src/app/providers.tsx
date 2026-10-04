import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { SyncProvider } from '@/features/activity/hooks/useSync';
import { ToasterProvider } from '@/shared/components/feedback/Toaster';
import { PreferencesProvider } from '@/features/settings/components/PreferencesProvider';

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
          <AuthProvider>
            {/* Feeds the shared formatters (units, timezone) from the profile. */}
            <PreferencesProvider>{children}</PreferencesProvider>
          </AuthProvider>
        </SyncProvider>
      </ToasterProvider>
    </QueryClientProvider>
  );
}

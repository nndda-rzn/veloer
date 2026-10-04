import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import type { UserProfile } from '../types/settings';
import { useAuth } from '@/features/auth';
import { configureFormatting, getFormatting, type Units } from '@/shared/lib/format-prefs';

interface PreferencesContextValue {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  units: Units;
  timezone: string;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

/**
 * Single source of truth for the profile, shared across the app.
 *
 * Two jobs:
 *  1. Feed the shared formatters (units, timezone) so they reflect the rider's
 *     preferences without every call site changing.
 *  2. Replace the several independent useProfile() instances (sidebar, settings,
 *     dashboard) with one cached query.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => settingsApi.getProfile(),
    // Do not request the profile on the sign-in screen, where there is none.
    enabled: isAuthenticated,
  });

  // Keep the formatter store in sync. Changing units or timezone updates the
  // store and bumps state so consumers re-render with the new formatting.
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!data) return;
    configureFormatting({
      units: data.preferred_units ?? 'metric',
      timezone: data.timezone || 'Asia/Jakarta',
    });
    setRevision((r) => r + 1);
  }, [data]);

  const value = useMemo<PreferencesContextValue>(() => {
    const current = getFormatting();
    return {
      profile: data ?? null,
      loading: isLoading,
      error: error instanceof Error ? error.message : null,
      units: current.units,
      timezone: current.timezone,
    };
    // `revision` is intentional: it forces a new context value after the store
    // is reconfigured, which is what re-renders the formatted numbers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading, error, revision]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}

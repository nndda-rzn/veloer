import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import type { UserProfile, ProfileFormData } from '../types/settings';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  save: (data: ProfileFormData) => Promise<void>;
}

/**
 * Read and update the rider's profile.
 *
 * Shares the ['profile'] query key with PreferencesProvider, so the sidebar,
 * settings page and dashboard all read one cached request instead of each
 * firing their own.
 */
export function useProfile(): UseProfileReturn {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => settingsApi.getProfile(),
  });

  const save = useCallback(
    async (formData: ProfileFormData) => {
      setSaving(true);
      try {
        const updated = await settingsApi.updateProfile(formData);
        queryClient.setQueryData(['profile'], updated);
      } finally {
        setSaving(false);
      }
    },
    [queryClient],
  );

  return {
    profile: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    saving,
    save,
  };
}

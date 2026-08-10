import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../api/settings.api';
import type { UserProfile, ProfileFormData } from '../types/settings';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  save: (data: ProfileFormData) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi
      .getProfile()
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateProfile(data);
      setProfile(updated);
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, error, saving, save };
}

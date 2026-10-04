import { useState, useEffect, useCallback } from 'react';
import { maintenanceApi } from '../api/maintenance.api';
import type { MaintenanceSchedule, ScheduleFormData } from '../types/maintenance';

interface UseSchedulesReturn {
  schedules: MaintenanceSchedule[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createSchedule: (data: ScheduleFormData) => Promise<void>;
  updateSchedule: (id: string, data: Partial<MaintenanceSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

/**
 * Loads and mutates a bike's maintenance reminders. Mirrors useMaintenanceLogs:
 * one refetch flag, mutators that write then bump it.
 */
export function useSchedules(bikeId: string | null): UseSchedulesReturn {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    if (!bikeId) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    maintenanceApi
      .listSchedules(bikeId)
      .then(setSchedules)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load schedules'))
      .finally(() => setLoading(false));
  }, [bikeId, refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createSchedule = useCallback(
    async (data: ScheduleFormData) => {
      if (!bikeId) return;
      await maintenanceApi.createSchedule(bikeId, data);
      setRefetchFlag((f) => f + 1);
    },
    [bikeId],
  );

  const updateSchedule = useCallback(async (id: string, data: Partial<MaintenanceSchedule>) => {
    await maintenanceApi.updateSchedule(id, data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    await maintenanceApi.deleteSchedule(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { schedules, loading, error, refetch, createSchedule, updateSchedule, deleteSchedule };
}

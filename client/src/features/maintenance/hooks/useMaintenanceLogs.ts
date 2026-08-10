import { useState, useEffect, useCallback } from 'react';
import { maintenanceApi } from '../api/maintenance.api';
import type { MaintenanceLog, MaintenanceLogFormData } from '../types/maintenance';

interface UseMaintenanceLogsReturn {
  logs: MaintenanceLog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createLog: (data: MaintenanceLogFormData) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export function useMaintenanceLogs(bikeId: string | null): UseMaintenanceLogsReturn {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    if (!bikeId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    maintenanceApi
      .listLogs(bikeId)
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load logs'))
      .finally(() => setLoading(false));
  }, [bikeId, refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createLog = useCallback(async (data: MaintenanceLogFormData) => {
    await maintenanceApi.createLog(data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    await maintenanceApi.deleteLog(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { logs, loading, error, refetch, createLog, deleteLog };
}

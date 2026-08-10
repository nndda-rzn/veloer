import { useState, useEffect, useCallback } from 'react';
import { componentApi } from '../api/component.api';
import type { Component, ComponentFormData } from '../types/inventory';

interface UseComponentsReturn {
  components: Component[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createComponent: (data: ComponentFormData) => Promise<void>;
  updateComponent: (id: string, data: Partial<ComponentFormData>) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;
}

export function useComponents(bikeId: string | null): UseComponentsReturn {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    if (!bikeId) {
      setComponents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    componentApi
      .listByBike(bikeId)
      .then(setComponents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load components'))
      .finally(() => setLoading(false));
  }, [bikeId, refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createComponent = useCallback(async (data: ComponentFormData) => {
    await componentApi.create(data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const updateComponent = useCallback(async (id: string, data: Partial<ComponentFormData>) => {
    await componentApi.update(id, data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteComponent = useCallback(async (id: string) => {
    await componentApi.delete(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { components, loading, error, refetch, createComponent, updateComponent, deleteComponent };
}

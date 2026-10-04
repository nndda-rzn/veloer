import { useState, useEffect, useCallback } from 'react';
import { bikeApi } from '../api/bike.api';
import { componentApi } from '../api/component.api';
import type { Bike, Component } from '../types/inventory';

interface UseBikeDetailReturn {
  bike: Bike | null;
  components: Component[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  refetchComponents: () => void;
  updateStatus: (status: Bike['status']) => Promise<void>;
  replaceComponent: (
    id: string,
    input?: Parameters<typeof componentApi.replace>[1],
  ) => Promise<void>;
}

/**
 * Loads a single bike together with its components. Used by the bike detail
 * page; keeps both in sync after edits and replacements.
 */
export function useBikeDetail(id: string | undefined): UseBikeDetailReturn {
  const [bike, setBike] = useState<Bike | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bikeFlag, setBikeFlag] = useState(0);
  const [componentsFlag, setComponentsFlag] = useState(0);

  useEffect(() => {
    if (!id) {
      setBike(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    bikeApi
      .getById(id)
      .then((data) => {
        if (active) setBike(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load bike');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, bikeFlag]);

  useEffect(() => {
    if (!id) {
      setComponents([]);
      return;
    }
    let active = true;
    componentApi
      .listByBike(id)
      .then((data) => {
        if (active) setComponents(data);
      })
      .catch(() => {
        if (active) setComponents([]);
      });
    return () => {
      active = false;
    };
  }, [id, componentsFlag]);

  const refetch = useCallback(() => setBikeFlag((f) => f + 1), []);
  const refetchComponents = useCallback(() => setComponentsFlag((f) => f + 1), []);

  const updateStatus = useCallback(
    async (status: Bike['status']) => {
      if (!id) return;
      await bikeApi.update(id, { status });
      setBikeFlag((f) => f + 1);
    },
    [id],
  );

  const replaceComponent = useCallback(
    async (componentId: string, input?: Parameters<typeof componentApi.replace>[1]) => {
      await componentApi.replace(componentId, input);
      setComponentsFlag((f) => f + 1);
    },
    [],
  );

  return {
    bike,
    components,
    loading,
    error,
    refetch,
    refetchComponents,
    updateStatus,
    replaceComponent,
  };
}

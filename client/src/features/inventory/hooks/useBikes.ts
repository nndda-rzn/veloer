import { useState, useEffect, useCallback } from 'react';
import { bikeApi } from '../api/bike.api';
import type { Bike, BikeFormData } from '../types/inventory';

interface UseBikesReturn {
  bikes: Bike[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createBike: (data: BikeFormData) => Promise<Bike>;
  updateBike: (id: string, data: Partial<BikeFormData>) => Promise<void>;
  deleteBike: (id: string) => Promise<void>;
}

export function useBikes(): UseBikesReturn {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    setLoading(true);
    bikeApi
      .list()
      .then(setBikes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bikes'))
      .finally(() => setLoading(false));
  }, [refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createBike = useCallback(async (data: BikeFormData): Promise<Bike> => {
    const bike = await bikeApi.create(data);
    setRefetchFlag((f) => f + 1);
    return bike;
  }, []);

  const updateBike = useCallback(async (id: string, data: Partial<BikeFormData>) => {
    await bikeApi.update(id, data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteBike = useCallback(async (id: string) => {
    await bikeApi.delete(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { bikes, loading, error, refetch, createBike, updateBike, deleteBike };
}

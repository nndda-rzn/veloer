import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { activityApi } from '../api/activity.api';

interface Bike {
  id: string;
  name: string;
  brand: string;
  model: string;
}

interface ActivityBikeLinkerProps {
  activityId: string;
  currentBikeId: string | null;
  onLinked: () => void;
}

export function ActivityBikeLinker({
  activityId,
  currentBikeId,
  onLinked,
}: ActivityBikeLinkerProps) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBike, setSelectedBike] = useState<string>(currentBikeId ?? '');

  useEffect(() => {
    apiClient
      .get<Bike[]>('/api/bikes')
      .then(({ data }) => setBikes(data))
      .catch(() => setBikes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelectedBike(currentBikeId ?? '');
  }, [currentBikeId]);

  const handleLink = async () => {
    setSaving(true);
    try {
      await activityApi.updateBike(activityId, selectedBike || null);
      onLinked();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-12 animate-pulse rounded-xl bg-gray-100" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="bikeSelect" className="mb-1 block text-xs font-medium text-gray-500">
            Assign to Bike
          </label>
          <select
            id="bikeSelect"
            value={selectedBike}
            onChange={(e) => setSelectedBike(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">— No bike —</option>
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.name} ({bike.brand} {bike.model})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => void handleLink()}
          disabled={saving || selectedBike === (currentBikeId ?? '')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {bikes.length === 0 && (
        <p className="text-xs text-gray-400">
          No bikes in your inventory yet. Add a bike first to link activities.
        </p>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { activityApi } from '../api/activity.api';
import { Button } from '@/components/ui/button';
import { selectClass } from '@/shared/lib/form-styles';

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
    return <div className="h-12 animate-pulse rounded-xl bg-secondary" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor="bikeSelect"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Assign to Bike
          </label>
          <select
            id="bikeSelect"
            value={selectedBike}
            onChange={(e) => setSelectedBike(e.target.value)}
            className={selectClass}
          >
            <option value="">– No bike –</option>
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.name} ({bike.brand} {bike.model})
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => void handleLink()}
          disabled={saving || selectedBike === (currentBikeId ?? '')}
          loading={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {bikes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No bikes in your inventory yet. Add a bike first to link activities.
        </p>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  MaintenanceLogList,
  MaintenanceForm,
  DueAlerts,
  useMaintenanceLogs,
} from '@/features/maintenance';
import { useBikes } from '@/features/inventory';
import type { Bike } from '@/features/inventory';
import type { MaintenanceLog, MaintenanceLogFormData } from '@/features/maintenance';
import { apiClient } from '@/shared/lib/api-client';
import { PageHeader, EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { Wrench } from 'lucide-react';

export function MaintenancePage() {
  const { bikes, loading: bikesLoading } = useBikes();
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingLog, setDeletingLog] = useState<MaintenanceLog | null>(null);

  const { logs, loading, error, createLog, deleteLog } = useMaintenanceLogs(
    selectedBike?.id ?? null,
  );

  // Auto-select first bike
  useEffect(() => {
    if (!selectedBike && bikes.length > 0) {
      setSelectedBike(bikes[0]);
    }
  }, [bikes, selectedBike]);

  const handleDelete = async (log: MaintenanceLog) => {
    setDeletingLog(log);
  };

  const confirmDelete = async () => {
    if (deletingLog) {
      await deleteLog(deletingLog.id);
      setDeletingLog(null);
    }
  };

  // Fallback fetch if useBikes doesn't load (it uses /api/bikes)
  // Use apiClient directly as a safety net
  useEffect(() => {
    if (bikesLoading && bikes.length === 0) {
      apiClient
        .get<Bike[]>('/api/bikes')
        .then(({ data }) => {
          if (data.length > 0) setSelectedBike(data[0]);
        })
        .catch(() => {});
    }
  }, [bikesLoading, bikes.length]);

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" description="Service logs and maintenance schedules" />

      <DueAlerts />

      {bikes.length === 0 && !bikesLoading ? (
        <EmptyState
          icon={Wrench}
          title="No bikes yet"
          description="Add a bike first in the Inventory page to start logging maintenance."
        />
      ) : (
        <>
          {/* Bike selector */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="bikeSelect" className="mb-1 block text-xs font-medium text-gray-600">
                Select Bike
              </label>
              <select
                id="bikeSelect"
                value={selectedBike?.id ?? ''}
                onChange={(e) => {
                  const bike = bikes.find((b) => b.id === e.target.value);
                  setSelectedBike(bike ?? null);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {bikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.name} ({bike.current_km.toFixed(0)} km)
                  </option>
                ))}
              </select>
            </div>
            {selectedBike && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Log Service
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {selectedBike && (
            <MaintenanceLogList logs={logs} loading={loading} onDelete={handleDelete} />
          )}
        </>
      )}

      {showForm && selectedBike && (
        <MaintenanceForm
          bikeId={selectedBike.id}
          currentKm={selectedBike.current_km}
          onSubmit={async (data: MaintenanceLogFormData) => {
            await createLog(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {deletingLog && (
        <ConfirmDialog
          title="Delete Log"
          description="Are you sure you want to delete this maintenance log?"
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeletingLog(null)}
        />
      )}
    </div>
  );
}

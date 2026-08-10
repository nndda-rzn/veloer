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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Maintenance</h2>
        <p className="mt-1 text-sm text-gray-500">Service logs and maintenance schedules</p>
      </div>

      <DueAlerts />

      {bikes.length === 0 && !bikesLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <span className="text-4xl">🔧</span>
          <p className="mt-2 text-sm font-medium text-gray-900">No bikes yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add a bike first in the Inventory page to start logging maintenance.
          </p>
        </div>
      ) : (
        <>
          {/* Bike selector */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="bikeSelect" className="mb-1 block text-xs font-medium text-gray-500">
                Select Bike
              </label>
              <select
                id="bikeSelect"
                value={selectedBike?.id ?? ''}
                onChange={(e) => {
                  const bike = bikes.find((b) => b.id === e.target.value);
                  setSelectedBike(bike ?? null);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Log Service
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Log</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this maintenance log?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingLog(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

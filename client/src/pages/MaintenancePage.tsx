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
import { PageHeader, EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { selectClass } from '@/shared/lib/form-styles';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
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

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" description="Service logs and maintenance schedules" />

      <DueAlerts />

      {bikes.length === 0 && !bikesLoading ? (
        <EmptyState
          icon={Wrench}
          title="No bikes yet"
          description="Add a bike first in the Bikes & Gear page to start logging maintenance."
        />
      ) : (
        <>
          {/* Bike selector */}
          <div className="flex items-end gap-3">
            <div className="max-w-xs flex-1">
              <label
                htmlFor="bikeSelect"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Select bike
              </label>
              <select
                id="bikeSelect"
                value={selectedBike?.id ?? ''}
                onChange={(e) => {
                  const bike = bikes.find((b) => b.id === e.target.value);
                  setSelectedBike(bike ?? null);
                }}
                className={selectClass}
              >
                {bikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.name} ({bike.current_km.toFixed(0)} km)
                  </option>
                ))}
              </select>
            </div>
            {selectedBike && <Button onClick={() => setShowForm(true)}>Log Service</Button>}
          </div>

          {error && <Alert variant="error">{error}</Alert>}

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

      <ConfirmDialog
        open={deletingLog !== null}
        onOpenChange={(open) => !open && setDeletingLog(null)}
        title="Delete log"
        description="Are you sure you want to delete this maintenance log? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}

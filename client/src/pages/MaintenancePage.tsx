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
import { PageHeader, EmptyState } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
          description="Add a bike first in the Inventory page to start logging maintenance."
        />
      ) : (
        <>
          {/* Bike selector */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="bikeSelect" className="mb-1 block text-sm font-medium text-gray-700">
                Select Bike
              </label>
              <select
                id="bikeSelect"
                value={selectedBike?.id ?? ''}
                onChange={(e) => {
                  const bike = bikes.find((b) => b.id === e.target.value);
                  setSelectedBike(bike ?? null);
                }}
                className="flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

      {deletingLog && (
        <AlertDialog open onOpenChange={(open) => !open && setDeletingLog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Log</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this maintenance log?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="danger" onClick={() => void confirmDelete()}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

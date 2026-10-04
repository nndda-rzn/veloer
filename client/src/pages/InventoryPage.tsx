import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BikeTable,
  BikeForm,
  ComponentForm,
  GearStatsBar,
  useBikes,
  summarizeGear,
} from '@/features/inventory';
import { componentApi } from '@/features/inventory/api/component.api';
import type { Bike, BikeFormData, Component, ComponentFormData } from '@/features/inventory';
import { PageHeader, EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Plus } from 'lucide-react';

export function InventoryPage() {
  const {
    bikes,
    loading,
    error,
    createBike,
    updateBike,
    updateStatus,
    deleteBike,
    refetch: refetchBikes,
  } = useBikes();
  const [componentsByBike, setComponentsByBike] = useState<Record<string, Component[]>>({});
  const [showBikeForm, setShowBikeForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [deletingBike, setDeletingBike] = useState<Bike | null>(null);
  const [statusChange, setStatusChange] = useState<{
    bike: Bike;
    status: Bike['status'];
  } | null>(null);

  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [activeBikeForComponent, setActiveBikeForComponent] = useState<Bike | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<Component | null>(null);

  // Fetch components for all bikes
  const fetchComponents = useCallback(async (bikeIds: string[]) => {
    if (bikeIds.length === 0) {
      setComponentsByBike({});
      return;
    }
    const results = await Promise.all(bikeIds.map((id) => componentApi.listByBike(id)));
    const map: Record<string, Component[]> = {};
    bikeIds.forEach((id, i) => {
      map[id] = results[i];
    });
    setComponentsByBike(map);
  }, []);

  useEffect(() => {
    void fetchComponents(bikes.map((b) => b.id));
  }, [bikes, fetchComponents]);

  // --- Bike handlers ---
  const handleAddBike = () => {
    setEditingBike(null);
    setShowBikeForm(true);
  };
  const handleEditBike = (bike: Bike) => {
    setEditingBike(bike);
    setShowBikeForm(true);
  };
  const handleBikeSubmit = async (data: BikeFormData) => {
    if (editingBike) {
      await updateBike(editingBike.id, data);
    } else {
      await createBike(data);
    }
    setShowBikeForm(false);
    setEditingBike(null);
    refetchBikes();
  };

  // --- Component handlers ---
  const handleAddComponent = (bike: Bike) => {
    setActiveBikeForComponent(bike);
    setEditingComponent(null);
    setShowComponentForm(true);
  };
  const handleEditComponent = (component: Component) => {
    setActiveBikeForComponent(bikes.find((b) => b.id === component.bike_id) ?? null);
    setEditingComponent(component);
    setShowComponentForm(true);
  };
  const handleComponentSubmit = async (data: ComponentFormData) => {
    if (editingComponent) {
      await componentApi.update(editingComponent.id, data);
    } else {
      await componentApi.create(data);
    }
    setShowComponentForm(false);
    setEditingComponent(null);
    await fetchComponents(bikes.map((b) => b.id));
  };
  const handleDeleteComponent = async (component: Component) => {
    await componentApi.delete(component.id);
    setDeletingComponent(null);
    await fetchComponents(bikes.map((b) => b.id));
  };

  const gearSummary = useMemo(() => summarizeGear(bikes), [bikes]);

  const confirmStatusChange = async () => {
    if (!statusChange) return;
    await updateStatus(statusChange.bike.id, statusChange.status);
    setStatusChange(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bikes & Gear"
        description="Manage your bikes and components"
        action={
          <Button onClick={handleAddBike}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Bike
          </Button>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && bikes.length > 0 && <GearStatsBar summary={gearSummary} loading={loading} />}

      {!loading && bikes.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No bikes yet"
          description="Add your first bike to start tracking components and maintenance."
          action={{ label: 'Add Bike', onClick: handleAddBike }}
        />
      ) : (
        <BikeTable
          bikes={bikes}
          componentsByBike={componentsByBike}
          loading={loading}
          onEdit={handleEditBike}
          onDelete={setDeletingBike}
          onStatusChange={(bike, status) => setStatusChange({ bike, status })}
          onEditComponent={handleEditComponent}
          onDeleteComponent={setDeletingComponent}
          onAddComponent={handleAddComponent}
        />
      )}

      {/* Bike Form Modal */}
      {showBikeForm && (
        <BikeForm
          bike={editingBike}
          onSubmit={handleBikeSubmit}
          onCancel={() => {
            setShowBikeForm(false);
            setEditingBike(null);
          }}
        />
      )}

      {/* Component Form Modal */}
      {showComponentForm && activeBikeForComponent && (
        <ComponentForm
          bikeId={activeBikeForComponent.id}
          component={editingComponent}
          onSubmit={handleComponentSubmit}
          onCancel={() => {
            setShowComponentForm(false);
            setEditingComponent(null);
          }}
        />
      )}

      {/* Delete Bike Confirmation */}
      <ConfirmDialog
        open={deletingBike !== null}
        onOpenChange={(open) => !open && setDeletingBike(null)}
        title="Delete bike"
        description={`Are you sure you want to delete “${deletingBike?.name ?? ''}”? This action cannot be undone.`}
        onConfirm={async () => {
          if (deletingBike) {
            await deleteBike(deletingBike.id);
            setDeletingBike(null);
            refetchBikes();
          }
        }}
      />

      {/* Delete Component Confirmation */}
      <ConfirmDialog
        open={deletingComponent !== null}
        onOpenChange={(open) => !open && setDeletingComponent(null)}
        title="Delete component"
        description={`Are you sure you want to delete “${deletingComponent?.name ?? ''}”? This action cannot be undone.`}
        onConfirm={() => (deletingComponent ? handleDeleteComponent(deletingComponent) : undefined)}
      />

      {/* Bike status change confirmation */}
      <ConfirmDialog
        open={statusChange !== null}
        onOpenChange={(open) => !open && setStatusChange(null)}
        title={statusChange?.status === 'sold' ? 'Mark bike as sold' : 'Change bike status'}
        description={
          statusChange
            ? `Set “${statusChange.bike.name}” to ${statusChange.status}. You can change this again at any time.`
            : ''
        }
        confirmLabel={statusChange ? `Mark ${statusChange.status}` : 'Confirm'}
        variant={statusChange?.status === 'active' ? 'default' : 'danger'}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}

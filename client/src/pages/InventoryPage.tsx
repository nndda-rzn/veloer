import { useState, useEffect, useCallback, useMemo } from 'react';
import { BikeCard, BikeForm, FleetHealthStrip, useBikes, fleetHealth } from '@/features/inventory';
import { componentApi } from '@/features/inventory/api/component.api';
import { useProfile } from '@/features/settings';
import type { Bike, BikeFormData, Component } from '@/features/inventory';
import { PageHeader, EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { selectClass } from '@/shared/lib/form-styles';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

type SortKey = 'name' | 'current_km' | 'purchase_price' | 'alerts';
type StatusFilter = 'all' | Bike['status'];

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
  const { profile } = useProfile();
  const [componentsByBike, setComponentsByBike] = useState<Record<string, Component[]>>({});
  const [showBikeForm, setShowBikeForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [deletingBike, setDeletingBike] = useState<Bike | null>(null);
  const [statusChange, setStatusChange] = useState<{
    bike: Bike;
    status: Bike['status'];
  } | null>(null);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');

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

  const handleDeleteBike = async () => {
    if (!deletingBike) return;
    await deleteBike(deletingBike.id);
    setDeletingBike(null);
    refetchBikes();
  };

  const confirmStatusChange = async () => {
    if (!statusChange) return;
    await updateStatus(statusChange.bike.id, statusChange.status);
    setStatusChange(null);
  };

  const health = useMemo(() => fleetHealth(bikes, componentsByBike), [bikes, componentsByBike]);

  const visibleBikes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = bikes.filter((b) => {
      if (status !== 'all' && b.status !== status) return false;
      if (!q) return true;
      return `${b.name} ${b.brand ?? ''} ${b.model ?? ''} ${b.type}`.toLowerCase().includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'current_km') return b.current_km - a.current_km;
      if (sortKey === 'alerts')
        return (b.maintenance_alert_count ?? 0) - (a.maintenance_alert_count ?? 0);
      return (b.purchase_price ?? 0) - (a.purchase_price ?? 0);
    });
  }, [bikes, query, status, sortKey]);

  const isDefaultBike = (bike: Bike) => profile?.default_bike_id === bike.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bikes & Gear"
        description="Your garage — bikes, components and wear at a glance"
        action={
          <Button onClick={handleAddBike}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Bike
          </Button>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && bikes.length > 0 && <FleetHealthStrip health={health} />}

      {!loading && bikes.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No bikes yet"
          description="Add your first bike to start tracking components and maintenance."
          action={{ label: 'Add Bike', onClick: handleAddBike }}
        />
      ) : (
        <>
          {bikes.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search bikes…"
                  aria-label="Search bikes"
                  className="h-9 w-full sm:w-64"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  aria-label="Filter by status"
                  className={cn(selectClass, 'h-9 w-auto')}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="retired">Retired</option>
                  <option value="sold">Sold</option>
                </select>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  aria-label="Sort bikes"
                  className={cn(selectClass, 'h-9 w-auto')}
                >
                  <option value="name">Name</option>
                  <option value="current_km">Odometer</option>
                  <option value="alerts">Needs attention</option>
                  <option value="purchase_price">Value</option>
                </select>
              </div>
              <p className="text-xs tabular-nums text-muted-foreground">
                {visibleBikes.length} of {bikes.length}
              </p>
            </div>
          )}

          {visibleBikes.length === 0 && bikes.length > 0 ? (
            <EmptyState
              icon={Plus}
              title="No bikes match your filters"
              description="Try a different search or status."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleBikes.map((bike) => (
                <BikeCard
                  key={bike.id}
                  bike={bike}
                  components={componentsByBike[bike.id] ?? []}
                  isDefault={isDefaultBike(bike)}
                  onEdit={handleEditBike}
                  onDelete={setDeletingBike}
                  onStatusChange={(b, s) => setStatusChange({ bike: b, status: s })}
                />
              ))}
            </div>
          )}
        </>
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

      {/* Delete Bike Confirmation */}
      <ConfirmDialog
        open={deletingBike !== null}
        onOpenChange={(open) => !open && setDeletingBike(null)}
        title="Delete bike"
        description={`Are you sure you want to delete “${deletingBike?.name ?? ''}”? This will also remove its components. This action cannot be undone.`}
        onConfirm={handleDeleteBike}
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

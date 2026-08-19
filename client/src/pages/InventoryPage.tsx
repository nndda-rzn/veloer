import { useState } from 'react';
import {
  BikeCard,
  BikeForm,
  ComponentList,
  ComponentForm,
  useBikes,
  useComponents,
} from '@/features/inventory';
import type { Bike, BikeFormData, Component, ComponentFormData } from '@/features/inventory';
import { PageHeader, EmptyState, ConfirmDialog, Badge } from '@/shared/components/ui';
import { Bike as BikeIcon, Plus } from 'lucide-react';
import { formatIDR, formatDate } from '@/shared/lib/utils';

export function InventoryPage() {
  const { bikes, loading, error, createBike, updateBike, deleteBike } = useBikes();
  const [showBikeForm, setShowBikeForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [deletingBike, setDeletingBike] = useState<Bike | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);

  const {
    components,
    loading: componentsLoading,
    error: componentsError,
    createComponent,
    updateComponent,
    deleteComponent,
  } = useComponents(selectedBike?.id ?? null);

  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<Component | null>(null);

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
      const created = await createBike(data);
      setSelectedBike(created);
    }
    setShowBikeForm(false);
    setEditingBike(null);
  };

  // --- Component handlers ---
  const handleAddComponent = () => {
    setEditingComponent(null);
    setShowComponentForm(true);
  };
  const handleEditComponent = (component: Component) => {
    setEditingComponent(component);
    setShowComponentForm(true);
  };
  const handleComponentSubmit = async (data: ComponentFormData) => {
    if (editingComponent) {
      await updateComponent(editingComponent.id, data);
    } else {
      await createComponent(data);
    }
    setShowComponentForm(false);
    setEditingComponent(null);
  };

  const handleSelectBike = (bike: Bike) => {
    if (selectedBike?.id === bike.id) {
      setSelectedBike(null);
    } else {
      setSelectedBike(bike);
    }
  };

  const typeLabels: Record<Bike['type'], string> = {
    road: 'Road Bike',
    mtb: 'Mountain Bike',
    gravel: 'Gravel Bike',
    hybrid: 'Hybrid Bike',
    folding: 'Folding Bike',
    other: 'Other',
  };

  const typeFallbackImages: Partial<Record<Bike['type'], string>> = {
    road: '/road-bike.png',
    mtb: '/mountain-bike.png',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bikes & Gear"
        description="Manage your bikes and components"
        action={
          <button
            onClick={handleAddBike}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Bike
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bike grid — left 2/3 */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : bikes.length === 0 ? (
            <EmptyState
              icon={BikeIcon}
              title="No bikes yet"
              description="Add your first bike to start tracking components and maintenance."
              action={{ label: 'Add Bike', onClick: handleAddBike }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {bikes.map((bike) => (
                <div
                  key={bike.id}
                  className={`cursor-pointer rounded-xl transition-shadow ${
                    selectedBike?.id === bike.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleSelectBike(bike)}
                >
                  <BikeCard bike={bike} onEdit={handleEditBike} onDelete={setDeletingBike} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel — right 1/3 */}
        <div className="lg:col-span-1">
          {selectedBike ? (
            <div className="sticky top-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Detail header */}
              <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-gray-100">
                {selectedBike.photo_url ? (
                  <img
                    src={selectedBike.photo_url}
                    alt={selectedBike.name}
                    className="h-full w-full object-cover"
                  />
                ) : typeFallbackImages[selectedBike.type] ? (
                  <img
                    src={typeFallbackImages[selectedBike.type]}
                    alt={`${typeLabels[selectedBike.type]} placeholder`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BikeIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute left-2 top-2">
                  <Badge variant="success">
                    {selectedBike.status.charAt(0).toUpperCase() + selectedBike.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{selectedBike.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedBike.brand ?? '—'} {selectedBike.model ?? ''}
                  </p>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Type
                    </p>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {typeLabels[selectedBike.type]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Current KM
                    </p>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {selectedBike.current_km.toFixed(0)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Purchase Date
                    </p>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {selectedBike.purchase_date ? formatDate(selectedBike.purchase_date) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Purchase Price
                    </p>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {selectedBike.purchase_price != null
                        ? formatIDR(selectedBike.purchase_price)
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Components */}
                <div className="mb-3 flex items-center justify-between border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700">Components</h4>
                  <button
                    onClick={handleAddComponent}
                    className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add
                  </button>
                </div>

                {componentsError && (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {componentsError}
                  </div>
                )}

                <ComponentList
                  components={components}
                  loading={componentsLoading}
                  onEdit={handleEditComponent}
                  onDelete={(c) => setDeletingComponent(c)}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
              <BikeIcon className="mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
              <p className="text-sm text-gray-500">Select a bike to view its components</p>
            </div>
          )}
        </div>
      </div>

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
      {showComponentForm && selectedBike && (
        <ComponentForm
          bikeId={selectedBike.id}
          component={editingComponent}
          onSubmit={handleComponentSubmit}
          onCancel={() => {
            setShowComponentForm(false);
            setEditingComponent(null);
          }}
        />
      )}

      {/* Delete Bike Confirmation */}
      {deletingBike && (
        <ConfirmDialog
          title="Delete Bike"
          description={`Are you sure you want to delete "${deletingBike.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={async () => {
            await deleteBike(deletingBike.id);
            if (selectedBike?.id === deletingBike.id) setSelectedBike(null);
            setDeletingBike(null);
          }}
          onCancel={() => setDeletingBike(null)}
        />
      )}

      {/* Delete Component Confirmation */}
      {deletingComponent && (
        <ConfirmDialog
          title="Delete Component"
          description={`Are you sure you want to delete "${deletingComponent.name}"?`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={async () => {
            await deleteComponent(deletingComponent.id);
            setDeletingComponent(null);
          }}
          onCancel={() => setDeletingComponent(null)}
        />
      )}
    </div>
  );
}

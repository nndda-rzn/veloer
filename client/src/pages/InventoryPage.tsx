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
      await createBike(data);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bikes &amp; Gear</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your bikes and components</p>
        </div>
        <button
          onClick={handleAddBike}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Add Bike
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Bike Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : bikes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <span className="text-4xl">🚲</span>
          <p className="mt-2 text-sm font-medium text-gray-900">No bikes yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add your first bike to start tracking components and maintenance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bikes.map((bike) => (
            <div key={bike.id}>
              <div className={selectedBike?.id === bike.id ? 'rounded-lg ring-2 ring-primary' : ''}>
                <BikeCard
                  bike={bike}
                  onEdit={handleEditBike}
                  onDelete={(b) => setDeletingBike(b)}
                />
              </div>
              <button
                onClick={() => setSelectedBike(bike)}
                className="mt-2 w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                {selectedBike?.id === bike.id ? 'Hide Components' : 'View Components'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Component Section */}
      {selectedBike && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Components: {selectedBike.name}</h3>
              <p className="text-sm text-gray-500">
                {selectedBike.current_km.toFixed(0)} km on the bike
              </p>
            </div>
            <button
              onClick={handleAddComponent}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Add Component
            </button>
          </div>

          {componentsError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Bike</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete &ldquo;{deletingBike.name}&rdquo;? This action cannot
              be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingBike(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteBike(deletingBike.id);
                  if (selectedBike?.id === deletingBike.id) setSelectedBike(null);
                  setDeletingBike(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Component Confirmation */}
      {deletingComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Component</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete &ldquo;{deletingComponent.name}&rdquo;?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingComponent(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteComponent(deletingComponent.id);
                  setDeletingComponent(null);
                }}
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

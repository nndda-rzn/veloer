import { useState } from 'react';
import { BikeCard, BikeForm, useBikes } from '@/features/inventory';
import type { Bike, BikeFormData } from '@/features/inventory';

export function InventoryPage() {
  const { bikes, loading, error, createBike, updateBike, deleteBike } = useBikes();
  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [deletingBike, setDeletingBike] = useState<Bike | null>(null);

  const handleAdd = () => {
    setEditingBike(null);
    setShowForm(true);
  };

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike);
    setShowForm(true);
  };

  const handleSubmit = async (data: BikeFormData) => {
    if (editingBike) {
      await updateBike(editingBike.id, data);
    } else {
      await createBike(data);
    }
    setShowForm(false);
    setEditingBike(null);
  };

  const handleDelete = (bike: Bike) => {
    setDeletingBike(bike);
  };

  const confirmDelete = async () => {
    if (deletingBike) {
      await deleteBike(deletingBike.id);
      setDeletingBike(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bikes &amp; Gear</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your bikes and components</p>
        </div>
        <button
          onClick={handleAdd}
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
            <BikeCard key={bike.id} bike={bike} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <BikeForm
          bike={editingBike}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBike(null);
          }}
        />
      )}

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

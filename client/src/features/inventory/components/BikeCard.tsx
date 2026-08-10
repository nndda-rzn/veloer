import type { Bike } from '../types/inventory';
import { formatIDR, formatDate } from '@/shared/lib/utils';

interface BikeCardProps {
  bike: Bike;
  onEdit: (bike: Bike) => void;
  onDelete: (bike: Bike) => void;
}

const typeLabels: Record<Bike['type'], string> = {
  road: 'Road',
  mtb: 'MTB',
  gravel: 'Gravel',
  hybrid: 'Hybrid',
  folding: 'Folding',
  other: 'Other',
};

const statusColors: Record<Bike['status'], string> = {
  active: 'bg-green-100 text-green-700',
  retired: 'bg-gray-100 text-gray-600',
  sold: 'bg-blue-100 text-blue-700',
};

export function BikeCard({ bike, onEdit, onDelete }: BikeCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{bike.name}</h3>
          <p className="text-sm text-gray-500">
            {bike.brand ?? '—'} {bike.model ?? ''}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[bike.status]}`}
        >
          {bike.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Type</p>
          <p className="font-medium text-gray-900">{typeLabels[bike.type]}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Current KM</p>
          <p className="font-medium text-gray-900">{bike.current_km.toFixed(0)} km</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Purchase Date
          </p>
          <p className="font-medium text-gray-900">
            {bike.purchase_date ? formatDate(bike.purchase_date) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Purchase Price
          </p>
          <p className="font-medium text-gray-900">
            {bike.purchase_price != null ? formatIDR(bike.purchase_price) : '—'}
          </p>
        </div>
      </div>

      {bike.notes && <p className="mt-3 text-sm italic text-gray-500">{bike.notes}</p>}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(bike)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(bike)}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

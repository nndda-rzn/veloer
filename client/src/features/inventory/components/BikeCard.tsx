import type { Bike } from '../types/inventory';
import { formatIDR, formatDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui';

interface BikeCardProps {
  bike: Bike;
  onEdit: (bike: Bike) => void;
  onDelete: (bike: Bike) => void;
}

const typeLabels: Record<Bike['type'], string> = {
  road: 'Road Bike',
  mtb: 'Mountain Bike',
  gravel: 'Gravel Bike',
  hybrid: 'Hybrid Bike',
  folding: 'Folding Bike',
  other: 'Other',
};

const statusVariant: Record<Bike['status'], 'success' | 'neutral' | 'info'> = {
  active: 'success',
  retired: 'neutral',
  sold: 'info',
};

export function BikeCard({ bike, onEdit, onDelete }: BikeCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">{bike.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {bike.brand ?? '—'} {bike.model ?? ''}
          </p>
        </div>
        <Badge variant={statusVariant[bike.status]}>
          {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Type</p>
          <p className="mt-0.5 font-medium text-gray-900">{typeLabels[bike.type]}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Current KM</p>
          <p className="mt-0.5 font-medium text-gray-900">{bike.current_km.toFixed(0)} km</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Purchase Date
          </p>
          <p className="mt-0.5 font-medium text-gray-900">
            {bike.purchase_date ? formatDate(bike.purchase_date) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Purchase Price
          </p>
          <p className="mt-0.5 font-medium text-gray-900">
            {bike.purchase_price != null ? formatIDR(bike.purchase_price) : '—'}
          </p>
        </div>
      </div>

      {bike.notes && <p className="mt-3 text-xs italic text-gray-400">{bike.notes}</p>}

      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={() => onEdit(bike)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(bike)}
          className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

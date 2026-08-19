import type { Bike } from '../types/inventory';
import { formatIDR, formatDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui';
import { Bike as BikeIcon } from 'lucide-react';

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

const typeFallbackImages: Partial<Record<Bike['type'], string>> = {
  road: '/road-bike.png',
  mtb: '/mountain-bike.png',
};

export function BikeCard({ bike, onEdit, onDelete }: BikeCardProps) {
  const fallbackImage = typeFallbackImages[bike.type] ?? null;

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Photo banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {bike.photo_url ? (
          <img
            src={bike.photo_url}
            alt={bike.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : fallbackImage ? (
          <img
            src={fallbackImage}
            alt={`${typeLabels[bike.type]} placeholder`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BikeIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute right-2 top-2">
          <Badge variant={statusVariant[bike.status]}>
            {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-gray-900">{bike.name}</h3>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {bike.brand ?? '—'} {bike.model ?? ''}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
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

        {bike.notes && (
          <p className="mt-3 line-clamp-2 text-xs italic text-gray-400">{bike.notes}</p>
        )}

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
    </div>
  );
}

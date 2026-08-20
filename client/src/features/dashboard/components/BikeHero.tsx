import { useState } from 'react';
import type { Bike } from '@/features/inventory';
import type { ActivityStats } from '@/features/activity';
import { formatDistance } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';
import { Bike as BikeIcon } from 'lucide-react';

interface BikeHeroProps {
  displayName: string | null;
  bikes: Bike[];
  defaultBikeId: string | null;
  activityStats: ActivityStats | null;
  loading?: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getBikeImage(type: Bike['type']): string {
  switch (type) {
    case 'mtb':
      return '/mountain-bike.png';
    default:
      return '/road-bike.png';
  }
}

const bikeTypeLabels: Record<Bike['type'], string> = {
  road: 'Road Bike',
  mtb: 'Mountain Bike',
  gravel: 'Gravel Bike',
  hybrid: 'Hybrid Bike',
  folding: 'Folding Bike',
  other: 'Bike',
};

export function BikeHero({
  displayName,
  bikes,
  defaultBikeId,
  activityStats,
  loading = false,
}: BikeHeroProps) {
  const activeBikes = bikes.filter((b) => b.status === 'active');

  if (loading && bikes.length === 0) {
    return <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />;
  }
  const defaultBike = activeBikes.find((b) => b.id === defaultBikeId) ?? activeBikes[0] ?? null;
  const [selectedBikeId, setSelectedBikeId] = useState(defaultBike?.id ?? null);
  const selectedBike = activeBikes.find((b) => b.id === selectedBikeId) ?? defaultBike ?? null;

  if (!selectedBike) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 p-6 md:p-10">
        <p className="text-sm font-medium text-primary-200">{getGreeting()}</p>
        <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          {displayName ?? 'Welcome back'}!
        </h2>
        <p className="mt-2 text-sm text-primary-200">No active bikes yet.</p>
        <Link
          to="/inventory"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          <BikeIcon className="h-4 w-4" aria-hidden="true" />
          Add a bike
        </Link>
      </div>
    );
  }

  const bikeImage = getBikeImage(selectedBike.type);
  const totalRides = activityStats?.count ?? 0;
  const totalKm = selectedBike.current_km;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 p-6 md:p-10">
      {/* Bike image — large background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:justify-end">
        <img
          src={bikeImage}
          alt={selectedBike.name}
          width={480}
          height={300}
          className="h-full max-h-[300px] w-auto object-contain opacity-90 drop-shadow-2xl md:mr-8"
        />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col gap-2 md:max-w-md">
        <p className="text-sm font-medium text-primary-200">{getGreeting()}</p>
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          {displayName ?? 'Welcome back'}!
        </h2>
        <p className="text-sm text-primary-200">
          {bikeTypeLabels[selectedBike.type]} &mdash;{' '}
          <span className="font-medium text-white">{selectedBike.name}</span>
        </p>

        <div className="mt-3 flex gap-3">
          <div className="rounded-lg bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <p className="text-xs text-primary-200">Total Distance</p>
            <p className="text-base font-bold text-white">{formatDistance(totalKm * 1000)}</p>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <p className="text-xs text-primary-200">Total Rides</p>
            <p className="text-base font-bold text-white">{totalRides}</p>
          </div>
        </div>

        {/* Bike switcher */}
        {activeBikes.length > 1 && (
          <div className="mt-3 flex gap-2">
            {activeBikes.map((bike) => (
              <button
                key={bike.id}
                onClick={() => setSelectedBikeId(bike.id)}
                aria-label={`Switch to ${bike.name}`}
                aria-pressed={bike.id === selectedBike.id}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  bike.id === selectedBike.id
                    ? 'bg-white text-primary-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {bike.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

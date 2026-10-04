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
      return '/mountain-bike.webp';
    default:
      return '/road-bike.webp';
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
  const defaultBike = activeBikes.find((b) => b.id === defaultBikeId) ?? activeBikes[0] ?? null;

  // Hooks must run on every render, before any early return. Placing useState
  // after the loading guard made the first render (empty cache) call zero hooks
  // and the next render call one, which React rejects with "Rendered more hooks
  // than during the previous render".
  const [selectedBikeId, setSelectedBikeId] = useState(defaultBike?.id ?? null);
  const selectedBike = activeBikes.find((b) => b.id === selectedBikeId) ?? defaultBike ?? null;

  if (loading && bikes.length === 0) {
    return <div className="h-40 animate-pulse rounded-xl bg-secondary" />;
  }

  if (!selectedBike) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <p className="text-sm font-medium text-primary-700">{getGreeting()}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {displayName ?? 'Welcome back'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No active bikes yet. Add one to start tracking rides, wear, and maintenance.
        </p>
        <Link
          to="/inventory"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          <BikeIcon className="h-4 w-4" aria-hidden="true" />
          Add a bike
        </Link>
      </div>
    );
  }

  const bikeImage = getBikeImage(selectedBike.type);
  const totalRides = activityStats?.count ?? 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary-700">{getGreeting()}</p>
          <h2 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
            {displayName ?? 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {bikeTypeLabels[selectedBike.type]} ·{' '}
            <span className="font-medium text-foreground">{selectedBike.name}</span>
          </p>

          <div className="mt-5 flex gap-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total distance
              </p>
              <p className="mt-0.5 text-lg font-mono font-semibold tabular-nums text-foreground">
                {formatDistance(selectedBike.current_km * 1000)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Rides (7d)</p>
              <p className="mt-0.5 text-lg font-mono font-semibold tabular-nums text-foreground">
                {totalRides}
              </p>
            </div>
          </div>
        </div>

        <img
          src={bikeImage}
          alt={selectedBike.name}
          width={280}
          height={175}
          loading="lazy"
          className="pointer-events-none hidden h-auto w-[280px] flex-shrink-0 object-contain md:block"
        />
      </div>

      {activeBikes.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border bg-background/60 px-6 py-3 md:px-8">
          {activeBikes.map((bike) => (
            <button
              key={bike.id}
              onClick={() => setSelectedBikeId(bike.id)}
              aria-pressed={bike.id === selectedBike.id}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                bike.id === selectedBike.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {bike.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

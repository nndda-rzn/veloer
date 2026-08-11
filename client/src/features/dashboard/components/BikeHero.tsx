import { useState } from 'react';
import type { Bike } from '@/features/inventory';
import type { ActivityStats } from '@/features/activity';
import { formatDistance } from '@/shared/lib/utils';

interface BikeHeroProps {
  displayName: string | null;
  bikes: Bike[];
  defaultBikeId: string | null;
  activityStats: ActivityStats | null;
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

export function BikeHero({ displayName, bikes, defaultBikeId, activityStats }: BikeHeroProps) {
  const activeBikes = bikes.filter((b) => b.status === 'active');

  const defaultBike = activeBikes.find((b) => b.id === defaultBikeId) ?? activeBikes[0] ?? null;

  const [selectedBikeId, setSelectedBikeId] = useState(defaultBike?.id ?? null);

  const selectedBike = activeBikes.find((b) => b.id === selectedBikeId) ?? defaultBike ?? null;

  if (!selectedBike) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-primary-900 to-primary-700 p-8 text-white">
        <h2 className="text-2xl font-bold">
          {getGreeting()}, {displayName ?? 'there'}!
        </h2>
        <p className="mt-2 text-sm text-primary-200">
          No active bikes yet. Add a bike to get started.
        </p>
      </div>
    );
  }

  const bikeImage = getBikeImage(selectedBike.type);
  const totalRides = activityStats?.count ?? 0;
  const totalKm = selectedBike.current_km;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 to-primary-700 p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left — greeting + bike info + stats */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            {getGreeting()}, {displayName ?? 'there'}!
          </h2>
          <p className="mt-2 text-sm text-primary-200">
            {bikeTypeLabels[selectedBike.type]} • {selectedBike.brand ?? 'Unknown'}{' '}
            {selectedBike.model ?? ''}
          </p>

          <div className="mt-4 flex gap-4">
            <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-xs text-primary-200">Total Distance</p>
              <p className="text-lg font-bold text-white">{formatDistance(totalKm * 1000)}</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-xs text-primary-200">Total Rides</p>
              <p className="text-lg font-bold text-white">{totalRides}</p>
            </div>
          </div>

          {/* Bike switcher */}
          {activeBikes.length > 1 && (
            <div className="mt-4 flex gap-2">
              {activeBikes.map((bike) => (
                <button
                  key={bike.id}
                  onClick={() => setSelectedBikeId(bike.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
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

        {/* Right — bike image */}
        <div className="flex-shrink-0">
          <img
            src={bikeImage}
            alt={selectedBike.name}
            className="h-32 w-auto object-contain drop-shadow-2xl md:h-48"
          />
        </div>
      </div>
    </div>
  );
}

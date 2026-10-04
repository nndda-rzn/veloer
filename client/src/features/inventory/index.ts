export { BikeTable } from './components/BikeTable';
export { BikeForm } from './components/BikeForm';
export { BikeHero } from './components/BikeHero';
export { ComponentCard, CATEGORY_LABELS } from './components/ComponentCard';
export { ComponentForm } from './components/ComponentForm';
export { LifespanIndicator } from './components/LifespanIndicator';
export { GearStatsBar } from './components/GearStatsBar';
export { useBikes } from './hooks/useBikes';
export { useBikeDetail } from './hooks/useBikeDetail';
export { useBikeActivities } from './hooks/useBikeActivities';
export { bikeApi } from './api/bike.api';
export { componentApi } from './api/component.api';
export {
  wearKm,
  wearPercent,
  remainingKm,
  lifespanBarColor,
  lifespanTextColor,
  lifespanBar,
  lifespanText,
  type LifespanStatus,
} from './lib/lifespan';
export {
  costPerKm,
  summarizeGear,
  summarizeWear,
  sortByWear,
  wearBand,
  type GearSummary,
  type WearSummary,
  type WearBand,
} from './lib/inventory-metrics';
export type { Bike, Component, BikeFormData, ComponentFormData } from './types/inventory';

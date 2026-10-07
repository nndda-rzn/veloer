export { BikeCard } from './components/BikeCard';
export { BikeForm } from './components/BikeForm';
export { BikeHero } from './components/BikeHero';
export { ConditionRail } from './components/ConditionRail';
export { FleetHealthStrip } from './components/FleetHealthStrip';
export { ComponentCard, CATEGORY_LABELS } from './components/ComponentCard';
export { ComponentForm } from './components/ComponentForm';
export { LifespanIndicator } from './components/LifespanIndicator';
export { useBikes } from './hooks/useBikes';
export { useBikeDetail } from './hooks/useBikeDetail';
export { useBikeActivities } from './hooks/useBikeActivities';
export { bikeApi } from './api/bike.api';
export { componentApi } from './api/component.api';
export { wearApi } from './api/wear.api';
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
  summarizeWear,
  sortByWear,
  wearBand,
  type WearSummary,
  type WearBand,
} from './lib/inventory-metrics';
export {
  CATEGORY_ORDER,
  categoryWear,
  bikeHealth,
  fleetHealth,
  type CategoryWear,
  type BikeHealth,
  type FleetAlert,
  type FleetHealth,
} from './lib/garage-metrics';
export { weeklyKmRate, projectWear, type WearProjection } from './lib/wear-projection';
export type {
  Bike,
  Component,
  BikeFormData,
  ComponentFormData,
  WearAlert,
} from './types/inventory';

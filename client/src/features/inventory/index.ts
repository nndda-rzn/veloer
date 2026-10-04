export { BikeTable } from './components/BikeTable';
export { BikeForm } from './components/BikeForm';
export { ComponentForm } from './components/ComponentForm';
export { LifespanIndicator } from './components/LifespanIndicator';
export { useBikes } from './hooks/useBikes';
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
export type { Bike, Component, BikeFormData, ComponentFormData } from './types/inventory';

import 'reflect-metadata';
import { container } from 'tsyringe';
import type { UserRepository } from '../domain/repositories/auth/UserRepository.js';
import type { UserProfileRepository } from '../domain/repositories/auth/UserProfileRepository.js';
import type { ActivityRepository } from '../domain/repositories/activity/ActivityRepository.js';
import type {
  BikeRepository,
  ComponentRepository,
} from '../domain/repositories/inventory/BikeRepository.js';
import type {
  MaintenanceLogRepository,
  MaintenanceScheduleRepository,
} from '../domain/repositories/maintenance/MaintenanceLogRepository.js';
import type { StravaPort } from '../application/ports/StravaPort.js';
import type { TokenPort } from '../application/ports/TokenPort.js';
import { SupabaseUserRepository } from '../infrastructure/database/repositories/auth/SupabaseUserRepository.js';
import { SupabaseUserProfileRepository } from '../infrastructure/database/repositories/auth/SupabaseUserProfileRepository.js';
import { SupabaseActivityRepository } from '../infrastructure/database/repositories/activity/SupabaseActivityRepository.js';
import { SupabaseBikeRepository } from '../infrastructure/database/repositories/inventory/SupabaseBikeRepository.js';
import { SupabaseComponentRepository } from '../infrastructure/database/repositories/inventory/SupabaseComponentRepository.js';
import { SupabaseMaintenanceLogRepository } from '../infrastructure/database/repositories/maintenance/SupabaseMaintenanceLogRepository.js';
import { SupabaseMaintenanceScheduleRepository } from '../infrastructure/database/repositories/maintenance/SupabaseMaintenanceScheduleRepository.js';
import { StravaAdapter } from '../infrastructure/strava/StravaAdapter.js';
import { JwtTokenAdapter } from '../infrastructure/auth/JwtTokenAdapter.js';

// Register repositories (interfaces -> implementations)
container.registerSingleton<UserRepository>('UserRepository', SupabaseUserRepository);
container.registerSingleton<UserProfileRepository>(
  'UserProfileRepository',
  SupabaseUserProfileRepository,
);
container.registerSingleton<ActivityRepository>('ActivityRepository', SupabaseActivityRepository);
container.registerSingleton<BikeRepository>('BikeRepository', SupabaseBikeRepository);
container.registerSingleton<ComponentRepository>(
  'ComponentRepository',
  SupabaseComponentRepository,
);
container.registerSingleton<MaintenanceLogRepository>(
  'MaintenanceLogRepository',
  SupabaseMaintenanceLogRepository,
);
container.registerSingleton<MaintenanceScheduleRepository>(
  'MaintenanceScheduleRepository',
  SupabaseMaintenanceScheduleRepository,
);

// Register service adapters (ports -> implementations)
container.registerSingleton<StravaPort>('StravaPort', StravaAdapter);
container.registerSingleton<TokenPort>('TokenPort', JwtTokenAdapter);

export { container };

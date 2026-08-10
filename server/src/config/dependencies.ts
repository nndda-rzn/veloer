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
import type {
  TransactionRepository,
  BudgetRepository,
} from '../domain/repositories/finance/TransactionRepository.js';
import type { GoalRepository } from '../domain/repositories/goals/GoalRepository.js';
import type { EventRepository } from '../domain/repositories/events/EventRepository.js';
import type { StravaPort } from '../application/ports/StravaPort.js';
import type { TokenPort } from '../application/ports/TokenPort.js';
import { SupabaseUserRepository } from '../infrastructure/database/repositories/auth/SupabaseUserRepository.js';
import { SupabaseUserProfileRepository } from '../infrastructure/database/repositories/auth/SupabaseUserProfileRepository.js';
import { SupabaseActivityRepository } from '../infrastructure/database/repositories/activity/SupabaseActivityRepository.js';
import { SupabaseBikeRepository } from '../infrastructure/database/repositories/inventory/SupabaseBikeRepository.js';
import { SupabaseComponentRepository } from '../infrastructure/database/repositories/inventory/SupabaseComponentRepository.js';
import { SupabaseMaintenanceLogRepository } from '../infrastructure/database/repositories/maintenance/SupabaseMaintenanceLogRepository.js';
import { SupabaseMaintenanceScheduleRepository } from '../infrastructure/database/repositories/maintenance/SupabaseMaintenanceScheduleRepository.js';
import { SupabaseTransactionRepository } from '../infrastructure/database/repositories/finance/SupabaseTransactionRepository.js';
import { SupabaseBudgetRepository } from '../infrastructure/database/repositories/finance/SupabaseBudgetRepository.js';
import { SupabaseGoalRepository } from '../infrastructure/database/repositories/goals/SupabaseGoalRepository.js';
import { SupabaseEventRepository } from '../infrastructure/database/repositories/events/SupabaseEventRepository.js';
import { StravaAdapter } from '../infrastructure/strava/StravaAdapter.js';
import { JwtTokenAdapter } from '../infrastructure/auth/JwtTokenAdapter.js';
import { RefreshStravaToken } from '../application/use-cases/auth/RefreshStravaToken.js';
import { GetGoals, UpdateGoalProgress } from '../application/use-cases/goals/GoalUseCases.js';
import { AddTransaction } from '../application/use-cases/finance/TransactionUseCases.js';
import {
  GetActivityLaps,
  GetActivityZones,
} from '../application/use-cases/activity/GetActivityLapsZones.js';

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
container.registerSingleton<TransactionRepository>(
  'TransactionRepository',
  SupabaseTransactionRepository,
);
container.registerSingleton<BudgetRepository>('BudgetRepository', SupabaseBudgetRepository);
container.registerSingleton<GoalRepository>('GoalRepository', SupabaseGoalRepository);
container.registerSingleton<EventRepository>('EventRepository', SupabaseEventRepository);

// Register use cases that are injected as class references
container.registerSingleton(RefreshStravaToken);
container.registerSingleton(GetGoals);
container.registerSingleton(UpdateGoalProgress);
container.registerSingleton(AddTransaction);
container.registerSingleton(GetActivityLaps);
container.registerSingleton(GetActivityZones);

// Register service adapters (ports -> implementations)
container.registerSingleton<StravaPort>('StravaPort', StravaAdapter);
container.registerSingleton<TokenPort>('TokenPort', JwtTokenAdapter);

export { container };

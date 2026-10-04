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
import type { TrainingPlanRepository } from '../domain/repositories/training/TrainingPlanRepository.js';
import type { StravaPort } from '../application/ports/StravaPort.js';
import type { TokenPort } from '../application/ports/TokenPort.js';
import type { StoragePort } from '../application/ports/StoragePort.js';
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
import { SupabaseTrainingPlanRepository } from '../infrastructure/database/repositories/training/SupabaseTrainingPlanRepository.js';
import { StravaAdapter } from '../infrastructure/strava/StravaAdapter.js';
import { SupabaseStorage } from '../infrastructure/storage/SupabaseStorage.js';
import { JwtTokenAdapter } from '../infrastructure/auth/JwtTokenAdapter.js';
import { RefreshStravaToken } from '../application/use-cases/auth/RefreshStravaToken.js';
import {
  GetGoals,
  RecomputeGoalProgress,
  AdjustGoalProgress,
} from '../application/use-cases/goals/GoalUseCases.js';
import { AddTransaction } from '../application/use-cases/finance/TransactionUseCases.js';
import {
  GetActivityLaps,
  GetActivityZones,
} from '../application/use-cases/activity/GetActivityLapsZones.js';
import { GenerateRecommendation } from '../application/use-cases/training/GenerateRecommendation.js';
import { AutoRescheduleMissed } from '../application/use-cases/training/AutoRescheduleMissed.js';
import { GetPlanRetrospective } from '../application/use-cases/training/GetPlanRetrospective.js';
import { GeneratePlanFromTemplate } from '../application/use-cases/training/GeneratePlanFromTemplate.js';

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
container.registerSingleton<TrainingPlanRepository>(
  'TrainingPlanRepository',
  SupabaseTrainingPlanRepository,
);

// Register use cases that are injected as class references
container.registerSingleton(RefreshStravaToken);
container.registerSingleton(GetGoals);
container.registerSingleton(RecomputeGoalProgress);
container.registerSingleton(AdjustGoalProgress);
container.registerSingleton(AddTransaction);
container.registerSingleton(GetActivityLaps);
container.registerSingleton(GetActivityZones);
container.registerSingleton(GenerateRecommendation);
container.registerSingleton(AutoRescheduleMissed);
container.registerSingleton(GetPlanRetrospective);
container.registerSingleton(GeneratePlanFromTemplate);

// Register service adapters (ports -> implementations)
container.registerSingleton<StravaPort>('StravaPort', StravaAdapter);
container.registerSingleton<TokenPort>('TokenPort', JwtTokenAdapter);
container.registerSingleton<StoragePort>('StoragePort', SupabaseStorage);

export { container };

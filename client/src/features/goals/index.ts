export { ProgressRing } from './components/ProgressRing';
export { GoalCard } from './components/GoalCard';
export { GoalForm } from './components/GoalForm';
export { LogProgressDialog } from './components/LogProgressDialog';
export { GoalsSummary } from './components/GoalsSummary';
export { useGoals, goalKeys } from './hooks/useGoals';
export { goalApi } from './api/goal.api';
export type { Goal, GoalFormData, GoalUpdateData } from './types/goal';
export {
  GOAL_TYPE_LABELS,
  GOAL_PERIOD_LABELS,
  GOAL_STATUS_VARIANTS,
  GOAL_HEALTH_LABELS,
  GOAL_HEALTH_TONE,
  goalProgress,
  summarizeGoals,
  projectedCompletion,
} from './lib/goal-progress';
export type { GoalProgress, GoalHealth, GoalSummary } from './lib/goal-progress';

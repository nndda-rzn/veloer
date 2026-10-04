export { ProgressRing } from './components/ProgressRing';
export { GoalCard } from './components/GoalCard';
export { GoalForm } from './components/GoalForm';
export { LogProgressDialog } from './components/LogProgressDialog';
export { useGoals } from './hooks/useGoals';
export { goalApi } from './api/goal.api';
export type { Goal, GoalFormData } from './types/goal';
export {
  GOAL_TYPE_LABELS,
  GOAL_PERIOD_LABELS,
  GOAL_STATUS_VARIANTS,
  GOAL_HEALTH_LABELS,
  GOAL_HEALTH_TONE,
  goalProgress,
} from './lib/goal-progress';
export type { GoalProgress, GoalHealth } from './lib/goal-progress';

import { useState } from 'react';
import { GoalCard, GoalForm, useGoals } from '@/features/goals';
import type { Goal, GoalFormData } from '@/features/goals';
import { PageHeader, EmptyState } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Target } from 'lucide-react';

export function GoalsPage() {
  const { goals, loading, error, createGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  const handleSubmit = async (data: GoalFormData) => {
    await createGoal(data);
    setShowForm(false);
  };

  const confirmDelete = async () => {
    if (deletingGoal) {
      await deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Your cycling goals and training progress"
        action={<Button onClick={() => setShowForm(true)}>Create Goal</Button>}
      />

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create a goal to track your cycling progress."
          action={{ label: 'Create Goal', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={setDeletingGoal} />
          ))}
        </div>
      )}

      {showForm && <GoalForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

      {deletingGoal && (
        <AlertDialog open onOpenChange={(open) => !open && setDeletingGoal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this goal? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="danger" onClick={() => void confirmDelete()}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

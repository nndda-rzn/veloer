import { useState } from 'react';
import { GoalCard, GoalForm, useGoals } from '@/features/goals';
import type { Goal, GoalFormData } from '@/features/goals';
import { PageHeader, EmptyState, ConfirmDialog } from '@/shared/components/ui';
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
        action={
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Create Goal
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

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
        <ConfirmDialog
          title="Delete Goal"
          description="Are you sure you want to delete this goal? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeletingGoal(null)}
        />
      )}
    </div>
  );
}

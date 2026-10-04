import { useMemo, useState } from 'react';
import { GoalCard, GoalForm, useGoals } from '@/features/goals';
import type { Goal, GoalFormData } from '@/features/goals';
import { goalProgress } from '@/features/goals/lib/goal-progress';
import { PageHeader, EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Target } from 'lucide-react';

interface Section {
  key: string;
  title: string;
  goals: Goal[];
}

export function GoalsPage() {
  const { goals, loading, error, createGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  const sections: Section[] = useMemo(() => {
    const active: Goal[] = [];
    const done: Goal[] = [];
    const archived: Goal[] = [];

    for (const goal of goals) {
      if (goal.status === 'completed') done.push(goal);
      else if (goal.status === 'active') active.push(goal);
      else archived.push(goal);
    }

    // Active goals: most urgent (fewest days left) first.
    active.sort((a, b) => goalProgress(a).daysRemaining - goalProgress(b).daysRemaining);

    return [
      { key: 'active', title: 'Active', goals: active },
      { key: 'completed', title: 'Completed', goals: done },
      { key: 'archived', title: 'Failed & cancelled', goals: archived },
    ].filter((s) => s.goals.length > 0);
  }, [goals]);

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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary" />
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
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                  {section.goals.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {section.goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onDelete={setDeletingGoal} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {showForm && <GoalForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

      <ConfirmDialog
        open={deletingGoal !== null}
        onOpenChange={(open) => !open && setDeletingGoal(null)}
        title="Delete goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}

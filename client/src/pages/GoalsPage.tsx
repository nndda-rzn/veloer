import { useState } from 'react';
import { GoalCard, GoalForm, useGoals } from '@/features/goals';
import type { Goal, GoalFormData } from '@/features/goals';

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goals</h2>
          <p className="mt-1 text-sm text-gray-500">Your cycling goals and training progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Create Goal
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <span className="text-4xl">🎯</span>
          <p className="mt-2 text-sm font-medium text-gray-900">No goals yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create a goal to track your cycling progress.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={setDeletingGoal} />
          ))}
        </div>
      )}

      {showForm && <GoalForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

      {deletingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Goal</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this goal?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingGoal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

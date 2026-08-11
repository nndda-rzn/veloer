import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans, trainingApi } from '@/features/training';
import { TrainingPlanCard } from '@/features/training/components/TrainingPlanCard';
import { TrainingPlanForm } from '@/features/training/components/TrainingPlanForm';
import { TemplateLibrary } from '@/features/training/components/TemplateLibrary';
import type { TrainingPlan, TrainingPlanFormData, TemplateKey } from '@/features/training';
import { settingsApi } from '@/features/settings';
import { useEffect, useRef } from 'react';

export function TrainingPlansPage() {
  const navigate = useNavigate();
  const { plans, loading, error, createPlan, deletePlan, refetch } = usePlans();
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [defaultFtp, setDefaultFtp] = useState(250);
  const ftpFetched = useRef(false);

  useEffect(() => {
    if (ftpFetched.current) return;
    ftpFetched.current = true;
    settingsApi
      .getProfile()
      .then((profile) => {
        if (profile?.ftp) setDefaultFtp(profile.ftp);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (data: TrainingPlanFormData) => {
    await createPlan(data);
    setShowForm(false);
  };

  const handleDelete = async (plan: TrainingPlan) => {
    if (!confirm(`Delete "${plan.title}"? This will remove all workouts in this plan.`)) return;
    await deletePlan(plan.id);
  };

  const handleFromTemplate = async (template: TemplateKey, startDate: string, title?: string) => {
    try {
      await trainingApi.createFromTemplate({ template, start_date: startDate, title });
      setShowTemplates(false);
      refetch();
    } catch (err) {
      console.error('Failed to create plan from template:', err);
      alert('Failed to create plan from template. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Training Plans</h1>
          <p className="text-sm text-gray-500">Plan and schedule your cycling training</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50"
          >
            From Template
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + New Plan
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No training plans yet.</p>
          <div className="mt-3 flex justify-center gap-3">
            <button
              onClick={() => setShowTemplates(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Start from template
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Create custom plan
            </button>
          </div>
        </div>
      )}

      {!loading && plans.length > 0 && (
        <div className="space-y-3">
          {plans.map((plan) => (
            <TrainingPlanCard
              key={plan.id}
              plan={plan}
              onClick={(p) => navigate(`/training-plans/${p.id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TrainingPlanForm
          defaultFtp={defaultFtp}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showTemplates && (
        <TemplateLibrary
          defaultFtp={defaultFtp}
          onSelect={handleFromTemplate}
          onCancel={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}

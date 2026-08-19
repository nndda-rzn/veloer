import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans, trainingApi } from '@/features/training';
import { TrainingPlanCard } from '@/features/training/components/TrainingPlanCard';
import { TrainingPlanForm } from '@/features/training/components/TrainingPlanForm';
import { TemplateLibrary } from '@/features/training/components/TemplateLibrary';
import { SmartPlanModal } from '@/features/training/components/SmartPlanModal';
import { useFitnessAnalysis } from '@/features/training';
import type { TrainingPlan, TrainingPlanFormData, TemplateKey } from '@/features/training';
import { settingsApi } from '@/features/settings';
import { useEffect, useRef } from 'react';
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
import { ClipboardList, Sparkles } from 'lucide-react';

export function TrainingPlansPage() {
  const navigate = useNavigate();
  const { plans, loading, error, createPlan, deletePlan, refetch } = usePlans();
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSmartPlan, setShowSmartPlan] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [defaultFtp, setDefaultFtp] = useState(250);
  const ftpFetched = useRef(false);
  const {
    analysis,
    loading: analysisLoading,
    error: analysisError,
    analyze,
  } = useFitnessAnalysis();

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

  const [deletingPlan, setDeletingPlan] = useState<TrainingPlan | null>(null);

  const handleDelete = async (plan: TrainingPlan) => {
    setDeletingPlan(plan);
  };

  const confirmDelete = async () => {
    if (deletingPlan) {
      await deletePlan(deletingPlan.id);
      setDeletingPlan(null);
    }
  };

  const handleFromTemplate = async (template: TemplateKey, startDate: string, title?: string) => {
    try {
      await trainingApi.createFromTemplate({ template, start_date: startDate, title });
      setShowTemplates(false);
      refetch();
    } catch (err) {
      console.error('Failed to create plan from template:', err);
      setTemplateError('Failed to create plan from template. Please try again.');
    }
  };

  const handleOpenSmartPlan = async () => {
    await analyze();
    setShowSmartPlan(true);
  };

  const handleSmartPlanConfirm = async (
    template: TemplateKey,
    startDate: string,
    ftpBaseline: number,
    title?: string,
  ) => {
    await trainingApi.createFromTemplate({
      template,
      start_date: startDate,
      title,
      ftp_baseline: ftpBaseline,
    });
    setShowSmartPlan(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Plans"
        description="Plan and schedule your cycling training"
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => void handleOpenSmartPlan()}
              disabled={analysisLoading}
              loading={analysisLoading}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {analysisLoading ? 'Analyzing...' : 'Smart Plan'}
            </Button>
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              From Template
            </Button>
            <Button onClick={() => setShowForm(true)}>New Plan</Button>
          </div>
        }
      />

      {templateError && <Alert variant="error">{templateError}</Alert>}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No training plans yet"
          description="Start from a template or create a custom plan."
          action={{ label: 'Browse Templates', onClick: () => setShowTemplates(true) }}
        />
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

      {showSmartPlan && analysis && (
        <SmartPlanModal
          analysis={analysis}
          defaultFtp={defaultFtp}
          onConfirm={handleSmartPlanConfirm}
          onCancel={() => setShowSmartPlan(false)}
        />
      )}

      {analysisError && (
        <Alert variant="error">Failed to analyze Strava data: {analysisError}</Alert>
      )}

      {deletingPlan && (
        <AlertDialog open onOpenChange={(open) => !open && setDeletingPlan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Plan</AlertDialogTitle>
              <AlertDialogDescription>
                Delete &quot;{deletingPlan.title}&quot;? This will remove all workouts in this plan.
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

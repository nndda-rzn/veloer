import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans, trainingApi } from '@/features/training';
import { TrainingPlanCard } from '@/features/training/components/TrainingPlanCard';
import { ActivePlanHero } from '@/features/training/components/ActivePlanHero';
import { TrainingPlanForm } from '@/features/training/components/TrainingPlanForm';
import { TemplateLibrary } from '@/features/training/components/TemplateLibrary';
import { SmartPlanModal } from '@/features/training/components/SmartPlanModal';
import { useFitnessAnalysis } from '@/features/training';
import type { TrainingPlan, TrainingPlanFormData, TemplateKey } from '@/features/training';
import { isCurrentPlan } from '@/features/training/lib/plan-progress';
import { settingsApi } from '@/features/settings';
import { useEffect, useMemo, useRef } from 'react';
import { PageHeader, EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClipboardList, Sparkles, ChevronDown, LayoutTemplate } from 'lucide-react';

export function TrainingPlansPage() {
  const navigate = useNavigate();
  const { plans, loading, error, createPlan, updatePlan, deletePlan, refetch } = usePlans();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
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
    if (editingPlan) {
      await updatePlan(editingPlan.id, data);
    } else {
      await createPlan(data);
    }
    setShowForm(false);
    setEditingPlan(null);
  };

  const [deletingPlan, setDeletingPlan] = useState<TrainingPlan | null>(null);

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

  const { activePlan, otherPlans } = useMemo(() => {
    const active = plans.find((p) => isCurrentPlan(p)) ?? plans.find((p) => p.status === 'active');
    return {
      activePlan: active ?? null,
      otherPlans: plans.filter((p) => p.id !== active?.id),
    };
  }, [plans]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Plans"
        description="Plan and schedule your cycling training"
        action={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Start from
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => void handleOpenSmartPlan()}
                    disabled={analysisLoading}
                  >
                    <Sparkles aria-hidden="true" />
                    Smart Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowTemplates(true)}>
                    <LayoutTemplate aria-hidden="true" />
                    Template
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => {
                setEditingPlan(null);
                setShowForm(true);
              }}
            >
              New Plan
            </Button>
          </div>
        }
      />

      {templateError && <Alert variant="error">{templateError}</Alert>}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && plans.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No training plans yet"
          description="Start from a template or create a custom plan."
          action={{ label: 'Browse Templates', onClick: () => setShowTemplates(true) }}
        />
      )}

      {!loading && plans.length > 0 && (
        <div className="space-y-6">
          {activePlan && (
            <ActivePlanHero
              plan={activePlan}
              onEdit={(p) => {
                setEditingPlan(p);
                setShowForm(true);
              }}
              onDelete={setDeletingPlan}
            />
          )}

          {otherPlans.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                {activePlan ? 'Other plans' : 'All plans'}
              </h2>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {otherPlans.map((plan) => (
                  <TrainingPlanCard
                    key={plan.id}
                    plan={plan}
                    onClick={(p) => navigate(`/training-plans/${p.id}`)}
                    onEdit={(p) => {
                      setEditingPlan(p);
                      setShowForm(true);
                    }}
                    onDelete={setDeletingPlan}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {showForm && (
        <TrainingPlanForm
          plan={editingPlan ?? undefined}
          defaultFtp={defaultFtp}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingPlan(null);
          }}
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
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingPlan(null)}
          title="Delete plan"
          description={`Delete “${deletingPlan.title}”? This will remove all workouts in this plan.`}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

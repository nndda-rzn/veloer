import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { trainingApi } from '@/features/training';
import { useWorkouts } from '@/features/training';
import { WorkoutCalendar } from '@/features/training/components/WorkoutCalendar';
import { WorkoutDetail } from '@/features/training/components/WorkoutDetail';
import { WorkoutForm } from '@/features/training/components/WorkoutForm';
import { RecommendationCard } from '@/features/training/components/RecommendationCard';
import { FormGauge } from '@/features/training/components/FormGauge';
import { ActivityLinker } from '@/features/training/components/ActivityLinker';
import { TrainingLoadChart } from '@/features/training/components/TrainingLoadChart';
import { NextWorkoutPanel } from '@/features/training/components/NextWorkoutPanel';
import { WeeklySummary } from '@/features/training/components/WeeklySummary';
import { useRecommendation } from '@/features/training';
import { useTrainingLoad } from '@/features/training';
import { PageHeader, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { useToast } from '@/shared/components/feedback/Toaster';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, Trash2, RotateCcw, LineChart } from 'lucide-react';
import { formatDate } from '@/shared/lib/utils';
import type {
  TrainingPlan,
  TrainingWorkout,
  WorkoutFormData,
  WorkoutRecommendation,
} from '@/features/training';

export function TrainingPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<TrainingWorkout | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [editWorkout, setEditWorkout] = useState<TrainingWorkout | null>(null);
  const [showLinker, setShowLinker] = useState(false);
  const [deletingWorkout, setDeletingWorkout] = useState<TrainingWorkout | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [showDeletePlan, setShowDeletePlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);

  const {
    workouts,
    loading: workoutsLoading,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    markStatus,
    linkActivity,
    reschedule,
  } = useWorkouts(id ?? '');
  const { recommendation, loading: recLoading } = useRecommendation();
  const { data: loadHistory, loading: loadHistoryLoading } = useTrainingLoad();

  useEffect(() => {
    if (!id) return;
    trainingApi
      .getPlanById(id)
      .then(setPlan)
      .catch(() => navigate('/training-plans'))
      .finally(() => setPlanLoading(false));
  }, [id, navigate]);

  const handleSelectSlot = (date: Date) => {
    setFormDate(date.toISOString().split('T')[0]);
    setEditWorkout(null);
    setShowForm(true);
  };

  const handleCreateWorkout = async (data: WorkoutFormData) => {
    await createWorkout(data);
    setShowForm(false);
  };

  const handleEditWorkout = async (data: WorkoutFormData) => {
    if (!editWorkout) return;
    await updateWorkout(editWorkout.id, data);
    setEditWorkout(null);
    setShowForm(false);
    setSelectedWorkout(null);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    await deleteWorkout(workoutId);
    setDeletingWorkout(null);
    setSelectedWorkout(null);
  };

  const handleMarkComplete = async (workoutId: string) => {
    await markStatus(workoutId, 'completed');
    setSelectedWorkout(null);
  };

  const handleMarkSkipped = async (workoutId: string) => {
    await markStatus(workoutId, 'skipped');
    setSelectedWorkout(null);
  };

  const handleLinkActivity = (workout: TrainingWorkout) => {
    setSelectedWorkout(workout);
    setShowLinker(true);
  };

  const handleReschedule = async () => {
    setRescheduling(true);
    try {
      const result = await trainingApi.rescheduleMissed(id ?? '');
      await reschedule();
      pushToast(
        result.missed === 0
          ? 'No missed workouts to reschedule'
          : `${result.rescheduled} of ${result.missed} missed workout${result.missed === 1 ? '' : 's'} rescheduled`,
        { level: result.missed === 0 ? 'info' : 'success' },
      );
    } catch {
      pushToast('Could not reschedule missed workouts', { level: 'error' });
    } finally {
      setRescheduling(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!id) return;
    setDeletingPlan(true);
    try {
      await trainingApi.deletePlan(id);
      pushToast('Training plan deleted', { level: 'success' });
      navigate('/training-plans');
    } catch {
      pushToast('Could not delete plan', { level: 'error' });
      setDeletingPlan(false);
      setShowDeletePlan(false);
    }
  };

  const handleAddRecommendation = async (rec: WorkoutRecommendation) => {
    const today = new Date().toISOString().split('T')[0];
    await createWorkout({
      scheduled_date: today,
      workout_type: rec.workout_type,
      title: rec.title,
      description: rec.description,
      target_duration_minutes: rec.target_duration_minutes,
      target_tss: rec.target_tss,
      target_avg_power: rec.target_avg_power ?? undefined,
      intervals_count: rec.intervals?.count ?? undefined,
      interval_duration_seconds: rec.intervals?.duration_seconds ?? undefined,
      interval_power_pct_ftp: rec.intervals?.power_pct_ftp ?? undefined,
      rest_duration_seconds: rec.intervals?.rest_seconds ?? undefined,
      rest_power_pct_ftp: rec.intervals?.rest_pct_ftp ?? undefined,
    });
  };

  if (planLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-secondary" />
        <div className="h-96 animate-pulse rounded-xl bg-secondary" />
      </div>
    );
  }

  if (!plan) return null;

  const completedCount = workouts.filter((w) => w.status === 'completed').length;
  const progressPct =
    workouts.length > 0 ? Math.round((completedCount / workouts.length) * 100) : 0;

  // Next planned workout on/after today (fallback to the earliest upcoming).
  const today = new Date().toISOString().slice(0, 10);
  const nextWorkout =
    workouts
      .filter((w) => w.status === 'planned' && w.scheduled_date >= today)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link to="/training-plans" className="text-sm text-primary hover:underline">
          &larr; Training Plans
        </Link>
        <PageHeader
          title={plan.title}
          description={`${formatDate(plan.start_date)} – ${formatDate(plan.end_date)} · FTP ${plan.ftp_baseline}W`}
          action={
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" aria-label="Plan actions" />}
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                Plan actions
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => void handleReschedule()} disabled={rescheduling}>
                    <RotateCcw aria-hidden="true" />
                    Reschedule missed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(`/training-plans/${plan.id}/retrospective`)}
                  >
                    <LineChart aria-hidden="true" />
                    Retrospective
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setShowDeletePlan(true)}>
                    <Trash2 aria-hidden="true" />
                    Delete plan
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {completedCount}/{workouts.length} workouts
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="tabular-nums">{progressPct}%</span>
        </div>
      </div>

      {/* Today focus: next workout + form/recommendation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NextWorkoutPanel
            workout={nextWorkout}
            onOpen={setSelectedWorkout}
            onMarkComplete={handleMarkComplete}
            onMarkSkipped={handleMarkSkipped}
          />
        </div>
        <div className="space-y-4">
          {!recLoading && recommendation && (
            <FormGauge
              tsb={recommendation.metrics.tsb}
              ctl={recommendation.metrics.ctl}
              atl={recommendation.metrics.atl}
            />
          )}
          {recLoading && <div className="h-48 animate-pulse rounded-xl bg-secondary" />}
        </div>
      </div>

      {/* This week */}
      {!workoutsLoading && <WeeklySummary workouts={workouts} />}

      {/* Calendar */}
      <div>
        {workoutsLoading ? (
          <div className="h-96 animate-pulse rounded-xl bg-secondary" />
        ) : (
          <WorkoutCalendar
            workouts={workouts}
            onSelectWorkout={setSelectedWorkout}
            onSelectSlot={handleSelectSlot}
          />
        )}
      </div>

      {/* Recommendation */}
      {!recLoading && recommendation && (
        <RecommendationCard recommendation={recommendation} onAddToPlan={handleAddRecommendation} />
      )}
      {recLoading && <div className="h-48 animate-pulse rounded-xl bg-secondary" />}

      {/* Training Load Chart */}
      {loadHistoryLoading ? (
        <div className="h-56 animate-pulse rounded-xl bg-secondary" />
      ) : (
        <TrainingLoadChart data={loadHistory} />
      )}

      {/* Workout detail slide-in */}
      {selectedWorkout && !showLinker && (
        <WorkoutDetail
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onMarkComplete={handleMarkComplete}
          onMarkSkipped={handleMarkSkipped}
          onEdit={(w) => {
            setEditWorkout(w);
            setShowForm(true);
            setSelectedWorkout(null);
          }}
          onDelete={(w) => setDeletingWorkout(w)}
          onLinkActivity={handleLinkActivity}
        />
      )}

      {/* Delete workout confirm */}
      {deletingWorkout && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingWorkout(null)}
          title="Delete workout"
          description={`Delete “${deletingWorkout.title}”? This cannot be undone.`}
          onConfirm={() => handleDeleteWorkout(deletingWorkout.id)}
        />
      )}

      {/* Delete plan confirm */}
      {showDeletePlan && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setShowDeletePlan(false)}
          title="Delete plan"
          description={`Delete “${plan.title}”? This will remove all workouts in this plan.`}
          loading={deletingPlan}
          onConfirm={handleDeletePlan}
        />
      )}

      {/* Activity linker */}
      {selectedWorkout && showLinker && (
        <Dialog open onOpenChange={(open) => !open && setShowLinker(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Link Strava Activity</DialogTitle>
              <DialogDescription>Connect a ride from Strava to this workout.</DialogDescription>
            </DialogHeader>
            <ActivityLinker
              workoutId={selectedWorkout.id}
              planId={id ?? ''}
              scheduledDate={selectedWorkout.scheduled_date}
              currentActivityId={selectedWorkout.actual_activity_id}
              onLink={async (wId, aId) => {
                await linkActivity(wId, aId);
                setShowLinker(false);
                setSelectedWorkout(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Workout form */}
      {showForm && (
        <WorkoutForm
          workout={editWorkout ?? undefined}
          defaultDate={formDate}
          onSubmit={editWorkout ? handleEditWorkout : handleCreateWorkout}
          onCancel={() => {
            setShowForm(false);
            setEditWorkout(null);
          }}
        />
      )}
    </div>
  );
}

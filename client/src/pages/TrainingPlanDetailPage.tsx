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
import { useRecommendation } from '@/features/training';
import { useTrainingLoad } from '@/features/training';
import type {
  TrainingPlan,
  TrainingWorkout,
  WorkoutFormData,
  WorkoutRecommendation,
} from '@/features/training';

export function TrainingPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<TrainingWorkout | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [editWorkout, setEditWorkout] = useState<TrainingWorkout | null>(null);
  const [showLinker, setShowLinker] = useState(false);

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
    if (!confirm('Delete this workout?')) return;
    await deleteWorkout(workoutId);
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
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!plan) return null;

  const completedCount = workouts.filter((w) => w.status === 'completed').length;
  const progressPct =
    workouts.length > 0 ? Math.round((completedCount / workouts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/training-plans" className="text-sm text-primary hover:underline">
          &larr; Training Plans
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{plan.title}</h1>
            <p className="text-sm text-gray-500">
              {plan.start_date} — {plan.end_date} • FTP {plan.ftp_baseline}W
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <span>
                {completedCount}/{workouts.length} workouts
              </span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span>{progressPct}%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => reschedule()}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Reschedule Missed
            </button>
            <Link
              to={`/training-plans/${plan.id}/retrospective`}
              className="rounded-lg border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary-50"
            >
              Retrospective
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar — 2/3 width */}
        <div className="lg:col-span-2">
          {workoutsLoading ? (
            <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <WorkoutCalendar
              workouts={workouts}
              onSelectWorkout={setSelectedWorkout}
              onSelectSlot={handleSelectSlot}
            />
          )}
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-4">
          {/* Form gauge */}
          {!recLoading && recommendation && (
            <FormGauge
              tsb={recommendation.metrics.tsb}
              ctl={recommendation.metrics.ctl}
              atl={recommendation.metrics.atl}
            />
          )}

          {/* Recommendation */}
          {!recLoading && recommendation && (
            <RecommendationCard
              recommendation={recommendation}
              onAddToPlan={handleAddRecommendation}
            />
          )}

          {recLoading && <div className="h-48 animate-pulse rounded-xl bg-gray-100" />}
        </div>
      </div>

      {/* Training Load Chart */}
      {loadHistoryLoading ? (
        <div className="h-56 animate-pulse rounded-xl bg-gray-100" />
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
          onDelete={handleDeleteWorkout}
          onLinkActivity={handleLinkActivity}
        />
      )}

      {/* Activity linker */}
      {selectedWorkout && showLinker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-base font-semibold text-gray-900">Link Strava Activity</h2>
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
            <button
              onClick={() => setShowLinker(false)}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
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

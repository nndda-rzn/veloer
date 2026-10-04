import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MaintenanceLogList,
  MaintenanceForm,
  ScheduleList,
  ScheduleForm,
  useMaintenanceLogs,
  useSchedules,
} from '@/features/maintenance';
import type {
  MaintenanceLog,
  MaintenanceLogFormData,
  MaintenanceSchedule,
  ScheduleFormData,
} from '@/features/maintenance';
import { scheduleProgress } from '@/features/maintenance/lib/schedule-status';
import { nextDueFrom } from '@/features/maintenance/lib/schedule-due';
import { useBikes, componentApi } from '@/features/inventory';
import type { Bike, Component } from '@/features/inventory';
import { PageHeader, EmptyState, ConfirmDialog, Skeleton } from '@/shared/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { selectClass } from '@/shared/lib/form-styles';
import { formatDate, formatIDR } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Wrench, Plus, CheckCircle2 } from 'lucide-react';

export function MaintenancePage() {
  const { bikes, loading: bikesLoading } = useBikes();
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [components, setComponents] = useState<Component[]>([]);

  const [showLogForm, setShowLogForm] = useState(false);
  const [logPrefill, setLogPrefill] = useState<{
    componentId: string | null;
    description: string;
    type: MaintenanceLogFormData['type'];
  } | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null);
  const [deletingLog, setDeletingLog] = useState<MaintenanceLog | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<MaintenanceSchedule | null>(null);

  const {
    logs,
    loading,
    error,
    createLog,
    deleteLog,
    refetch: refetchLogs,
  } = useMaintenanceLogs(selectedBike?.id ?? null);
  const {
    schedules,
    loading: schedulesLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refetch: refetchSchedules,
  } = useSchedules(selectedBike?.id ?? null);

  // Auto-select first bike
  useEffect(() => {
    if (!selectedBike && bikes.length > 0) setSelectedBike(bikes[0]);
  }, [bikes, selectedBike]);

  // Load the selected bike's components for the pickers
  useEffect(() => {
    if (!selectedBike) {
      setComponents([]);
      return;
    }
    let active = true;
    componentApi
      .listByBike(selectedBike.id)
      .then((rows) => {
        if (active) setComponents(rows.filter((c) => c.status !== 'replaced'));
      })
      .catch(() => {
        if (active) setComponents([]);
      });
    return () => {
      active = false;
    };
  }, [selectedBike]);

  const componentOptions = useMemo(
    () => components.map((c) => ({ id: c.id, name: c.name })),
    [components],
  );

  /** Reminders that need doing now, soonest first. */
  const attention = useMemo(() => {
    if (!selectedBike) return [];
    return schedules
      .map((s) => ({ schedule: s, progress: scheduleProgress(s, selectedBike.current_km) }))
      .filter((r) => ['soon', 'due', 'overdue'].includes(r.progress.band))
      .sort(
        (a, b) =>
          (a.progress.remainingKm ?? a.progress.remainingDays ?? 0) -
          (b.progress.remainingKm ?? b.progress.remainingDays ?? 0),
      );
  }, [schedules, selectedBike]);

  const metrics = useMemo(() => {
    const year = new Date().getFullYear();
    const thisYear = logs.filter((log) => log.service_date.slice(0, 4) === String(year));
    const spend = thisYear.reduce((sum, log) => sum + (log.cost ?? 0), 0);

    const nextDue = attention[0];
    return {
      nextDue: nextDue
        ? nextDue.schedule.next_due_km != null
          ? `${nextDue.schedule.next_due_km} km`
          : nextDue.schedule.next_due_date
            ? formatDate(nextDue.schedule.next_due_date)
            : 'Scheduled'
        : 'Nothing scheduled',
      serviceCount: thisYear.length,
      spend,
    };
  }, [logs, attention]);

  const openLogForm = useCallback((componentId: string | null = null, description = '') => {
    setLogPrefill({ componentId, description, type: 'routine' });
    setShowLogForm(true);
  }, []);

  const handleLogSubmit = async (data: MaintenanceLogFormData) => {
    await createLog(data);
    // A log that names its next service should produce the reminder, otherwise
    // those two fields mean nothing.
    if (data.next_service_km != null || data.next_service_date != null) {
      await createSchedule({
        bike_id: data.bike_id,
        component_id: data.component_id ?? null,
        task_name: data.description,
        next_due_km: data.next_service_km ?? null,
        next_due_date: data.next_service_date ?? null,
        last_performed_km: data.service_km,
        last_performed_date: data.service_date,
      });
    }
    setShowLogForm(false);
    setLogPrefill(null);
    refetchLogs();
  };

  const handleScheduleSubmit = async (data: ScheduleFormData) => {
    if (editingSchedule) await updateSchedule(editingSchedule.id, data);
    else await createSchedule(data);
    setShowScheduleForm(false);
    setEditingSchedule(null);
    refetchSchedules();
  };

  const handleMarkDone = async (schedule: MaintenanceSchedule) => {
    if (!selectedBike) return;
    const today = new Date().toISOString().slice(0, 10);
    const next = nextDueFrom(schedule, selectedBike.current_km, today);
    await updateSchedule(schedule.id, {
      last_performed_km: selectedBike.current_km,
      last_performed_date: today,
      next_due_km: next.next_due_km,
      next_due_date: next.next_due_date,
    });
    refetchSchedules();
  };

  if (bikesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="What needs doing, and the service record behind it"
        action={
          selectedBike ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowScheduleForm(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add reminder
              </Button>
              <Button onClick={() => openLogForm()}>
                <Wrench className="h-4 w-4" aria-hidden="true" />
                Log service
              </Button>
            </div>
          ) : undefined
        }
      />

      {bikes.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No bikes yet"
          description="Add a bike first in the Bikes & Gear page to start logging maintenance."
        />
      ) : (
        <>
          {/* Bike selector */}
          <div className="max-w-xs">
            <label
              htmlFor="bikeSelect"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Bike
            </label>
            <select
              id="bikeSelect"
              value={selectedBike?.id ?? ''}
              onChange={(e) => {
                const bike = bikes.find((b) => b.id === e.target.value);
                setSelectedBike(bike ?? null);
              }}
              className={selectClass}
            >
              {bikes.map((bike) => (
                <option key={bike.id} value={bike.id}>
                  {bike.name} ({bike.current_km.toFixed(0)} km)
                </option>
              ))}
            </select>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          {/* 1. What needs doing */}
          <section className="space-y-3">
            <h2 className="text-h3 font-semibold text-foreground">Needs attention</h2>
            {attention.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                Nothing due. Every reminder is on track.
              </p>
            ) : (
              <ScheduleList
                schedules={attention.map((a) => a.schedule)}
                currentKm={selectedBike?.current_km ?? 0}
                loading={schedulesLoading}
                onEdit={(s) => {
                  setEditingSchedule(s);
                  setShowScheduleForm(true);
                }}
                onDelete={setDeletingSchedule}
                onMarkDone={handleMarkDone}
                onLogService={(s) => openLogForm(s.component_id, s.task_name)}
              />
            )}
          </section>

          {/* 2. Forward metrics */}
          {selectedBike && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Next due
                  </p>
                  <p className="mt-1.5 text-2xl font-semibold tabular-nums text-foreground">
                    {metrics.nextDue}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Services this year
                  </p>
                  <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-foreground">
                    {metrics.serviceCount}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Spend this year
                  </p>
                  <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-foreground">
                    {formatIDR(metrics.spend)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 3. All reminders (not only the due ones) */}
          <section className="space-y-3">
            <h2 className="text-h3 font-semibold text-foreground">All reminders</h2>
            {schedules.length > attention.length ? (
              <ScheduleList
                schedules={schedules.filter((s) => !attention.some((a) => a.schedule.id === s.id))}
                currentKm={selectedBike?.current_km ?? 0}
                loading={schedulesLoading}
                onEdit={(s) => {
                  setEditingSchedule(s);
                  setShowScheduleForm(true);
                }}
                onDelete={setDeletingSchedule}
                onMarkDone={handleMarkDone}
                onLogService={(s) => openLogForm(s.component_id, s.task_name)}
              />
            ) : schedules.length === 0 && !schedulesLoading ? (
              <EmptyState
                icon={Wrench}
                title="No reminders yet"
                description="Add a reminder so a task comes back when it is next due."
                action={{ label: 'Add reminder', onClick: () => setShowScheduleForm(true) }}
              />
            ) : null}
          </section>

          {/* 4. Service history */}
          <section className="space-y-3">
            <h2 className="text-h3 font-semibold text-foreground">Service history</h2>
            <MaintenanceLogList logs={logs} loading={loading} onDelete={setDeletingLog} />
          </section>
        </>
      )}

      {showLogForm && logPrefill && selectedBike && (
        <MaintenanceForm
          bikeId={selectedBike.id}
          currentKm={selectedBike.current_km}
          defaultComponentId={logPrefill.componentId}
          components={componentOptions}
          defaultDescription={logPrefill.description}
          defaultType={logPrefill.type}
          onSubmit={handleLogSubmit}
          onCancel={() => {
            setShowLogForm(false);
            setLogPrefill(null);
          }}
        />
      )}

      {showScheduleForm && selectedBike && (
        <ScheduleForm
          bikeId={selectedBike.id}
          components={componentOptions}
          schedule={editingSchedule ?? undefined}
          onSubmit={handleScheduleSubmit}
          onCancel={() => {
            setShowScheduleForm(false);
            setEditingSchedule(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deletingLog !== null}
        onOpenChange={(open) => !open && setDeletingLog(null)}
        title="Delete log"
        description="This removes the entry from the service history, and its cost from Finance. This cannot be undone."
        onConfirm={async () => {
          if (deletingLog) {
            await deleteLog(deletingLog.id);
            setDeletingLog(null);
          }
        }}
      />

      <ConfirmDialog
        open={deletingSchedule !== null}
        onOpenChange={(open) => !open && setDeletingSchedule(null)}
        title="Delete reminder"
        description={
          deletingSchedule
            ? `Delete “${deletingSchedule.task_name}”? The history stays, only the reminder goes.`
            : ''
        }
        onConfirm={async () => {
          if (deletingSchedule) {
            await deleteSchedule(deletingSchedule.id);
            setDeletingSchedule(null);
          }
        }}
      />
    </div>
  );
}

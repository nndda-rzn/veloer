import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BikeHero,
  ComponentCard,
  CATEGORY_LABELS,
  ComponentForm,
  BikeForm,
  useBikeDetail,
  useBikeActivities,
  sortByWear,
  summarizeWear,
  bikeApi,
  componentApi,
} from '@/features/inventory';
import type { Component, ComponentFormData, BikeFormData } from '@/features/inventory';
import { MaintenanceForm, useMaintenanceLogs, MaintenanceLogList } from '@/features/maintenance';
import type { MaintenanceLog, MaintenanceLogFormData } from '@/features/maintenance';
import { useProfile } from '@/features/settings';
import { weeklyKmRate, projectWear } from '@/features/inventory/lib/wear-projection';
import { remainingKm } from '@/features/inventory';
import { EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wrench } from 'lucide-react';

type SortMode = 'category' | 'wear';

export function BikeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { bike, components, loading, error, refetch, refetchComponents, replaceComponent } =
    useBikeDetail(id);
  const { logs, loading: logsLoading, createLog, deleteLog } = useMaintenanceLogs(id ?? null);
  const { activities } = useBikeActivities(id);
  const { profile, save: saveProfile } = useProfile();

  const [showBikeForm, setShowBikeForm] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<Component | null>(null);
  const [replacingComponent, setReplacingComponent] = useState<Component | null>(null);
  const [statusComponent, setStatusComponent] = useState<{
    component: Component;
    status: Component['status'];
  } | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('category');

  const [showLogForm, setShowLogForm] = useState(false);
  const [logPrefill, setLogPrefill] = useState<{
    componentId: string | null;
    description: string;
    type: MaintenanceLogFormData['type'];
  } | null>(null);
  const [deletingLog, setDeletingLog] = useState<MaintenanceLog | null>(null);

  const activeComponents = useMemo(
    () => components.filter((c) => c.status !== 'replaced'),
    [components],
  );
  const wearSummary = useMemo(() => summarizeWear(components), [components]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<Component['category'], Component[]>();
    for (const c of components) {
      const list = groups.get(c.category) ?? [];
      list.push(c);
      groups.set(c.category, list);
    }
    return [...groups.entries()].map(([category, items]) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: sortByWear(items),
    }));
  }, [components]);

  const wornFirst = useMemo(() => sortByWear(components), [components]);

  const rateKmPerWeek = useMemo(() => weeklyKmRate(activities, 4), [activities]);

  const serviceCount = logs.length;
  const serviceCost = useMemo(() => logs.reduce((sum, log) => sum + (log.cost ?? 0), 0), [logs]);

  const projectionFor = (component: Component) => {
    const remaining = remainingKm(
      component.current_km,
      component.install_km,
      component.expected_lifespan_km,
    );
    if (remaining == null) return null;
    return projectWear(remaining, rateKmPerWeek);
  };

  const isDefault = profile?.default_bike_id === bike?.id;
  const handleSetDefault = async () => {
    if (!bike) return;
    await saveProfile({ default_bike_id: bike.id });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-secondary" />
        <div className="h-56 animate-pulse rounded-xl bg-secondary" />
        <div className="h-40 animate-pulse rounded-xl bg-secondary" />
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="space-y-6">
        <Alert variant="error">{error ?? 'Bike not found.'}</Alert>
      </div>
    );
  }

  const handleComponentSubmit = async (data: ComponentFormData) => {
    if (editingComponent) await componentApi.update(editingComponent.id, data);
    else await componentApi.create(data);
    setShowComponentForm(false);
    setEditingComponent(null);
    refetchComponents();
  };

  const handleDeleteComponent = async () => {
    if (!deletingComponent) return;
    await componentApi.delete(deletingComponent.id);
    setDeletingComponent(null);
    refetchComponents();
  };

  const handleReplace = async () => {
    if (!replacingComponent) return;
    await replaceComponent(replacingComponent.id);
    setReplacingComponent(null);
  };

  const handleSetStatus = async () => {
    if (!statusComponent) return;
    await componentApi.update(statusComponent.component.id, { status: statusComponent.status });
    setStatusComponent(null);
    refetchComponents();
  };

  const handleBikeSubmit = async (data: BikeFormData) => {
    await bikeApi.update(bike.id, data);
    setShowBikeForm(false);
    refetch();
  };

  const handleLogSubmit = async (data: MaintenanceLogFormData) => {
    await createLog(data);
    setShowLogForm(false);
    setLogPrefill(null);
  };

  const openLogForm = (component?: Component) => {
    setLogPrefill(
      component
        ? { componentId: component.id, description: `${component.name} service`, type: 'routine' }
        : { componentId: null, description: '', type: 'routine' },
    );
    setShowLogForm(true);
  };

  const renderComponentList = (items: Component[]) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((component) => (
        <ComponentCard
          key={component.id}
          component={component}
          projection={projectionFor(component)}
          onEdit={(c) => {
            setEditingComponent(c);
            setShowComponentForm(true);
          }}
          onDelete={setDeletingComponent}
          onReplace={setReplacingComponent}
          onSetStatus={(c, status) => setStatusComponent({ component: c, status })}
          onLogService={openLogForm}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <BikeHero
        bike={bike}
        componentCount={activeComponents.length}
        alertCount={
          (bike.maintenance_alert_count ?? 0) || wearSummary.overdue + wearSummary.dueSoon
        }
        isDefault={isDefault}
        serviceCount={serviceCount}
        serviceCost={serviceCost}
        onEdit={() => setShowBikeForm(true)}
        onSetDefault={handleSetDefault}
      />

      <Tabs defaultValue="components">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList variant="line">
            <TabsTrigger value="components">Components ({components.length})</TabsTrigger>
            <TabsTrigger value="history">History ({logs.length})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => openLogForm()}>
              <Wrench className="h-4 w-4" aria-hidden="true" />
              Log service
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingComponent(null);
                setShowComponentForm(true);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add component
            </Button>
          </div>
        </div>

        <TabsContent value="components" className="mt-4 space-y-4">
          {(wearSummary.overdue > 0 || wearSummary.dueSoon > 0) && (
            <Alert variant={wearSummary.overdue > 0 ? 'error' : 'warning'}>
              {wearSummary.overdue > 0 && (
                <span>
                  {wearSummary.overdue} component{wearSummary.overdue !== 1 ? 's' : ''} past
                  expected lifespan.{' '}
                </span>
              )}
              {wearSummary.dueSoon > 0 && (
                <span>{wearSummary.dueSoon} due for replacement soon.</span>
              )}
            </Alert>
          )}

          {components.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No components yet"
              description="Add components to track wear and plan replacements."
              action={{
                label: 'Add component',
                onClick: () => {
                  setEditingComponent(null);
                  setShowComponentForm(true);
                },
              }}
            />
          ) : (
            <>
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant={sortMode === 'category' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortMode('category')}
                >
                  By category
                </Button>
                <Button
                  variant={sortMode === 'wear' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortMode('wear')}
                >
                  By wear
                </Button>
              </div>

              {sortMode === 'category' ? (
                <div className="space-y-6">
                  {groupedByCategory.map((group) => (
                    <section key={group.category}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                      </h3>
                      {renderComponentList(group.items)}
                    </section>
                  ))}
                </div>
              ) : (
                renderComponentList(wornFirst)
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {!logsLoading && logs.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No service history"
              description="Log maintenance work to build this bike's service record."
              action={{ label: 'Log service', onClick: () => openLogForm() }}
            />
          ) : (
            <MaintenanceLogList logs={logs} loading={logsLoading} onDelete={setDeletingLog} />
          )}
        </TabsContent>
      </Tabs>

      {showBikeForm && (
        <BikeForm bike={bike} onSubmit={handleBikeSubmit} onCancel={() => setShowBikeForm(false)} />
      )}

      {showComponentForm && (
        <ComponentForm
          bikeId={bike.id}
          component={editingComponent}
          onSubmit={handleComponentSubmit}
          onCancel={() => {
            setShowComponentForm(false);
            setEditingComponent(null);
          }}
        />
      )}

      {showLogForm && logPrefill && (
        <MaintenanceForm
          bikeId={bike.id}
          currentKm={bike.current_km}
          defaultComponentId={logPrefill.componentId}
          defaultDescription={logPrefill.description}
          defaultType={logPrefill.type}
          onSubmit={handleLogSubmit}
          onCancel={() => {
            setShowLogForm(false);
            setLogPrefill(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deletingComponent !== null}
        onOpenChange={(open) => !open && setDeletingComponent(null)}
        title="Delete component"
        description={`Delete “${deletingComponent?.name ?? ''}”? This cannot be undone.`}
        onConfirm={handleDeleteComponent}
      />

      <ConfirmDialog
        open={replacingComponent !== null}
        onOpenChange={(open) => !open && setReplacingComponent(null)}
        title="Replace component"
        description={`Mark “${replacingComponent?.name ?? ''}” as replaced and install a fresh one with the same spec?`}
        confirmLabel="Replace"
        variant="default"
        onConfirm={handleReplace}
      />

      <ConfirmDialog
        open={statusComponent !== null}
        onOpenChange={(open) => !open && setStatusComponent(null)}
        title="Change component status"
        description={
          statusComponent
            ? `Set “${statusComponent.component.name}” to ${statusComponent.status}.`
            : ''
        }
        confirmLabel={statusComponent ? `Mark ${statusComponent.status}` : 'Confirm'}
        variant={statusComponent?.status === 'active' ? 'default' : 'danger'}
        onConfirm={handleSetStatus}
      />

      <ConfirmDialog
        open={deletingLog !== null}
        onOpenChange={(open) => !open && setDeletingLog(null)}
        title="Delete maintenance log"
        description="This removes the entry from the service history. This cannot be undone."
        onConfirm={async () => {
          if (deletingLog) {
            await deleteLog(deletingLog.id);
            setDeletingLog(null);
          }
        }}
      />
    </div>
  );
}

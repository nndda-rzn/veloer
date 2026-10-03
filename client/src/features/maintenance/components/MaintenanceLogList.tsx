import type { MaintenanceLog } from '../types/maintenance';
import { formatDate, formatIDR } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/shared/components/ui';
import { Wrench } from 'lucide-react';

interface MaintenanceLogListProps {
  logs: MaintenanceLog[];
  loading: boolean;
  onDelete: (log: MaintenanceLog) => void;
}

const typeLabels: Record<MaintenanceLog['type'], string> = {
  routine: 'Routine',
  repair: 'Repair',
  replacement: 'Replacement',
  cleaning: 'Cleaning',
  tuning: 'Tuning',
};

const typeVariants: Record<
  MaintenanceLog['type'],
  'info' | 'warning' | 'danger' | 'success' | 'neutral'
> = {
  routine: 'info',
  repair: 'warning',
  replacement: 'danger',
  cleaning: 'success',
  tuning: 'neutral',
};

export function MaintenanceLogList({ logs, loading, onDelete }: MaintenanceLogListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No maintenance logs yet"
        description="Log maintenance work to keep your bike in top shape."
      />
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <Card key={log.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={typeVariants[log.type]}>{typeLabels[log.type]}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(log.service_date)}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {log.service_km.toFixed(0)} km
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground">{log.description}</p>
              <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {log.cost != null && (
                  <span className="tabular-nums">Cost: {formatIDR(log.cost)}</span>
                )}
                <span>By: {log.performed_by === 'self' ? 'Self' : (log.shop_name ?? 'Shop')}</span>
                {log.next_service_date && <span>Next: {formatDate(log.next_service_date)}</span>}
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => onDelete(log)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

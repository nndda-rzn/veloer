import { MoreHorizontal, Trash2, Wrench } from 'lucide-react';
import type { MaintenanceLog } from '../types/maintenance';
import { formatDate, formatIDR } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/shared/components/ui';
import {
  MAINTENANCE_TYPE_DOT,
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_TYPE_VARIANTS,
  formatMonthLabel,
  groupLogsByMonth,
} from '../lib/maintenance-style';

interface MaintenanceLogListProps {
  logs: MaintenanceLog[];
  loading: boolean;
  onDelete: (log: MaintenanceLog) => void;
}

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

  const groups = groupLogsByMonth(logs);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.month}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {formatMonthLabel(group.month)}
          </h3>

          <ol className="relative space-y-4 border-l border-border pl-6">
            {group.logs.map((log) => (
              <li key={log.id} className="relative">
                {/* Timeline dot */}
                <span
                  className={`absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-card ${MAINTENANCE_TYPE_DOT[log.type]}`}
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={MAINTENANCE_TYPE_VARIANTS[log.type]}>
                        {MAINTENANCE_TYPE_LABELS[log.type]}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(log.service_date)}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        at {log.service_km.toFixed(0)} km
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-foreground">{log.description}</p>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      {log.cost != null && (
                        <span className="tabular-nums">Cost: {formatIDR(log.cost)}</span>
                      )}
                      <span>
                        By: {log.performed_by === 'self' ? 'Self' : (log.shop_name ?? 'Shop')}
                      </span>
                      {log.next_service_date && (
                        <span>Next: {formatDate(log.next_service_date)}</span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${log.description}`}
                        />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(log)}>
                          <Trash2 aria-hidden="true" />
                          Delete log
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

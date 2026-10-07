import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSync } from '../hooks/useSync';
import type { SyncResult } from '../types/activity';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const TICK_MS = 30_000;

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function formatRelative(timestamp: string | null, now: number): string | null {
  if (!timestamp) return null;
  const diffMs = now - new Date(timestamp).getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return 'just now';
  if (abs < 3600) return relativeFormatter.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86_400) return relativeFormatter.format(Math.round(diffSeconds / 3600), 'hour');
  return relativeFormatter.format(Math.round(diffSeconds / 86_400), 'day');
}

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function LastSyncIndicator() {
  const { sync, isSyncing, lastSyncAt, lastResult } = useSync();
  const now = useNow(TICK_MS);
  const [open, setOpen] = useState(false);

  const relative = useMemo(() => formatRelative(lastSyncAt, now), [lastSyncAt, now]);
  const stale = lastSyncAt !== null && now - new Date(lastSyncAt).getTime() > STALE_THRESHOLD_MS;

  const handleSync = () => {
    setOpen(false);
    void sync().catch(() => undefined);
  };

  if (isSyncing) {
    return (
      <Button variant="ghost" size="sm" disabled aria-label="Syncing activities">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Syncing…
      </Button>
    );
  }

  if (!relative) {
    return (
      <Button variant="outline" size="sm" onClick={() => void sync().catch(() => undefined)}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Sync now
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" />}
      >
        <CheckCircle2
          className={cn('h-4 w-4', stale ? 'text-amber-500' : 'text-success')}
          aria-hidden="true"
        />
        Synced {relative}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSync}>
            <RefreshCw aria-hidden="true" />
            Sync now
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {lastResult && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Last sync</DropdownMenuLabel>
              <SyncResultDetails result={lastResult} />
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SyncResultDetails({ result }: { result: SyncResult }) {
  const rows = [
    { label: 'New activities', value: result.synced },
    { label: 'Total on record', value: result.total },
  ];
  return (
    <div className="px-2 py-1 text-sm text-muted-foreground">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-0.5">
          <span>{row.label}</span>
          <span className="font-medium tabular-nums text-foreground">{row.value}</span>
        </div>
      ))}
      {result.workoutsLinked > 0 && (
        <div className="flex items-center justify-between py-0.5">
          <span>Workouts linked</span>
          <span className="font-medium tabular-nums text-foreground">{result.workoutsLinked}</span>
        </div>
      )}
    </div>
  );
}

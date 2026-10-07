import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { activityApi } from '../api/activity.api';
import type { SyncResult } from '../types/activity';
import { useToast } from '@/shared/components/feedback/Toaster';
import { useAuthContext } from '@/features/auth/context/AuthContext';
import {
  SYNC_STORAGE_KEYS,
  clearSyncStorage,
  readSyncStorage,
  writeSyncStorage,
} from '@/shared/lib/sync-storage';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: string | null;
  lastResult: SyncResult | null;
  syncRevision: number;
}

export interface UseSyncReturn extends SyncStatus {
  sync: () => Promise<SyncResult>;
  resetStatus: () => void;
}

const initialStatus: SyncStatus = {
  isSyncing: false,
  lastSyncAt: null,
  lastResult: null,
  syncRevision: 0,
};

/**
 * Refresh threshold for the background auto-sync. A manual sync always works;
 * this only decides whether opening the app should pull Strava in the
 * background when the last sync is stale.
 */
const AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

const SyncContext = createContext<UseSyncReturn | null>(null);

function readInitialStatus(): SyncStatus {
  if (typeof window === 'undefined') return initialStatus;
  return {
    isSyncing: false,
    lastSyncAt: window.localStorage.getItem(SYNC_STORAGE_KEYS.lastSyncAt),
    lastResult: readSyncStorage<SyncResult>(SYNC_STORAGE_KEYS.lastResult),
    syncRevision: 0,
  };
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { isAuthenticated } = useAuthContext();
  const [status, setStatus] = useState<SyncStatus>(() => readInitialStatus());
  const revisionRef = useRef(status.syncRevision);
  const inFlightRef = useRef<Promise<SyncResult> | null>(null);

  const mutation = useMutation<SyncResult, Error>({
    mutationKey: ['sync', 'strava'],
    mutationFn: () => activityApi.sync(),
    onSuccess: (result) => {
      const timestamp = new Date().toISOString();
      revisionRef.current += 1;
      const nextStatus: SyncStatus = {
        isSyncing: false,
        lastSyncAt: timestamp,
        lastResult: result,
        syncRevision: revisionRef.current,
      };
      setStatus(nextStatus);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SYNC_STORAGE_KEYS.lastSyncAt, timestamp);
        writeSyncStorage(SYNC_STORAGE_KEYS.lastResult, result);
      }
      void invalidateConsumerQueries(queryClient);
      pushToast('Strava sync complete', {
        level: 'success',
        description: formatResultDescription(result),
      });
    },
    onError: (error) => {
      setStatus((current) => ({ ...current, isSyncing: false }));
      pushToast('Sync failed', {
        level: isRateLimitError(error) ? 'warning' : 'error',
        description: errorMessage(error),
        action: { label: 'Try again', onClick: () => void triggerSync() },
      });
    },
  });

  const triggerSync = useCallback((): Promise<SyncResult> => {
    if (inFlightRef.current) return inFlightRef.current;
    const promise = mutation.mutateAsync().finally(() => {
      inFlightRef.current = null;
    });
    inFlightRef.current = promise;
    return promise;
  }, [mutation]);

  // Background auto-sync: on mount, pull Strava in when the last sync is stale.
  // The in-flight guard in `triggerSync` keeps this from racing a manual sync.
  const autoSyncDoneRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || autoSyncDoneRef.current) return;
    autoSyncDoneRef.current = true;
    const lastSyncAt = window.localStorage.getItem(SYNC_STORAGE_KEYS.lastSyncAt);
    const lastMs = lastSyncAt ? new Date(lastSyncAt).getTime() : 0;
    if (Date.now() - lastMs < AUTO_SYNC_INTERVAL_MS) return;
    void triggerSync();
  }, [isAuthenticated, triggerSync]);

  // Reset in-memory state when AuthContext clears the storage (same-tab via custom event).
  useEffect(() => {
    const onClear = () => {
      revisionRef.current = 0;
      inFlightRef.current = null;
      setStatus(initialStatus);
    };
    window.addEventListener('veloer:sync-status-cleared', onClear);
    return () => window.removeEventListener('veloer:sync-status-cleared', onClear);
  }, []);

  const resetStatus = useCallback(() => {
    revisionRef.current = 0;
    inFlightRef.current = null;
    setStatus(initialStatus);
    clearSyncStorage();
  }, []);

  const value: UseSyncReturn = {
    ...status,
    isSyncing: mutation.isPending,
    sync: triggerSync,
    resetStatus,
  };

  return createElement(SyncContext.Provider, { value }, children);
}

export function useSync(): UseSyncReturn {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}

async function invalidateConsumerQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['activities'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['goals'] }),
  ]);
}

function formatResultDescription(result: SyncResult): string {
  const parts = [
    `${result.synced} new`,
    `${result.total} total`,
    result.workoutsLinked
      ? `${result.workoutsLinked} workout${result.workoutsLinked === 1 ? '' : 's'} linked`
      : null,
  ].filter(Boolean);
  return parts.join(' · ');
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unexpected error talking to Strava. Please try again.';
}

function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('429') || message.includes('rate limit');
}

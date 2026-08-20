export const SYNC_STORAGE_KEYS = {
  lastSyncAt: 'veloer:last-sync-at',
  lastResult: 'veloer:last-sync-result',
} as const;

export function readSyncStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeSyncStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export const SYNC_CLEAR_EVENT = 'veloer:sync-status-cleared';

export function clearSyncStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SYNC_STORAGE_KEYS.lastSyncAt);
    window.localStorage.removeItem(SYNC_STORAGE_KEYS.lastResult);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(SYNC_CLEAR_EVENT));
}

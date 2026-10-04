/**
 * Formatting preferences, read by the shared formatters.
 *
 * Deliberately a module-level store rather than a React hook: the formatters
 * (formatDistance, formatDate, ...) are called from 80+ places, and threading a
 * hook through every one of them would be a large, risky change for no gain.
 * This is the same approach established i18n libraries take (configure once,
 * read anywhere), and `PreferencesProvider` keeps it in sync with the profile.
 */
export type Units = 'metric' | 'imperial';

export interface FormatPreferences {
  units: Units;
  /** IANA timezone, e.g. 'Asia/Jakarta'. */
  timezone: string;
}

const DEFAULT_PREFERENCES: FormatPreferences = {
  units: 'metric',
  timezone: 'Asia/Jakarta',
};

let preferences: FormatPreferences = { ...DEFAULT_PREFERENCES };

/** Update the active preferences. Called by PreferencesProvider on profile load. */
export function configureFormatting(next: Partial<FormatPreferences>): void {
  preferences = { ...preferences, ...next };
}

export function getFormatting(): FormatPreferences {
  return preferences;
}

/** Reset to defaults (used in tests and on sign-out). */
export function resetFormatting(): void {
  preferences = { ...DEFAULT_PREFERENCES };
}

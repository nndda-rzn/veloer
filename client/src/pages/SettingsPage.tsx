import { useEffect, useMemo, useState } from 'react';
import { useProfile } from '@/features/settings';
import { useBikes } from '@/features/inventory';
import { useAuth } from '@/features/auth';
import type { ProfileFormData } from '@/features/settings';
import { settingsApi } from '@/features/settings';
import { powerZones, zoneRangeLabel } from '@/features/settings/lib/power-zones';
import {
  cityFromTimezone,
  detectTimezone,
  localTimeIn,
  zoneAbbreviation,
} from '@/features/settings/lib/timezones';
import { AvatarUpload } from '@/features/settings/components/AvatarUpload';
import { PageHeader } from '@/shared/components/ui';
import { Section } from '@/shared/components/ui/Section';
import { FormField } from '@/shared/components/ui/FormField';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { selectClass } from '@/shared/lib/form-styles';
import { cn } from '@/lib/utils';

/** Only the fields this page edits, so change detection stays honest. */
const EDITABLE: (keyof ProfileFormData)[] = [
  'display_name',
  'avatar_url',
  'preferred_units',
  'timezone',
  'default_bike_id',
  'ftp',
  'lthr',
];

export function SettingsPage() {
  const { profile, loading, error, saving, save } = useProfile();
  const { bikes } = useBikes();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({});
  const [baseline, setBaseline] = useState<ProfileFormData>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Seed the form from the profile once it arrives, and remember that state as
  // the baseline so "unsaved changes" means something.
  useEffect(() => {
    if (!profile) return;
    const initial: ProfileFormData = {
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      preferred_units: profile.preferred_units,
      default_bike_id: profile.default_bike_id,
      timezone: profile.timezone,
      ftp: profile.ftp,
      lthr: profile.lthr,
    };
    setFormData(initial);
    setBaseline(initial);
  }, [profile]);

  const isDirty = useMemo(
    () => EDITABLE.some((key) => (formData[key] ?? null) !== (baseline[key] ?? null)),
    [formData, baseline],
  );

  const detectedZone = useMemo(() => detectTimezone(), []);
  const timezone = formData.timezone ?? profile?.timezone ?? 'Asia/Jakarta';
  const ftp = typeof formData.ftp === 'number' ? formData.ftp : null;
  const zones = powerZones(ftp);
  const zonePreview = zones.length
    ? `${zoneRangeLabel(zones[1])} · ${zoneRangeLabel(zones[3])}`
    : null;

  const units = formData.preferred_units ?? 'metric';
  // Preview the chosen unit directly rather than calling formatDistance, which
  // reads the *saved* preference and would not reflect an unsaved change.
  const distancePreview = units === 'imperial' ? '142 km → 88.2 mi' : '142 km → 142.0 km';

  const handleSave = async () => {
    await save(formData);
    setBaseline(formData);
  };

  const handleReset = () => {
    setFormData(baseline);
    setAvatarError(null);
  };

  const handleAvatarUpload = async (file: File) => {
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      const { avatar_url } = await settingsApi.uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatar_url }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  /** Empty string from the uploader means "clear the previous message". */
  const handleAvatarError = (message: string) => setAvatarError(message || null);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <PageHeader title="Settings" description="Your account, preferences and training values" />

      {/* Account */}
      <Section title="Account">
        <FormField label="Photo" htmlFor="avatar">
          <AvatarUpload
            value={formData.avatar_url ?? null}
            name={formData.display_name ?? profile?.display_name ?? 'Veloer Rider'}
            uploading={uploadingAvatar}
            onChange={(url) => setFormData((prev) => ({ ...prev, avatar_url: url }))}
            onUpload={handleAvatarUpload}
            onError={handleAvatarError}
          />
        </FormField>
        {avatarError && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {avatarError}
          </p>
        )}

        <FormField label="Display name" htmlFor="display_name">
          <Input
            id="display_name"
            type="text"
            value={formData.display_name ?? ''}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            disabled={saving}
          />
        </FormField>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium text-foreground">Strava</p>
            <p className="text-xs text-muted-foreground">Athlete ID {user?.stravaId ?? '–'}</p>
          </div>
          <Badge variant="success">Connected</Badge>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <FormField
          label="Units"
          htmlFor="preferred_units"
          preview={<span className="tabular-nums">Example: {distancePreview}</span>}
        >
          <select
            id="preferred_units"
            value={units}
            onChange={(e) =>
              setFormData({
                ...formData,
                preferred_units: e.target.value as 'metric' | 'imperial',
              })
            }
            className={cn(selectClass, 'max-w-xs')}
            disabled={saving}
          >
            <option value="metric">Metric (km, m)</option>
            <option value="imperial">Imperial (mi, ft)</option>
          </select>
        </FormField>

        <FormField
          label="Timezone"
          htmlFor="timezone"
          hint={
            detectedZone === timezone
              ? 'Detected from your device.'
              : `Your device reports ${detectedZone ?? 'unknown'}.`
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-foreground">
              {cityFromTimezone(timezone)}
              <span className="text-muted-foreground">
                {' '}
                · {localTimeIn(timezone)} {zoneAbbreviation(timezone)}
              </span>
            </span>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className={cn(selectClass, 'max-w-xs')}
              disabled={saving}
            >
              {(detectedZone && detectedZone !== timezone ? [timezone, detectedZone] : [timezone])
                .concat([
                  'Asia/Jakarta',
                  'Asia/Singapore',
                  'Asia/Tokyo',
                  'Australia/Sydney',
                  'Europe/London',
                  'Europe/Amsterdam',
                  'America/New_York',
                  'America/Los_Angeles',
                  'UTC',
                ])
                .filter((z, i, arr) => arr.indexOf(z) === i)
                .map((zone) => (
                  <option key={zone} value={zone}>
                    {cityFromTimezone(zone)} ({zoneAbbreviation(zone)})
                  </option>
                ))}
            </select>
          </div>
        </FormField>

        <FormField
          label="Currency"
          htmlFor="currency"
          hint="Amounts are stored in IDR. Conversion is not applied, so this is fixed."
        >
          <Input id="currency" type="text" value="IDR – Indonesian Rupiah" readOnly disabled />
        </FormField>

        <FormField label="Default bike" htmlFor="default_bike_id">
          <select
            id="default_bike_id"
            value={formData.default_bike_id ?? ''}
            onChange={(e) => setFormData({ ...formData, default_bike_id: e.target.value || null })}
            className={cn(selectClass, 'max-w-xs')}
            disabled={saving}
          >
            <option value="">None</option>
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.name}
              </option>
            ))}
          </select>
        </FormField>
      </Section>

      {/* Training */}
      <Section title="Training">
        <FormField
          label="FTP"
          htmlFor="ftp"
          hint="Used for TSS and IF. Set it to your tested 20-minute power minus 5%."
          preview={zonePreview && <span className="tabular-nums">Zones: {zonePreview}</span>}
        >
          <div className="flex items-center gap-2">
            <Input
              id="ftp"
              type="number"
              min="0"
              className="max-w-[8rem]"
              value={formData.ftp ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, ftp: e.target.value ? Number(e.target.value) : null })
              }
              disabled={saving}
            />
            <span className="text-sm text-muted-foreground">watts</span>
          </div>
        </FormField>

        <FormField
          label="LTHR"
          htmlFor="lthr"
          optional
          hint="Fallback for hrTSS when a ride has heart rate but no power. Usually your average HR over a 30-minute all-out effort."
        >
          <div className="flex items-center gap-2">
            <Input
              id="lthr"
              type="number"
              min="0"
              max="250"
              className="max-w-[8rem]"
              value={formData.lthr ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, lthr: e.target.value ? Number(e.target.value) : null })
              }
              disabled={saving}
            />
            <span className="text-sm text-muted-foreground">bpm</span>
          </div>
        </FormField>
      </Section>

      {/* Sign out */}
      <Section
        title="Sign out"
        description="End your session. You can sign back in with Strava anytime."
      >
        <Button variant="outline" onClick={() => void logout()}>
          Sign out
        </Button>
      </Section>

      {/* Unsaved changes bar, shown only when there is something to save. */}
      {isDirty && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <p className="text-sm text-foreground">You have unsaved changes</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
              <Button onClick={() => void handleSave()} loading={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

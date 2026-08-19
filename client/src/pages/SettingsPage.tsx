import { useState, useEffect } from 'react';
import { useProfile } from '@/features/settings';
import { useBikes } from '@/features/inventory';
import { useAuth } from '@/features/auth';
import type { ProfileFormData } from '@/features/settings';
import { PageHeader } from '@/shared/components/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';

const selectClass =
  'flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

export function SettingsPage() {
  const { profile, loading, error, saving, save } = useProfile();
  const { bikes } = useBikes();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({});
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        preferred_units: profile.preferred_units,
        default_bike_id: profile.default_bike_id,
        timezone: profile.timezone,
        currency: profile.currency,
        ftp: profile.ftp,
        lthr: profile.lthr,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await save(formData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleSignOut = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
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
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      {/* Strava Connection */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Strava Connection</h2>
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Strava avatar"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {profile?.display_name ?? 'Connected'}
            </p>
            <p className="text-xs text-gray-500">Strava ID: {user?.stravaId ?? '—'}</p>
          </div>
          <div className="ml-auto">
            <Badge variant="success">Connected</Badge>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Profile</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              type="text"
              value={formData.display_name ?? ''}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              disabled={saving}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              type="text"
              value={formData.avatar_url ?? ''}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Preferences</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="preferred_units">Units</Label>
            <select
              id="preferred_units"
              value={formData.preferred_units ?? 'metric'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferred_units: e.target.value as 'metric' | 'imperial',
                })
              }
              className={selectClass}
              disabled={saving}
            >
              <option value="metric">Metric (km, m)</option>
              <option value="imperial">Imperial (mi, ft)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              type="text"
              value={formData.currency ?? 'IDR'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              disabled={saving}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              type="text"
              value={formData.timezone ?? 'Asia/Jakarta'}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              disabled={saving}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="default_bike_id">Default Bike</Label>
            <select
              id="default_bike_id"
              value={formData.default_bike_id ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, default_bike_id: e.target.value || null })
              }
              className={selectClass}
              disabled={saving}
            >
              <option value="">— None —</option>
              {bikes.map((bike) => (
                <option key={bike.id} value={bike.id}>
                  {bike.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Training Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Training Settings</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ftp">FTP (Functional Threshold Power)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ftp"
                type="number"
                min="0"
                className="w-32"
                value={formData.ftp ?? 250}
                onChange={(e) =>
                  setFormData({ ...formData, ftp: e.target.value ? Number(e.target.value) : null })
                }
                disabled={saving}
              />
              <span className="text-sm text-gray-500">Watts</span>
            </div>
            <p className="text-xs text-gray-400">
              Used for TSS and IF calculations. Default: 250W. Set to your tested 20-minute power
              minus 5%.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lthr">LTHR (Lactate Threshold Heart Rate)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="lthr"
                type="number"
                min="0"
                max="250"
                className="w-32"
                value={formData.lthr ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lthr: e.target.value ? Number(e.target.value) : null,
                  })
                }
                disabled={saving}
                placeholder="—"
              />
              <span className="text-sm text-gray-500">bpm</span>
            </div>
            <p className="text-xs text-gray-400">
              Optional. Used as fallback for hrTSS when no power meter data is available. Typically
              your average HR during a 30-min all-out effort.
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={() => void handleSave()} loading={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            {savedMsg && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold text-red-700">Danger Zone</h2>
        <p className="mb-4 text-xs text-gray-500">
          Signing out will end your session. You can sign back in with Strava anytime.
        </p>
        <Button
          variant="danger"
          onClick={() => void handleSignOut()}
          className="bg-transparent text-red-600 hover:bg-red-50 focus-visible:ring-red-400"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

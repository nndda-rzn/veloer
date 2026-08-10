import { useState, useEffect } from 'react';
import { useProfile } from '@/features/settings';
import { useBikes } from '@/features/inventory';
import { useAuth } from '@/features/auth';
import type { ProfileFormData } from '@/features/settings';

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
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await save(formData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Strava Connection */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Strava Connection</h3>
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img src={profile.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {profile?.display_name || 'Connected'}
            </p>
            <p className="text-xs text-gray-500">Strava ID: {user?.stravaId ?? '—'} • Connected</p>
          </div>
          <span className="ml-auto inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Connected
          </span>
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Profile</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="display_name" className="mb-1 block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              id="display_name"
              type="text"
              value={formData.display_name ?? ''}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="avatar_url" className="mb-1 block text-sm font-medium text-gray-700">
              Avatar URL
            </label>
            <input
              id="avatar_url"
              type="text"
              value={formData.avatar_url ?? ''}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="preferred_units"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Units
            </label>
            <select
              id="preferred_units"
              value={formData.preferred_units ?? 'metric'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferred_units: e.target.value as 'metric' | 'imperial',
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="metric">Metric (km, m)</option>
              <option value="imperial">Imperial (mi, ft)</option>
            </select>
          </div>
          <div>
            <label htmlFor="currency" className="mb-1 block text-sm font-medium text-gray-700">
              Currency
            </label>
            <input
              id="currency"
              type="text"
              value={formData.currency ?? 'IDR'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="timezone" className="mb-1 block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <input
              id="timezone"
              type="text"
              value={formData.timezone ?? 'Asia/Jakarta'}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="default_bike_id"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Default Bike
            </label>
            <select
              id="default_bike_id"
              value={formData.default_bike_id ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, default_bike_id: e.target.value || null })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Training Settings</h3>
        <div>
          <label htmlFor="ftp" className="mb-1 block text-sm font-medium text-gray-700">
            FTP (Functional Threshold Power)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ftp"
              type="number"
              min="0"
              value={formData.ftp ?? 250}
              onChange={(e) =>
                setFormData({ ...formData, ftp: e.target.value ? Number(e.target.value) : null })
              }
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-sm text-gray-500">Watts</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Used for Training Stress Score (TSS) and Intensity Factor (IF) calculations. Default:
            250W. Set to your tested 20-minute power minus 5%.
          </p>
        </div>
      </div>

      {/* Save + Logout */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {savedMsg && <span className="text-sm text-green-600">Saved successfully!</span>}
        <button
          onClick={() => void handleLogout()}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

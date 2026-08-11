import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    login();
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <img src="/logo.png" alt="Veloer" className="h-10 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track your rides, gear, and training in one place.
          </p>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#fc4c02] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e04302] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4c02] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
              )}
              {loading ? 'Connecting to Strava...' : 'Continue with Strava'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Sign in with your Strava account to sync your cycling activities
            </p>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400">Track. Maintain. Ride.</p>
          </div>
        </div>
      </div>

      {/* Right — hero image (hidden on mobile) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <img
          src="/road-bike.png"
          alt="Road bike"
          width={560}
          height={360}
          className="max-h-[360px] w-auto object-contain opacity-90 drop-shadow-2xl"
        />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-xl font-bold text-white">Your personal cycling companion</p>
          <p className="mt-1 text-sm text-primary-200">
            From training plans to gear maintenance — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

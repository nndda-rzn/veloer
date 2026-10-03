import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui/button';

export function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    login();
  };

  return (
    <div className="flex min-h-dvh">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <img src="/logo.png" alt="Veloer" width={160} height={40} className="h-10 w-auto" />
          </div>

          <h1 className="font-display text-3xl leading-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your rides, gear, and training in one place.
          </p>

          <div className="mt-8 space-y-4">
            <Button
              onClick={handleLogin}
              disabled={loading}
              loading={loading}
              className="w-full gap-3 bg-strava px-4 py-3 text-sm font-semibold text-white hover:bg-strava-dark focus-visible:ring-strava"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              {loading ? 'Connecting to Strava…' : 'Continue with Strava'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Sign in with your Strava account to sync your cycling activities
            </p>
          </div>

          <div className="mt-12 border-t border-border pt-6">
            <p className="text-xs tracking-wide text-muted-foreground">Track. Maintain. Ride.</p>
          </div>
        </div>
      </div>

      {/* Right: quiet brand panel (hidden on mobile) */}
      <div className="relative hidden overflow-hidden border-l border-border bg-primary-900 lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex flex-col items-center px-12 text-center">
          <img
            src="/road-bike.png"
            alt=""
            width={420}
            height={263}
            className="max-h-[280px] w-auto object-contain"
          />
          <p className="mt-10 font-display text-2xl text-white">Your personal cycling companion</p>
          <p className="mt-2 max-w-xs text-sm text-primary-200">
            From training plans to gear maintenance, all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

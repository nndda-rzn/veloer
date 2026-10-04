import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

/** Friendly copy for the error codes the server sends back on the login redirect. */
const ERROR_MESSAGES: Record<string, string> = {
  no_code: 'Sign-in was cancelled before it finished. Try again when you are ready.',
  auth_failed: 'We could not complete sign-in with Strava. Please try again.',
};

/**
 * Sign-in screen.
 *
 * Veloer has a single auth path (Strava OAuth), so this is deliberately one
 * focused column rather than a form with fields: there is exactly one action
 * to take. The right-hand brand panel was removed because a login screen for
 * an app is not a place for marketing copy.
 */
export function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const errorCode = searchParams.get('error');
  const errorMessage = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? 'Something went wrong signing in. Please try again.')
    : null;

  // login() navigates away to Strava. If the user comes back via the browser's
  // Back button (bfcache restore), this component re-appears with loading still
  // true, leaving the button stuck on "Connecting…". Reset it on pageshow.
  useEffect(() => {
    const reset = () => setLoading(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const handleLogin = () => {
    setLoading(true);
    login();
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12">
      <main className="w-full max-w-sm">
        {/* Logo */}
        <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 delay-0">
          <img src="/logo.webp" alt="Veloer" width={160} height={40} className="h-9 w-auto" />
        </div>

        <h1 className="mt-10 text-2xl font-semibold leading-tight tracking-tight text-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-200 delay-75">
          Sign in to Veloer
        </h1>

        <p className="mt-2 text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-200 delay-150">
          Sync your rides from Strava, then track your gear and training in one place.
        </p>

        {errorMessage && (
          <Alert
            variant="error"
            className="mt-6 animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            <AlertCircle aria-hidden="true" />
            <span>{errorMessage}</span>
          </Alert>
        )}

        <div className="mt-8 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 delay-200">
          <Button
            onClick={handleLogin}
            disabled={loading}
            loading={loading}
            className="h-11 w-full gap-3 bg-strava-dark px-4 text-sm font-semibold text-white transition-transform hover:bg-strava active:scale-[0.99] focus-visible:ring-strava"
          >
            {!loading && (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            )}
            {loading ? 'Connecting to Strava…' : 'Continue with Strava'}
          </Button>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-200 delay-300">
          Veloer only reads your ride data. No posting, no messages, and no changes to your Strava
          profile.
        </p>

        <div className="mt-10 border-t border-border pt-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 delay-500">
          <p className="text-xs tracking-wide text-muted-foreground">Track · Maintain · Ride</p>
        </div>
      </main>
    </div>
  );
}

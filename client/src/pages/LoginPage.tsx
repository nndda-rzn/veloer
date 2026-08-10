import { useAuth } from '@/features/auth';

export function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="text-4xl">🚴</span>
          <h1 className="mt-2 text-3xl font-bold text-primary">Veloer</h1>
          <p className="mt-1 text-sm text-gray-500">Your Personal Cycling ERP</p>
          <p className="mt-2 text-xs text-gray-400">Track. Maintain. Ride.</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={login}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#fc4c02] px-4 py-3 text-sm font-medium text-white hover:bg-[#e04302]"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Login with Strava
          </button>
          <p className="text-center text-xs text-gray-400">
            Sign in with your Strava account to sync your cycling activities
          </p>
        </div>
      </div>
    </div>
  );
}

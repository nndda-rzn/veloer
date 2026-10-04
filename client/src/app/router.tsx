import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/components/layout/Layout';
import { ProtectedRoute } from '@/features/auth';

/**
 * Route-level code splitting.
 * Every page becomes its own chunk, fetched on first navigation.
 * Heavy pages (charts, maps, calendar) stay out of the initial bundle.
 */
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ActivitiesPage = lazy(() =>
  import('@/pages/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage })),
);
const ActivityDetailPage = lazy(() =>
  import('@/pages/ActivityDetailPage').then((m) => ({ default: m.ActivityDetailPage })),
);
const InventoryPage = lazy(() =>
  import('@/pages/InventoryPage').then((m) => ({ default: m.InventoryPage })),
);
const BikeDetailPage = lazy(() =>
  import('@/pages/BikeDetailPage').then((m) => ({ default: m.BikeDetailPage })),
);
const MaintenancePage = lazy(() =>
  import('@/pages/MaintenancePage').then((m) => ({ default: m.MaintenancePage })),
);
const FinancePage = lazy(() =>
  import('@/pages/FinancePage').then((m) => ({ default: m.FinancePage })),
);
const GoalsPage = lazy(() => import('@/pages/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const EventsPage = lazy(() =>
  import('@/pages/EventsPage').then((m) => ({ default: m.EventsPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const TrainingPlansPage = lazy(() =>
  import('@/pages/TrainingPlansPage').then((m) => ({ default: m.TrainingPlansPage })),
);
const TrainingPlanDetailPage = lazy(() =>
  import('@/pages/TrainingPlanDetailPage').then((m) => ({ default: m.TrainingPlanDetailPage })),
);
const PlanRetrospectivePage = lazy(() =>
  import('@/pages/PlanRetrospectivePage').then((m) => ({ default: m.PlanRetrospectivePage })),
);
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));

/** Neutral full-page fallback shown while a route chunk loads. */
function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

/** Wrap a lazy page so React Suspense handles its pending chunk. */
function withSuspense(node: ReactNode): ReactNode {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'activities', element: withSuspense(<ActivitiesPage />) },
          { path: 'activities/:id', element: withSuspense(<ActivityDetailPage />) },
          { path: 'inventory', element: withSuspense(<InventoryPage />) },
          { path: 'inventory/:id', element: withSuspense(<BikeDetailPage />) },
          { path: 'maintenance', element: withSuspense(<MaintenancePage />) },
          { path: 'finance', element: withSuspense(<FinancePage />) },
          { path: 'goals', element: withSuspense(<GoalsPage />) },
          { path: 'events', element: withSuspense(<EventsPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          { path: 'training-plans', element: withSuspense(<TrainingPlansPage />) },
          { path: 'training-plans/:id', element: withSuspense(<TrainingPlanDetailPage />) },
          {
            path: 'training-plans/:id/retrospective',
            element: withSuspense(<PlanRetrospectivePage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/components/layout/Layout';
import { ProtectedRoute } from '@/features/auth';
import { DashboardPage } from '@/pages/DashboardPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { ActivityDetailPage } from '@/pages/ActivityDetailPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { FinancePage } from '@/pages/FinancePage';
import { GoalsPage } from '@/pages/GoalsPage';
import { EventsPage } from '@/pages/EventsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TrainingPlansPage } from '@/pages/TrainingPlansPage';
import { TrainingPlanDetailPage } from '@/pages/TrainingPlanDetailPage';
import { PlanRetrospectivePage } from '@/pages/PlanRetrospectivePage';
import { LoginPage } from '@/pages/LoginPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'activities', element: <ActivitiesPage /> },
          { path: 'activities/:id', element: <ActivityDetailPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'maintenance', element: <MaintenancePage /> },
          { path: 'finance', element: <FinancePage /> },
          { path: 'goals', element: <GoalsPage /> },
          { path: 'events', element: <EventsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'training-plans', element: <TrainingPlansPage /> },
          { path: 'training-plans/:id', element: <TrainingPlanDetailPage /> },
          { path: 'training-plans/:id/retrospective', element: <PlanRetrospectivePage /> },
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

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of your cycling activities and gear</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Total KM This Month</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Total Activities</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Active Bikes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Budget Used</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          Dashboard content will be implemented in Phase 1 Fase 9
        </p>
      </div>
    </div>
  );
}

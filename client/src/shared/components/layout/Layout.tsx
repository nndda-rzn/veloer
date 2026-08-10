import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { activityApi } from '@/features/activity';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/activities', label: 'Activities', icon: '🚴' },
  { to: '/inventory', label: 'Bikes & Gear', icon: '🚲' },
  { to: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { to: '/finance', label: 'Finance', icon: '💰' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/training-plans', label: 'Training Plans', icon: '📋' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Layout() {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await activityApi.sync();
      navigate('/activities');
    } catch {
      // Error handled by interceptor
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <span className="text-2xl">🚴</span>
          <span className="text-xl font-bold text-primary">Veloer</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <span className="text-lg">👤</span>
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-900 md:text-lg">
              Your Personal Cycling ERP
            </h1>
          </div>
          <button
            onClick={() => void handleSync()}
            disabled={syncing}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50 md:px-4 md:text-sm"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

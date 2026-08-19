import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { activityApi } from '@/features/activity';
import {
  LayoutDashboard,
  Bike,
  Package,
  Wrench,
  Wallet,
  Target,
  Calendar,
  ClipboardList,
  Settings,
  User,
  Menu,
  RefreshCw,
  X,
  type LucideIcon,
} from 'lucide-react';

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/activities', label: 'Activities', icon: Bike },
  { to: '/inventory', label: 'Bikes & Gear', icon: Package },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/training-plans', label: 'Training Plans', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function usePageTitle(): string {
  const location = useLocation();
  const match = navItems.find((item) => {
    if (item.to === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  });
  return match?.label ?? 'Veloer';
}

export function Layout() {
  const navigate = useNavigate();
  const pageTitle = usePageTitle();
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
        <button
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Veloer" className="h-8 w-auto" />
            <span className="text-lg font-bold text-gray-900">Veloer</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-l-[3px] border-primary bg-primary-50 pl-[9px] text-primary-700'
                          : 'border-l-[3px] border-transparent pl-[9px] text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-100 px-3 py-3">
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <User className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            Profile & Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-gray-700 md:text-base">{pageTitle}</span>
          </div>
          <button
            onClick={() => void handleSync()}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:px-4 md:text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
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

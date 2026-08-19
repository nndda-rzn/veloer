import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { activityApi } from '@/features/activity';
import { Menu, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent, navItems } from '@/components/layout/sidebar';

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
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-100 bg-white md:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
              }
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>
            <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
              <Link to="/" className="font-medium text-gray-400 hover:text-primary">
                Veloer
              </Link>
              <span aria-hidden="true" className="mx-1.5">
                /
              </span>
              <span className="font-semibold text-gray-700">{pageTitle}</span>
            </nav>
          </div>
          <div aria-live="polite">
            <Button onClick={() => void handleSync()} loading={syncing}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {syncing ? 'Syncing…' : 'Sync Now'}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarContent, navItems } from '@/components/layout/sidebar';
import { LastSyncIndicator } from '@/features/activity';

function usePageTitle(): string {
  const location = useLocation();
  const match = navItems.find((item) => {
    if (item.to === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  });
  return match?.label ?? 'Veloer';
}

export function Layout() {
  const pageTitle = usePageTitle();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-100 bg-white md:block">
        <SidebarContent />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
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
          <LastSyncIndicator />
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

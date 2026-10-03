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
    <div className="flex h-dvh overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card md:block">
        <SidebarContent />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
            <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-muted-foreground">
              <Link to="/" className="font-medium text-muted-foreground hover:text-primary">
                Veloer
              </Link>
              <span aria-hidden="true" className="mx-1.5 text-stone-300">
                /
              </span>
              <span className="font-medium text-foreground">{pageTitle}</span>
            </nav>
          </div>
          <LastSyncIndicator />
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

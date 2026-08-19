import { Link, NavLink } from 'react-router-dom';
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
  LogOut,
  User,
  type LucideIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/features/settings';
import { useAuthContext } from '@/features/auth/context/AuthContext';

export const navItems: { to: string; label: string; icon: LucideIcon }[] = [
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

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useProfile();
  const { user, logout } = useAuthContext();

  const displayName = profile?.display_name ?? 'Veloer Rider';
  const email = user?.email ?? '';
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
        <Link to="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <img src="/logo.png" alt="Veloer" className="h-8 w-auto" />
          <span className="text-lg font-bold text-gray-900">Veloer</span>
        </Link>
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
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? 'bg-primary-50 font-semibold text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" aria-hidden="true" />
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer — profile */}
      <div className="border-t border-gray-100 px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-2 py-2 text-left hover:bg-gray-50"
              />
            }
          >
            <Avatar className="h-8 w-8">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
              <AvatarFallback className="bg-primary-100 text-xs font-semibold text-primary-700">
                {initials || <User className="h-4 w-4" aria-hidden="true" />}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-900">
                {displayName}
              </span>
              <span className="block truncate text-xs text-gray-400">{email}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => (window.location.href = '/settings')}>
              <User aria-hidden="true" />
              Profile &amp; Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => void handleLogout()}>
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

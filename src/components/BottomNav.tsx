import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Clock, Settings } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home, matchExact: true },
  { to: '/plan', label: 'Plan', icon: CalendarDays, matchExact: true },
  { to: '/history', label: 'History', icon: Clock, matchExact: false },
  { to: '/settings', label: 'Settings', icon: Settings, matchExact: true },
] as const;

function isActive(pathname: string, to: string, matchExact: boolean): boolean {
  return matchExact ? pathname === to : pathname.startsWith(to);
}

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-sanctum-950/95 backdrop-blur-sm border-t border-sanctum-700 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-lg mx-auto flex justify-around items-center py-3 px-4">
        {navItems.map((item) => {
          const active = isActive(location.pathname, item.to, item.matchExact);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`transition-colors duration-200 ${
                active
                  ? 'text-blood-500'
                  : 'text-sanctum-500 hover:text-sanctum-300'
              }`}
            >
              <item.icon size={20} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

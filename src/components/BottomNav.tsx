import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, RefreshCw, BarChart3, Settings } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/train', label: 'Train', icon: Dumbbell, end: false },
  { to: '/review', label: 'Review', icon: RefreshCw, end: false },
  { to: '/progress', label: 'Progress', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'is-active' : ''}`
          }
        >
          <Icon size={22} aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

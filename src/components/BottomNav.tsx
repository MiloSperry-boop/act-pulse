import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, RefreshCw, BarChart3, Settings } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/train', label: 'Train', icon: Dumbbell, end: false },
  { to: '/review', label: 'Review', icon: RefreshCw, end: false },
  { to: '/progress', label: 'Progress', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const activeIndex = Math.max(
    0,
    ITEMS.findIndex((it) =>
      it.end ? pathname === it.to : pathname.startsWith(it.to),
    ),
  );

  return (
    <nav className="bottom-nav" aria-label="Primary">
      <div className="bottom-nav__glass">
        {/* Sliding glass highlight sits behind the active tab. */}
        <span
          className="bottom-nav__pill"
          style={{
            width: `calc(${100 / ITEMS.length}% - 8px)`,
            transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 8}px))`,
          }}
          aria-hidden
        />
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? 'is-active' : ''}`
            }
          >
            <Icon size={21} aria-hidden strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

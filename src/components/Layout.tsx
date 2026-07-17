import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import './BottomNav.css';
import './layout.css';

export function Layout() {
  return (
    <div className="app-shell">
      <main className="screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

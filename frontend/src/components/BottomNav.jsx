import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/trips', icon: 'explore', label: 'Trips' },
  { path: '/cities', icon: 'location_city', label: 'Cities' },
  { path: '/community', icon: 'groups', label: 'Community' },
  { path: '/settings', icon: 'person', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-pure border-t border-surface-muted flex justify-around items-center h-16 z-40 px-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/trips'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 transition-colors ${
              isActive
                ? 'text-primary font-bold border-t-2 border-primary pt-1.5'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold tracking-wider">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

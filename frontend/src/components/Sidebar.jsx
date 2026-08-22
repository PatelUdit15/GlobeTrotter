import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/trips', icon: 'explore', label: 'My Trips' },
  { path: '/cities', icon: 'location_city', label: 'Explore Cities' },
  { path: '/activities', icon: 'local_activity', label: 'Find Activities' },
  { path: '/community', icon: 'groups', label: 'Community' },
  { path: '/settings', icon: 'person', label: 'Profile' },
];

const bottomItems = [
  { path: '/dashboard', icon: 'help', label: 'Help' },
  { path: '#', icon: 'logout', label: 'Logout' },
];

export default function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 p-4 bg-surface-pure border-r border-surface-muted w-64">
      {/* Logo */}
      <div className="mb-8 px-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl">public</span>
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Inter' }}>GlobeTrotter</h1>
          <p className="text-xs font-semibold tracking-wider text-on-surface-variant">Travel Planner</p>
        </div>
      </div>

      {/* New Trip Button */}
      <NavLink
        to="/trips/create"
        className="w-full bg-primary-container text-on-primary text-xs font-semibold tracking-wider rounded-lg py-3 px-4 mb-6 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">add</span> New Trip
      </NavLink>

      {/* Nav Items */}
      <ul className="flex flex-col gap-2 flex-grow">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/trips'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-95 duration-200 ${
                  isActive
                    ? 'bg-accent-teal-light text-on-secondary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-muted'
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
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Bottom Items */}
      <ul className="flex flex-col gap-2 mt-auto border-t border-surface-muted pt-4">
        {bottomItems.map((item) => (
          <li key={item.label}>
            <a
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-muted transition-all active:scale-95 duration-200 rounded-lg"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

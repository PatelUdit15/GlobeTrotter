import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: 'dashboard',    label: 'Dashboard' },
  { path: '/trips',     icon: 'explore',      label: 'My Trips' },
  { path: '/cities',    icon: 'location_city',label: 'Explore Cities' },
  { path: '/community', icon: 'groups',       label: 'Community' },
  { path: '/settings',  icon: 'person',       label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

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

      {/* User badge */}
      {user && (
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg hover:bg-surface-muted transition-colors"
        >
          {user.avatar_url ? (
            <img
              src={`http://localhost:5000${user.avatar_url}`}
              alt={user.first_name}
              className="w-9 h-9 rounded-full object-cover border border-surface-muted"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-[10px] text-on-surface-variant truncate capitalize">
              {user.membership_tier} member
            </p>
          </div>
        </NavLink>
      )}

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

      {/* Bottom — admin link (if admin) + logout */}
      <ul className="flex flex-col gap-2 mt-auto border-t border-surface-muted pt-4">
        {user?.is_admin && (
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-accent-teal-light text-on-secondary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-muted'
                }`
              }
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="text-sm">Admin</span>
            </NavLink>
          </li>
        )}
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-muted hover:text-error transition-all rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Log Out</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

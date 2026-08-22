import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MobileHeader() {
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
    <header className="flex md:hidden justify-between items-center w-full px-4 py-4 bg-surface-pure border-b border-surface-muted sticky top-0 z-30">
      <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Inter' }}>GlobeTrotter</h1>
      <div className="flex items-center gap-3 text-on-surface-variant">
        {user?.is_admin && (
          <NavLink to="/admin" className="hover:text-primary transition-colors">
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </NavLink>
        )}
        <NavLink to="/settings" className="hover:text-primary transition-colors">
          {user?.avatar_url ? (
            <img
              src={`http://localhost:5000${user.avatar_url}`}
              alt={user.first_name}
              className="w-8 h-8 rounded-full object-cover border border-surface-muted"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold cursor-pointer">
              {initials}
            </div>
          )}
        </NavLink>
        <button onClick={handleLogout} className="hover:text-error transition-colors cursor-pointer">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}

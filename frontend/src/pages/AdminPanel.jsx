import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api';
import { useAuth } from '../context/AuthContext';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

const MONTH_LABELS = ['J','F','M','A','M','J','J','A','S','O','N','D'];

export default function AdminPanel() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [stats,       setStats]       = useState(null);
  const [growth,      setGrowth]      = useState([]);
  const [topDests,    setTopDests]    = useState([]);
  const [users,       setUsers]       = useState([]);
  const [userTotal,   setUserTotal]   = useState(0);
  const [userPage,    setUserPage]    = useState(1);
  const [userHasMore, setUserHasMore] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [usersLoading,setUsersLoading]= useState(false);
  const [searchQ,     setSearchQ]     = useState('');
  const [deletingId,  setDeletingId]  = useState(null);
  const [error,       setError]       = useState('');
  const [chartScale,  setChartScale]  = useState('auto'); // 'auto', '10', '50', '100', '500', '1000'
  const [chartHeight, setChartHeight] = useState('h-64'); // 'h-48', 'h-64', 'h-80', 'h-96'

  const currentYear = new Date().getFullYear();

  // Redirect non-admins
  useEffect(() => {
    if (user && !user.is_admin) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Load stats + chart + destinations on mount
  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.userGrowth(currentYear),
      adminApi.topDests(),
    ])
      .then(([s, g, d]) => {
        setStats(s);
        const growthData = g.data || [];
        console.log('User Growth Data:', growthData); // Debug log
        setGrowth(growthData);
        setTopDests(d || []);
      })
      .catch(err => {
        console.error('Admin data error:', err);
        setError('Failed to load admin data.');
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Load users
  const fetchUsers = async (q = '', page = 1, append = false) => {
    setUsersLoading(true);
    try {
      const res = await adminApi.users({ q, page, limit: 10 });
      setUsers(prev => append ? [...prev, ...(res.items || [])] : (res.items || []));
      setUserTotal(res.total || 0);
      setUserHasMore(res.has_more || false);
      setUserPage(page);
    } catch {}
    finally { setUsersLoading(false); }
  };

  useEffect(() => { if (!loading) fetchUsers(); }, [loading]); // eslint-disable-line

  const handleUserSearch = (e) => { e.preventDefault(); fetchUsers(searchQ, 1); };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Deactivate "${u.first_name} ${u.last_name}"?`)) return;
    setDeletingId(u.id);
    try {
      await adminApi.deleteUser(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: false } : x));
    } catch {} finally { setDeletingId(null); }
  };

  const handleExport = () => {
    window.open('http://localhost:5000/api/admin/reports/export', '_blank');
  };

  // Calculate max value based on scale selection
  const getMaxScale = () => {
    if (chartScale === 'auto') {
      return Math.max(...growth.map(g => g.count), 1);
    }
    return parseInt(chartScale);
  };

  const maxGrowth = getMaxScale();

  const STAT_CARDS = stats ? [
    { label: 'Total Users',  value: stats.total_users.toLocaleString(),  icon: 'group',    change: stats.changes?.total_users?.label  || '', positive: stats.changes?.total_users?.direction  === 'up' },
    { label: 'Active Trips', value: stats.active_trips.toLocaleString(), icon: 'explore',  change: stats.changes?.active_trips?.label || '', positive: stats.changes?.active_trips?.direction === 'up' },
    { label: 'Revenue',      value: `$${stats.revenue.toLocaleString()}`,icon: 'payments', change: stats.changes?.revenue?.label      || '', positive: stats.changes?.revenue?.direction      === 'up' },
  ] : [];

  if (!user?.is_admin) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">Admin Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Platform overview and management.</p>
        </div>
        <button onClick={handleExport}
          className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer w-fit">
          <span className="material-symbols-outlined text-[18px]">download</span> Export Report
        </button>
      </div>

      {error && <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading
          ? [1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)
          : STAT_CARDS.map(s => (
            <div key={s.label} className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-secondary text-2xl">{s.icon}</span>
                {s.change && (
                  <span className={`text-xs font-semibold tracking-wider ${s.positive ? 'text-secondary' : 'text-error'}`}>
                    {s.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs font-semibold tracking-wider text-on-surface-variant mt-1">{s.label}</p>
            </div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-xl font-semibold text-on-surface">User Growth — {currentYear}</h3>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Size controls */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">Size:</label>
                <div className="flex items-center gap-1 border border-surface-muted rounded-lg p-0.5 bg-surface-container-low">
                  <button
                    onClick={() => setChartHeight('h-48')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      chartHeight === 'h-48' 
                        ? 'bg-primary-container text-on-primary' 
                        : 'text-on-surface-variant hover:bg-surface-muted'
                    }`}
                    title="Small (192px)"
                  >
                    S
                  </button>
                  <button
                    onClick={() => setChartHeight('h-64')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      chartHeight === 'h-64' 
                        ? 'bg-primary-container text-on-primary' 
                        : 'text-on-surface-variant hover:bg-surface-muted'
                    }`}
                    title="Medium (256px)"
                  >
                    M
                  </button>
                  <button
                    onClick={() => setChartHeight('h-80')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      chartHeight === 'h-80' 
                        ? 'bg-primary-container text-on-primary' 
                        : 'text-on-surface-variant hover:bg-surface-muted'
                    }`}
                    title="Large (320px)"
                  >
                    L
                  </button>
                  <button
                    onClick={() => setChartHeight('h-96')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      chartHeight === 'h-96' 
                        ? 'bg-primary-container text-on-primary' 
                        : 'text-on-surface-variant hover:bg-surface-muted'
                    }`}
                    title="Extra Large (384px)"
                  >
                    XL
                  </button>
                </div>
              </div>

              {/* Scale selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">Scale:</label>
                <select 
                  value={chartScale} 
                  onChange={(e) => setChartScale(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-surface-muted bg-surface-pure text-on-surface hover:bg-surface-muted transition-colors cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value="auto">Auto ({Math.max(...growth.map(g => g.count), 0)})</option>
                  <option value="10">0-10</option>
                  <option value="25">0-25</option>
                  <option value="50">0-50</option>
                  <option value="100">0-100</option>
                  <option value="250">0-250</option>
                  <option value="500">0-500</option>
                  <option value="1000">0-1000</option>
                  <option value="5000">0-5000</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div className={`${chartHeight} flex items-end gap-2`}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                <Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 80 + 20}%` }} />
              ))}
            </div>
          ) : growth.length === 0 ? (
            <div className={`${chartHeight} flex items-center justify-center border-2 border-dashed border-surface-muted rounded-lg`}>
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">bar_chart</span>
                <p className="text-sm text-on-surface-variant">No user growth data for {currentYear}</p>
              </div>
            </div>
          ) : (
            <div className={`${chartHeight} flex flex-col`}>
              {/* Y-axis label */}
              <div className="flex justify-between items-center mb-2 px-4">
                <span className="text-xs font-semibold text-on-surface-variant">Users</span>
                <span className="text-xs font-semibold text-secondary">
                  {chartScale === 'auto' ? `${maxGrowth} max` : `0-${maxGrowth} scale`}
                </span>
              </div>
              
              {/* Chart bars */}
              <div className="flex-1 flex items-end justify-around gap-2 px-4 relative">
                {/* Grid lines with scale labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[100, 75, 50, 25, 0].map((p, idx) => {
                    const value = Math.round(maxGrowth * p / 100);
                    return (
                      <div key={p} className="relative w-full">
                        <div className="border-t border-outline-variant opacity-20" />
                        <span className="absolute -left-2 -translate-x-full top-0 -translate-y-1/2 text-[9px] font-semibold text-on-surface-variant opacity-60">
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {growth.map((g, idx) => {
                  // Ensure minimum 10px height for visibility when count > 0, otherwise 4px for zero
                  const rawPct = maxGrowth > 0 ? Math.round(g.count / maxGrowth * 100) : 0;
                  const pct = g.count > 0 ? Math.max(10, rawPct) : 4;
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative z-10 max-w-[60px]">
                      {/* Count on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-surface-pure px-2 py-1 rounded shadow-md border border-surface-muted whitespace-nowrap">
                        <span className="text-[11px] font-bold text-on-surface">{g.count} users</span>
                      </div>
                      
                      {/* Bar */}
                      <div
                        className="w-full bg-gradient-to-t from-primary-container to-primary rounded-t-lg transition-all hover:from-primary hover:to-primary-container cursor-pointer relative shadow-sm"
                        style={{ height: `${pct}%`, minHeight: g.count > 0 ? '10px' : '4px' }}
                        title={`${g.month_label}: ${g.count} users`}
                      >
                        {/* Count inside bar if tall enough */}
                        {g.count > 0 && pct > 20 && (
                          <span className="absolute top-2 left-0 right-0 text-center text-[10px] font-bold text-white drop-shadow">
                            {g.count}
                          </span>
                        )}
                      </div>
                      
                      {/* Month label */}
                      <span className="text-[11px] text-on-surface-variant font-bold mt-1">{MONTH_LABELS[idx]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top Destinations */}
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-6">Top Destinations</h3>
          {loading ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
          ) : topDests.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {topDests.map(d => (
                <div key={d.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-on-surface font-medium truncate mr-2">{d.name}</span>
                    <span className="text-xs font-semibold text-on-surface-variant shrink-0">{d.trips_count}</span>
                  </div>
                  <div className="w-full bg-surface-muted rounded-full h-2">
                    <div className="bg-secondary h-full rounded-full transition-all"
                      style={{ width: `${d.percentage}%` }} />
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{d.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-surface-muted gap-4">
          <div>
            <h3 className="text-xl font-semibold text-on-surface">User Management</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{userTotal} total users</p>
          </div>
          <form onSubmit={handleUserSearch} className="flex gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                className="pl-9 pr-4 py-2 bg-surface-pure border border-surface-muted rounded-lg focus:border-primary focus:outline-none text-sm w-48"
                placeholder="Search users..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                type="text"
              />
            </div>
            <button type="submit"
              className="px-4 py-2 rounded-lg border border-surface-muted text-sm font-semibold hover:bg-surface-muted transition-colors cursor-pointer">
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                {['User','Email','Trips','Status','Joined','Actions'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant ${h === 'Trips' || h === 'Status' || h === 'Actions' ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersLoading && users.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-surface-muted">
                      {[1,2,3,4,5,6].map(j => <td key={j} className="px-6 py-4"><Skeleton className="h-4" /></td>)}
                    </tr>
                  ))
                : users.map(u => {
                    const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase();
                    const joinedFmt = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    return (
                      <tr key={u.id} className={`border-t border-surface-muted hover:bg-surface-container-low/50 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-fixed-dim rounded-full flex items-center justify-center text-xs font-semibold text-primary overflow-hidden shrink-0">
                              {u.avatar_url
                                ? <img src={`http://localhost:5000${u.avatar_url}`} alt={initials} className="w-full h-full object-cover" />
                                : initials}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-on-surface">{u.first_name} {u.last_name}</span>
                              {u.is_admin && (
                                <span className="ml-1.5 text-[10px] font-bold text-secondary bg-accent-teal-light px-1.5 py-0.5 rounded">Admin</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-center font-semibold">{u.trips_count ?? '—'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-semibold tracking-wider px-2 py-1 rounded ${
                            u.is_active ? 'bg-accent-teal-light text-on-secondary-container' : 'bg-surface-muted text-on-surface-variant'
                          }`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">{joinedFmt}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={deletingId === u.id || !u.is_active || u.id === user?.id}
                              title={u.id === user?.id ? "Can't deactivate yourself" : u.is_active ? 'Deactivate user' : 'Already inactive'}
                              className="p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                              <span className="material-symbols-outlined text-[18px]">
                                {deletingId === u.id ? 'progress_activity' : 'person_off'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {userHasMore && (
          <div className="p-4 flex justify-center border-t border-surface-muted">
            <button onClick={() => fetchUsers(searchQ, userPage + 1, true)} disabled={usersLoading}
              className="px-6 py-2 rounded-lg border border-surface-muted text-sm font-semibold hover:bg-surface-muted transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-2">
              {usersLoading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              Load More Users
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

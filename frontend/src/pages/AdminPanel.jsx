const stats = [
  { label: 'Total Users', value: '12,845', icon: 'group', change: '+12%', changeColor: 'text-secondary' },
  { label: 'Active Trips', value: '3,421', icon: 'explore', change: '+8%', changeColor: 'text-secondary' },
  { label: 'Revenue', value: '$48,290', icon: 'payments', change: '+23%', changeColor: 'text-secondary' },
  { label: 'Support Tickets', value: '47', icon: 'support_agent', change: '-5%', changeColor: 'text-error' },
];

const recentUsers = [
  { name: 'Sarah Johnson', email: 'sarah.j@email.com', trips: 8, status: 'Active', joined: 'Jan 15, 2024' },
  { name: 'Michael Chen', email: 'mchen@email.com', trips: 12, status: 'Active', joined: 'Feb 03, 2024' },
  { name: 'Emma Wilson', email: 'emma.w@email.com', trips: 3, status: 'Inactive', joined: 'Mar 20, 2024' },
  { name: 'David Kim', email: 'dkim@email.com', trips: 15, status: 'Active', joined: 'Apr 11, 2024' },
  { name: 'Lisa Anderson', email: 'lisa.a@email.com', trips: 6, status: 'Active', joined: 'May 28, 2024' },
];

const topDestinations = [
  { name: 'Paris, France', trips: 1245, percentage: 85 },
  { name: 'Tokyo, Japan', trips: 980, percentage: 72 },
  { name: 'New York, USA', trips: 875, percentage: 65 },
  { name: 'Rome, Italy', trips: 720, percentage: 55 },
  { name: 'Sydney, Australia', trips: 540, percentage: 42 },
];

export default function AdminPanel() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">Admin Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Platform overview and management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-secondary text-2xl">{stat.icon}</span>
              <span className={`text-xs font-semibold tracking-wider ${stat.changeColor}`}>{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
            <p className="text-xs font-semibold tracking-wider text-on-surface-variant mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-6">User Growth</h3>
          <div className="h-64 flex items-end justify-around gap-2 px-4">
            {[40, 55, 35, 70, 85, 60, 90, 75, 95, 80, 65, 100].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-primary-container to-primary-fixed-dim rounded-t-md transition-all hover:from-primary hover:to-primary-container"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-on-surface-variant font-semibold">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-6">Top Destinations</h3>
          <div className="space-y-4">
            {topDestinations.map((dest, idx) => (
              <div key={dest.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wider text-on-surface-variant w-4">{idx + 1}</span>
                    <span className="text-sm text-on-surface">{dest.name}</span>
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-on-surface-variant">{dest.trips}</span>
                </div>
                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${dest.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-muted flex justify-between items-center">
          <h3 className="text-xl font-semibold text-on-surface">User Management</h3>
          <div className="flex gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                className="pl-9 pr-4 py-2 bg-surface-pure border border-surface-muted rounded-lg focus:border-primary focus:outline-none text-sm w-48"
                placeholder="Search users..."
                type="text"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Email</th>
                <th className="text-center px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Trips</th>
                <th className="text-center px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Joined</th>
                <th className="text-center px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.email} className="border-t border-surface-muted hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-fixed-dim rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-on-surface">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold">{user.trips}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-xs font-semibold tracking-wider px-2 py-1 rounded ${
                        user.status === 'Active'
                          ? 'bg-accent-teal-light text-on-secondary-container'
                          : 'bg-surface-muted text-on-surface-variant'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{user.joined}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const budgetCategories = [
  { name: 'Flights', amount: 1200, total: 3500, color: 'bg-secondary', icon: 'flight' },
  { name: 'Accommodation', amount: 1500, total: 3500, color: 'bg-primary-container', icon: 'hotel' },
  { name: 'Activities', amount: 450, total: 3500, color: 'bg-tertiary-container', icon: 'local_activity' },
  { name: 'Food & Dining', amount: 350, total: 3500, color: 'bg-accent-teal-light', icon: 'restaurant' },
];

const expenses = [
  { date: 'Oct 10', description: 'Flight CDG Round Trip', category: 'Flights', amount: 1200, status: 'Paid' },
  { date: 'Oct 10', description: 'Hotel Le Marais - 4 nights', category: 'Accommodation', amount: 800, status: 'Paid' },
  { date: 'Oct 11', description: 'Eiffel Tower Tickets x2', category: 'Activities', amount: 70, status: 'Paid' },
  { date: 'Oct 11', description: 'Lunch at Le Jules Verne', category: 'Food & Dining', amount: 120, status: 'Paid' },
  { date: 'Oct 12', description: 'Louvre Museum Entry', category: 'Activities', amount: 40, status: 'Pending' },
  { date: 'Oct 14', description: 'Hotel Roma Centro - 5 nights', category: 'Accommodation', amount: 700, status: 'Pending' },
];

export default function TripBudget() {
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalBudget = 3500;

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">Trip Budget</h1>
          <p className="text-sm text-on-surface-variant mt-1">European Adventure — Cost Breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
          <button className="px-4 py-2 rounded bg-primary-container text-on-primary hover:opacity-90 transition-opacity text-sm flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
            <span className="text-xs font-semibold tracking-wider text-on-surface-variant">TOTAL BUDGET</span>
          </div>
          <p className="text-3xl font-bold text-primary">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-error">trending_up</span>
            <span className="text-xs font-semibold tracking-wider text-on-surface-variant">TOTAL SPENT</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-tertiary-container">savings</span>
            <span className="text-xs font-semibold tracking-wider text-on-surface-variant">REMAINING</span>
          </div>
          <p className="text-3xl font-bold text-secondary">${(totalBudget - totalSpent).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Category Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-on-surface mb-6">By Category</h3>

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">Overall</span>
                <span className="font-semibold">{Math.round((totalSpent / totalBudget) * 100)}%</span>
              </div>
              <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden flex">
                {budgetCategories.map((cat, idx) => (
                  <div key={idx} className={`${cat.color} h-full`} style={{ width: `${(cat.amount / totalBudget) * 100}%` }} />
                ))}
              </div>
            </div>

            {/* Category Items */}
            <div className="space-y-4">
              {budgetCategories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{cat.icon}</span>
                      <span className="text-sm text-on-surface">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold">${cat.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-full rounded-full`} style={{ width: `${(cat.amount / totalBudget) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Expense Table */}
        <div className="lg:col-span-2">
          <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-sm overflow-hidden">
            <div className="p-6 border-b border-surface-muted">
              <h3 className="text-xl font-semibold text-on-surface">All Expenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="text-left px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Category</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Amount</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold tracking-wider text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, idx) => (
                    <tr key={idx} className="border-t border-surface-muted hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{expense.date}</td>
                      <td className="px-6 py-4 text-sm text-on-surface font-medium">{expense.description}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold tracking-wider px-2 py-1 bg-surface-muted text-primary rounded">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold">${expense.amount}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-xs font-semibold tracking-wider px-2 py-1 rounded ${
                            expense.status === 'Paid'
                              ? 'bg-accent-teal-light text-on-secondary-container'
                              : 'bg-surface-muted text-on-surface-variant'
                          }`}
                        >
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

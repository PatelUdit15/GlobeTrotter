import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { budgetApi, expensesApi, tripsApi } from '../api';

const CAT_COLORS = {
  flights:       'bg-secondary',
  accommodation: 'bg-primary-container',
  activities:    'bg-tertiary-container',
  food:          'bg-accent-teal-light',
  transport:     'bg-primary-fixed-dim',
  shopping:      'bg-secondary-container',
  other:         'bg-surface-muted',
};
const CAT_ICON = {
  flights:       'flight',
  accommodation: 'hotel',
  activities:    'local_activity',
  food:          'restaurant',
  transport:     'directions_transit',
  shopping:      'shopping_bag',
  other:         'more_horiz',
};
const CATEGORIES = ['flights','accommodation','activities','food','transport','shopping','other'];

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

/* ── Add / Edit Expense Modal ── */
function ExpenseModal({ tripId, expense, onClose, onSaved }) {
  const editing = !!expense;
  const [form, setForm] = useState({
    description: expense?.description || '',
    category:    expense?.category    || 'other',
    amount:      expense?.amount      ?? '',
    currency:    expense?.currency    || 'USD',
    date:        expense?.date        ? expense.date.slice(0,10) : '',
    status:      expense?.status      || 'pending',
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.description.trim()) { setErr('Description is required.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setErr('Amount must be greater than 0.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      const saved = editing
        ? await expensesApi.update(tripId, expense.id, payload)
        : await expensesApi.create(tripId, payload);
      onSaved(saved, editing);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-surface-muted">
          <h3 className="text-lg font-semibold">{editing ? 'Edit Expense' : 'Add Expense'}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</p>}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Description *</label>
            <input value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-surface-muted text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. Flight CDG Round Trip" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Amount *</label>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-muted text-sm focus:outline-none focus:border-primary"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Currency</label>
              <input value={form.currency} onChange={e => set('currency', e.target.value.toUpperCase())} maxLength={5}
                className="w-full px-3 py-2 rounded-md border border-surface-muted text-sm focus:outline-none focus:border-primary"
                placeholder="USD" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-muted text-sm focus:outline-none focus:border-primary cursor-pointer">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-muted text-sm focus:outline-none focus:border-primary cursor-pointer">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-surface-muted text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-surface-muted text-xs font-semibold hover:bg-surface-muted cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-md bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary disabled:opacity-60 flex items-center gap-1 cursor-pointer">
            {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TripBudget() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [trip,        setTrip]        = useState(null);
  const [summary,     setSummary]     = useState(null);
  const [expenses,    setExpenses]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [modal,       setModal]       = useState(null); // null | 'add' | expense obj
  const [deletingId,  setDeletingId]  = useState(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput,   setBudgetInput]   = useState('');
  const [savingBudget,  setSavingBudget]  = useState(false);

  const load = async () => {
    try {
      const [tripData, summaryData, expData] = await Promise.all([
        tripsApi.get(tripId),
        budgetApi.summary(tripId),
        expensesApi.list(tripId, { limit: 100 }),
      ]);
      setTrip(tripData);
      setSummary(summaryData);
      setExpenses(expData.items || []);
    } catch { setError('Failed to load budget data.'); }
    finally   { setLoading(false); }
  };

  useEffect(() => { load(); }, [tripId]); // eslint-disable-line

  const handleExport = () => {
    window.open(`http://localhost:5000/api/trips/${tripId}/expenses/export`, '_blank');
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      await expensesApi.delete(tripId, id);
      setExpenses(p => p.filter(e => e.id !== id));
      const s = await budgetApi.summary(tripId);
      setSummary(s);
    } catch {} finally { setDeletingId(null); }
  };

  const handleExpenseSaved = async (saved, wasEdit) => {
    setExpenses(p => wasEdit ? p.map(e => e.id === saved.id ? saved : e) : [saved, ...p]);
    const s = await budgetApi.summary(tripId);
    setSummary(s);
  };

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) return;
    setSavingBudget(true);
    try {
      await budgetApi.update(tripId, { total_budget: val });
      const s = await budgetApi.summary(tripId);
      setSummary(s);
      setEditingBudget(false);
    } catch {} finally { setSavingBudget(false); }
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  const totalBudget = summary?.total_budget   || 0;
  const totalSpent  = summary?.total_spent    || 0;
  const remaining   = summary?.remaining      || 0;
  const currency    = summary?.currency       || 'USD';
  const pct         = totalBudget > 0 ? Math.min(100, Math.round(totalSpent / totalBudget * 100)) : 0;

  return (
    <div>
      {(modal === 'add' || (modal && modal !== 'add')) && (
        <ExpenseModal
          tripId={tripId}
          expense={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleExpenseSaved}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">Trip Budget</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {trip?.title} — Cost Breakdown
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport}
            className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
          <button onClick={() => setModal('add')}
            className="px-4 py-2 rounded bg-primary-container text-on-primary hover:bg-primary transition-colors text-sm flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Budget — editable */}
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
              <span className="text-xs font-semibold tracking-wider text-on-surface-variant">TOTAL BUDGET</span>
            </div>
            <button onClick={() => { setEditingBudget(!editingBudget); setBudgetInput(totalBudget.toString()); }}
              className="text-on-surface-variant hover:text-primary cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">{editingBudget ? 'close' : 'edit'}</span>
            </button>
          </div>
          {editingBudget ? (
            <div className="flex items-center gap-2 mt-2">
              <input type="number" min="0" value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
                className="flex-1 px-2 py-1.5 rounded border border-surface-muted text-sm focus:outline-none focus:border-primary"
                placeholder="0" autoFocus />
              <button onClick={handleSaveBudget} disabled={savingBudget}
                className="px-3 py-1.5 rounded bg-primary-container text-on-primary text-xs font-semibold disabled:opacity-60 cursor-pointer">
                {savingBudget ? '…' : 'Save'}
              </button>
            </div>
          ) : (
            <p className="text-3xl font-bold text-primary mt-1">{currency} {totalBudget.toLocaleString()}</p>
          )}
        </div>
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-error">trending_up</span>
            <span className="text-xs font-semibold tracking-wider text-on-surface-variant">TOTAL SPENT</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{currency} {totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-surface-pure rounded-xl border border-surface-muted p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary">savings</span>
            <span className="text-xs font-semibold tracking-wider text-on-surface-variant">REMAINING</span>
          </div>
          <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-secondary' : 'text-error'}`}>
            {currency} {Math.abs(remaining).toLocaleString()}
            {remaining < 0 && <span className="text-sm font-semibold ml-1">over</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-on-surface mb-6">By Category</h3>

            {totalBudget > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">Overall</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden flex">
                  {(summary?.categories || []).map((cat, i) => (
                    <div key={i} className={`${CAT_COLORS[cat.category] || 'bg-surface-dim'} h-full`}
                      style={{ width: `${cat.percentage}%` }} />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {(summary?.categories || []).length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4">No expenses yet.</p>
              ) : (
                (summary?.categories || []).map(cat => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                          {CAT_ICON[cat.category] || 'circle'}
                        </span>
                        <span className="text-sm text-on-surface capitalize">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{currency} {parseFloat(cat.amount).toLocaleString()}</span>
                        <span className="text-xs text-on-surface-variant ml-1">({cat.percentage}%)</span>
                      </div>
                    </div>
                    {totalBudget > 0 && (
                      <div className="w-full bg-surface-muted rounded-full h-1.5">
                        <div className={`${CAT_COLORS[cat.category] || 'bg-surface-dim'} h-full rounded-full`}
                          style={{ width: `${cat.percentage}%` }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Expense Table */}
        <div className="lg:col-span-2">
          <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-surface-muted">
              <h3 className="text-xl font-semibold text-on-surface">All Expenses</h3>
              <span className="text-xs text-on-surface-variant">{expenses.length} items</span>
            </div>
            {expenses.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">receipt_long</span>
                <p className="text-sm text-on-surface-variant mb-3">No expenses recorded yet.</p>
                <button onClick={() => setModal('add')}
                  className="px-5 py-2 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:bg-primary transition-colors cursor-pointer">
                  Add First Expense
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low text-xs font-semibold tracking-wider text-on-surface-variant">
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Description</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-right px-4 py-3">Amount</th>
                      <th className="text-center px-4 py-3">Status</th>
                      <th className="text-center px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id} className="border-t border-surface-muted hover:bg-surface-container-low/50">
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">
                          {exp.date ? new Date(exp.date).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface max-w-[180px] truncate">{exp.description}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-surface-muted text-on-surface-variant px-2 py-0.5 rounded capitalize">
                            <span className="material-symbols-outlined text-[12px]">{CAT_ICON[exp.category] || 'circle'}</span>
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-right whitespace-nowrap">
                          {exp.currency} {parseFloat(exp.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                            exp.status === 'paid' ? 'bg-accent-teal-light text-on-secondary-container' : 'bg-surface-muted text-on-surface-variant'
                          }`}>{exp.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => setModal(exp)} className="p-1 text-on-surface-variant hover:text-primary cursor-pointer">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => handleDeleteExpense(exp.id)} disabled={deletingId === exp.id}
                              className="p-1 text-on-surface-variant hover:text-error cursor-pointer disabled:opacity-50">
                              <span className="material-symbols-outlined text-[18px]">
                                {deletingId === exp.id ? 'progress_activity' : 'delete'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

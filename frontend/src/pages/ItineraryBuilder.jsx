import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsApi, stopsApi, activitiesApi, budgetApi, citiesApi } from '../api';

const CATEGORY_ICON = {
  sightseeing:   'photo_camera',
  dining:        'restaurant',
  transport:     'directions_transit',
  accommodation: 'hotel',
  activity:      'local_activity',
  other:         'more_horiz',
};

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

/* ── Helper: Group activities by date ── */
function groupActivitiesByDay(stop) {
  const activities = stop.activities || [];
  const groups = {};

  if (!stop.arrival_date) {
    // No dates — group all under "Day 1"
    return { 'Day 1': activities };
  }

  const arrivalDate = new Date(stop.arrival_date);
  const duration = stop.duration_nights || 1;

  // Assign each activity to a day based on its date or arrival + sequential order
  activities.forEach((act, idx) => {
    let dayIndex;
    if (act.date) {
      // Use explicit activity date
      const actDate = new Date(act.date);
      dayIndex = Math.floor((actDate - arrivalDate) / 86400000) + 1;
    } else {
      // fallback: distribute evenly across days
      dayIndex = Math.floor((idx / Math.max(1, activities.length)) * duration) + 1;
    }

    dayIndex = Math.max(1, Math.min(dayIndex, duration + 1));
    const label = `Day ${dayIndex}`;

    if (!groups[label]) groups[label] = [];
    groups[label].push(act);
  });

  return groups;
}

/* ── Add/Edit Activity Modal ── */
function ActivityModal({ stopId, tripId, activity, onClose, onSaved }) {
  const editing = !!activity;
  const [form, setForm] = useState({
    name:        activity?.name        || '',
    start_time:  activity?.start_time  || '',
    end_time:    activity?.end_time    || '',
    cost:        activity?.cost        ?? '',
    currency:    activity?.currency    || 'USD',
    category:    activity?.category    || 'activity',
    description: activity?.description || '',
    date:        activity?.date        || '',
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, cost: parseFloat(form.cost) || 0 };
      let saved;
      if (editing) {
        saved = await activitiesApi.update(tripId, stopId, activity.id, payload);
      } else {
        saved = await activitiesApi.create(tripId, stopId, payload);
      }
      onSaved(saved);
      onClose();
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-xl w-full max-w-md my-8">
        <div className="flex items-center justify-between p-5 border-b border-surface-muted">
          <h3 className="text-lg font-semibold text-on-surface">{editing ? 'Edit Activity' : 'Add Activity'}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</p>}

          <div>
            <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Activity Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. Eiffel Tower visit" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Date (optional)</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Start Time</label>
              <input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">End Time</label>
              <input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Cost</label>
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Currency</label>
              <input value={form.currency} onChange={e => set('currency', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary"
                placeholder="USD" maxLength={5} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary cursor-pointer">
              <option value="sightseeing">Sightseeing</option>
              <option value="dining">Dining</option>
              <option value="transport">Transport</option>
              <option value="accommodation">Accommodation</option>
              <option value="activity">Activity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary resize-none"
              rows={3} placeholder="Optional notes..." />
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
            {saving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
            {saving ? 'Saving…' : editing ? 'Update' : 'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stop Card with Day-wise Activities ── */
function StopCard({ stop, tripId, onDeleted, onActivityChange }) {
  const [modal,     setModal]     = useState(null); // 'add' | { type: 'edit', activity }
  const [deleting,  setDeleting]  = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${stop.city_name}?`)) return;
    setDeleting(true);
    try {
      await stopsApi.delete(tripId, stop.id);
      onDeleted(stop.id);
    } catch { setDeleting(false); }
  };

  const handleDeleteActivity = async (act) => {
    if (!window.confirm(`Delete "${act.name}"?`)) return;
    try {
      await activitiesApi.delete(tripId, stop.id, act.id);
      onActivityChange(stop.id, act.id, null);
    } catch {}
  };

  const dayGroups = groupActivitiesByDay(stop);
  const dayLabels = Object.keys(dayGroups).sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
    const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
    return aNum - bNum;
  });

  const totalCost = (stop.activities || []).reduce((s, a) => s + (parseFloat(a.cost) || 0), 0);

  return (
    <>
      {modal === 'add' && (
        <ActivityModal
          stopId={stop.id}
          tripId={tripId}
          onClose={() => setModal(null)}
          onSaved={saved => onActivityChange(stop.id, saved.id, saved)}
        />
      )}
      {modal?.type === 'edit' && (
        <ActivityModal
          stopId={stop.id}
          tripId={tripId}
          activity={modal.activity}
          onClose={() => setModal(null)}
          onSaved={saved => onActivityChange(stop.id, saved.id, saved)}
        />
      )}

      <div className="relative z-10 pl-12 mb-10">
        {/* Timeline node */}
        <div className="absolute left-[16px] top-8 w-4 h-4 bg-secondary rounded-full border-4 border-surface-pure shadow-sm" />

        <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {/* Header */}
          <div
            className={`p-5 border-b border-surface-muted cursor-pointer flex items-center justify-between ${
              collapsed ? 'bg-surface-container-low/30' : ''
            }`}
            onClick={() => setCollapsed(!collapsed)}
          >
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
                {stop.city_name}
                <span className="text-sm font-semibold text-on-surface-variant bg-surface-muted px-2 py-0.5 rounded">
                  {stop.duration_nights || 1}N
                </span>
              </h3>
              {stop.country && <p className="text-sm text-on-surface-variant mt-1">{stop.country}</p>}
              {stop.arrival_date && (
                <p className="text-xs font-semibold text-on-surface-variant mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(stop.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {stop.departure_date && ` → ${new Date(stop.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {totalCost > 0 && (
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">Estimated Cost</p>
                  <p className="text-lg font-bold text-secondary">${totalCost.toFixed(2)}</p>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={deleting}
                className="p-2 text-on-surface-variant hover:text-error rounded-lg hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50">
                <span className="material-symbols-outlined">{deleting ? 'progress_activity' : 'delete'}</span>
              </button>
              <span className="material-symbols-outlined text-on-surface-variant">
                {collapsed ? 'expand_more' : 'expand_less'}
              </span>
            </div>
          </div>

          {/* Body — Day-wise activities */}
          {!collapsed && (
            <div className="p-5 space-y-5">
              {stop.accommodation && (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">hotel</span>
                  <span className="font-semibold">Accommodation:</span> {stop.accommodation}
                </div>
              )}

              {dayLabels.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No activities yet.</p>
              ) : (
                dayLabels.map(dayLabel => {
                  const acts = dayGroups[dayLabel];
                  const dayCost = acts.reduce((s, a) => s + (parseFloat(a.cost) || 0), 0);

                  return (
                    <div key={dayLabel} className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-surface-muted">
                        <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px]">event</span>
                          {dayLabel}
                        </h4>
                        {dayCost > 0 && (
                          <span className="text-xs font-semibold text-secondary bg-accent-teal-light px-2 py-0.5 rounded">
                            ${dayCost.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 pl-2">
                        {acts.map(act => (
                          <div key={act.id}
                            className="flex gap-3 p-3 bg-surface-container-low rounded-lg hover:bg-surface-muted transition-colors group">
                            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                              {CATEGORY_ICON[act.category] || 'star'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-semibold text-on-surface">{act.name}</p>
                                {act.cost > 0 && (
                                  <span className="text-xs font-semibold text-primary shrink-0">
                                    {act.currency} {parseFloat(act.cost).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              {(act.start_time || act.end_time) && (
                                <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                  {act.start_time}{act.end_time ? ` – ${act.end_time}` : ''}
                                </p>
                              )}
                              {act.description && (
                                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{act.description}</p>
                              )}
                              <span className="inline-block mt-1.5 text-[10px] font-semibold bg-surface-muted text-on-surface-variant px-2 py-0.5 rounded capitalize">
                                {act.category}
                              </span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 shrink-0">
                              <button onClick={() => setModal({ type: 'edit', activity: act })}
                                className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                                title="Edit">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteActivity(act)}
                                className="p-1 text-on-surface-variant hover:text-error rounded cursor-pointer"
                                title="Delete">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              <button onClick={() => setModal('add')}
                className="mt-3 text-secondary hover:text-secondary/80 text-sm flex items-center gap-1 transition-colors cursor-pointer font-semibold">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Main Page ── */
export default function ItineraryBuilder() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [trip,        setTrip]        = useState(null);
  const [stops,       setStops]       = useState([]);
  const [budget,      setBudget]      = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [shareMsg,    setShareMsg]    = useState('');
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (!tripId) return;
    Promise.all([
      tripsApi.get(tripId),
      budgetApi.summary(tripId),
    ])
      .then(([tripData, budgetData]) => {
        setTrip(tripData);
        setStops(tripData.stops || []);
        setBudget(budgetData);

        // Load suggestions for first stop city
        const firstCity = tripData.stops?.[0]?.city_name;
        if (firstCity) {
          citiesApi.suggestions(firstCity).then(setSuggestions).catch(() => {});
        }
      })
      .catch(() => setError('Failed to load itinerary.'))
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await tripsApi.update(tripId, { title: trip.title, visibility: trip.visibility });
      setSaving(false);
    } catch { setSaving(false); }
  };

  const handleShare = async () => {
    try {
      await tripsApi.update(tripId, { visibility: 'public' });
      setTrip(t => ({ ...t, visibility: 'public' }));
      await navigator.clipboard.writeText(`${window.location.origin}/shared-itinerary/${tripId}`);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 3000);
    } catch { setShareMsg('Made public!'); setTimeout(() => setShareMsg(''), 3000); }
  };

  const handleStopDeleted = (stopId) => {
    setStops(s => s.filter(st => st.id !== stopId));
  };

  const handleActivityChange = (stopId, actId, updatedAct) => {
    setStops(prevStops => prevStops.map(st => {
      if (st.id !== stopId) return st;
      const acts = st.activities || [];
      if (!updatedAct) {
        // deleted
        return { ...st, activities: acts.filter(a => a.id !== actId) };
      }
      const exists = acts.find(a => a.id === actId);
      if (exists) {
        return { ...st, activities: acts.map(a => a.id === actId ? updatedAct : a) };
      }
      return { ...st, activities: [...acts, updatedAct] };
    }));
    // Refresh budget after activity change
    budgetApi.summary(tripId).then(setBudget).catch(() => {});
  };

  const addSuggestion = async (sug, stopId) => {
    try {
      const saved = await activitiesApi.create(tripId, stopId, {
        name:     sug.name,
        category: sug.category,
        cost:     sug.estimated_cost || 0,
        currency: sug.currency || 'USD',
      });
      handleActivityChange(stopId, saved.id, saved);
    } catch {}
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">{[1, 2].map(i => <Skeleton key={i} className="h-48" />)}</div>
        <div className="lg:col-span-4 space-y-4"><Skeleton className="h-48" /><Skeleton className="h-40" /></div>
      </div>
    </div>
  );

  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!trip) return null;

  const totalDays = trip.start_date && trip.end_date
    ? Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) + 1
    : stops.reduce((s, st) => s + (st.duration_nights || 0), 0);
  const budgetPct = budget?.total_budget > 0
    ? Math.min(100, Math.round((budget.total_spent / budget.total_budget) * 100))
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{trip.title}</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {totalDays > 0 ? `${totalDays} Days` : ''}
            {stops.length > 0 ? ` • ${stops.length} ${stops.length === 1 ? 'City' : 'Cities'}` : ''}
            {budget?.total_budget > 0 ? ` • Budget $${budget.total_budget.toLocaleString()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {shareMsg && <span className="text-xs font-semibold text-secondary">{shareMsg}</span>}
          <button onClick={handleShare}
            className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">share</span>
            {trip.visibility === 'public' ? 'Copy Link' : 'Share'}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded bg-primary-container text-on-primary hover:bg-primary transition-colors text-sm flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60">
            {saving
              ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              : <span className="material-symbols-outlined text-[18px]">save</span>}
            Save Itinerary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Timeline */}
        <div className="lg:col-span-8 relative timeline-line pb-12">
          {stops.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">add_location_alt</span>
              <p className="text-base font-semibold text-on-surface mb-1">No stops yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Add your first destination to get started.</p>
            </div>
          ) : (
            stops.map(stop => (
              <StopCard
                key={stop.id}
                stop={stop}
                tripId={tripId}
                onDeleted={handleStopDeleted}
                onActivityChange={handleActivityChange}
              />
            ))
          )}

          {/* Add Stop button */}
          <div className="relative z-10 pl-12 mt-4">
            {stops.length > 0 && <div className="absolute left-[16px] top-3 w-4 h-4 bg-surface-pure rounded-full border-2 border-secondary flex items-center justify-center"><div className="w-1.5 h-1.5 bg-secondary rounded-full" /></div>}
            <button onClick={() => navigate(`/trips/${tripId}/itinerary/add-stop`)}
              className="w-full border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:bg-surface-muted transition-colors flex flex-col items-center gap-2 group cursor-pointer">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-3xl">add_location_alt</span>
              <span className="text-base font-semibold text-outline group-hover:text-primary transition-colors">Add Next Stop</span>
            </button>
          </div>
        </div>

        {/* Right: Budget + Suggestions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Budget Overview */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>Budget Overview
            </h3>
            {!budget ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            ) : (
              <div className="space-y-3">
                {(budget.categories || []).map(cat => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant capitalize">{cat.category}</span>
                    <span className="text-sm font-semibold">${parseFloat(cat.amount).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-surface-muted flex justify-between items-center">
                  <span className="text-base font-bold text-on-surface">Total Est.</span>
                  <span className="text-base font-bold text-primary">${budget.total_spent?.toFixed(2) || '0.00'}</span>
                </div>
                {budget.total_budget > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${budgetPct}%` }} />
                    </div>
                    <p className="text-xs font-semibold text-on-surface-variant text-center mt-1">
                      {budgetPct}% of ${budget.total_budget?.toLocaleString()} budget
                    </p>
                  </div>
                )}
                <button onClick={() => navigate(`/trips/${tripId}/budget`)}
                  className="w-full text-xs font-semibold text-secondary hover:underline mt-2 text-center cursor-pointer">
                  View Full Budget →
                </button>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && stops.length > 0 && (
            <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">tips_and_updates</span>Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.slice(0, 5).map((sug, i) => (
                  <div key={i} className="flex justify-between items-center gap-2 p-2 rounded hover:bg-surface-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{sug.name}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{sug.category}</p>
                    </div>
                    {sug.estimated_cost > 0 && (
                      <span className="text-xs font-semibold text-primary shrink-0">${sug.estimated_cost}</span>
                    )}
                    <button onClick={() => addSuggestion(sug, stops[0].id)}
                      className="shrink-0 p-1 text-secondary hover:text-secondary/80 rounded cursor-pointer"
                      title="Add to first stop">
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

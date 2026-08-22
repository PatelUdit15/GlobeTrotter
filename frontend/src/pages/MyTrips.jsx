import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripsApi } from '../api';

const STATUS_ACCENT = {
  ongoing:   'bg-secondary',
  upcoming:  'bg-primary-container',
  draft:     'bg-surface-dim',
  completed: 'bg-surface-muted',
};
const STATUS_LABEL = {
  ongoing:   'In Progress',
  upcoming:  'Upcoming',
  draft:     'Draft',
  completed: 'Completed',
};

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

/* ── Make-Public confirmation modal ── */
function MakePublicModal({ trip, onConfirm, onCancel, working }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[22px]">public</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-on-surface">Make trip public?</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Anyone with the link can view it.</p>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant mb-5">
          <strong className="text-on-surface">"{trip.title}"</strong> is currently private.
          To view the shared itinerary page, it needs to be made public first.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={working}
            className="flex-1 py-2.5 rounded-lg border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={working}
            className="flex-1 py-2.5 rounded-lg bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {working && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
            {working ? 'Making public…' : 'Make Public & View'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TripCard({ trip, onDelete, onMadePublic, isCompleted }) {
  const [deleting,     setDeleting]     = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [makingPublic, setMakingPublic] = useState(false);
  const navigate = useNavigate();

  const accent    = STATUS_ACCENT[trip.status] || 'bg-surface-dim';
  const badge     = STATUS_LABEL[trip.status]  || trip.status;
  const stopCount = trip.stop_count ?? 0;

  const startFmt = trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  const endFmt   = trip.end_date   ? new Date(trip.end_date).toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const dateStr  = startFmt && endFmt ? `${startFmt} - ${endFmt}` : startFmt || 'Dates TBD';

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await tripsApi.delete(trip.id);
      onDelete(trip.id);
    } catch {
      alert('Failed to delete trip.');
      setDeleting(false);
    }
  };

  /* ── View button: navigate to shared itinerary ── */
  const handleView = () => {
    if (trip.visibility === 'public') {
      // Already public — go straight to shared itinerary page
      navigate(`/shared-itinerary/${trip.id}`);
    } else {
      // Private — ask user to make it public first
      setShowModal(true);
    }
  };

  const handleConfirmMakePublic = async () => {
    setMakingPublic(true);
    try {
      await tripsApi.update(trip.id, { visibility: 'public' });
      onMadePublic(trip.id); // update parent state so badge refreshes
      setShowModal(false);
      navigate(`/shared-itinerary/${trip.id}`);
    } catch {
      alert('Failed to make trip public.');
    } finally {
      setMakingPublic(false);
    }
  };

  return (
    <>
      {showModal && (
        <MakePublicModal
          trip={trip}
          onConfirm={handleConfirmMakePublic}
          onCancel={() => setShowModal(false)}
          working={makingPublic}
        />
      )}

      <div className={`bg-surface-pure border border-surface-muted rounded-xl overflow-hidden flex flex-col ${isCompleted ? 'grayscale hover:grayscale-0 transition-all' : ''}`}>
        {/* Cover */}
        <div
          className="h-32 bg-surface-muted relative border-b border-surface-muted"
          style={trip.cover_image_url ? { backgroundImage: `url('${trip.cover_image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {!trip.cover_image_url && (
            <div className="w-full h-full bg-gradient-to-br from-primary-container/30 to-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary/30 text-5xl">flight_takeoff</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {trip.visibility === 'public' && (
              <span className="bg-secondary/80 backdrop-blur-sm text-on-secondary text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">public</span>Public
              </span>
            )}
            <span className="bg-surface-pure/90 backdrop-blur-sm px-2 py-1 rounded text-primary text-[10px] font-semibold tracking-wider uppercase">
              {badge}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col relative pl-5">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent} rounded-r-full`} />
          <h3 className="text-xl font-semibold text-on-surface line-clamp-1 mb-1">{trip.title}</h3>
          <p className="text-sm text-on-surface-variant mb-3">{dateStr}</p>
          <div className="flex gap-2 mb-4 mt-auto">
            <span className="inline-flex items-center gap-1 bg-surface-muted text-primary px-2 py-1 rounded text-[11px] font-semibold tracking-wider">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {stopCount} {stopCount === 1 ? 'Destination' : 'Destinations'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t border-surface-muted mt-auto">
            {/* View → shared itinerary */}
            <button
              onClick={handleView}
              className="flex-1 text-center py-1.5 border border-primary text-primary rounded text-xs font-semibold tracking-wider hover:bg-accent-teal-light transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              View
            </button>

            {/* Edit → itinerary builder */}
            <button
              onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
              className="flex-1 py-1.5 border border-surface-muted text-on-surface rounded text-xs font-semibold tracking-wider hover:bg-surface-muted transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit
            </button>

            {/* Delete */}
            {!isCompleted && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 border border-surface-muted text-on-surface-variant rounded hover:text-error hover:border-error transition-colors cursor-pointer disabled:opacity-50"
                title="Delete trip"
              >
                <span className="material-symbols-outlined text-[18px]">{deleting ? 'progress_activity' : 'delete'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TripSection({ title, trips, loading, onDelete, onMadePublic, isCompleted }) {
  if (loading) {
    return (
      <section className={isCompleted ? 'opacity-75' : ''}>
        <h2 className="text-xl font-semibold text-on-surface mb-4 pb-2 border-b border-surface-muted">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl border border-surface-muted overflow-hidden">
              <Skeleton className="h-32 rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (!trips.length) return null;

  return (
    <section className={isCompleted ? 'opacity-75' : ''}>
      <h2 className="text-xl font-semibold text-on-surface mb-4 pb-2 border-b border-surface-muted">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trips.map(trip => (
          <TripCard
            key={trip.id}
            trip={trip}
            onDelete={onDelete}
            onMadePublic={onMadePublic}
            isCompleted={isCompleted}
          />
        ))}
      </div>
    </section>
  );
}

export default function MyTrips() {
  const [ongoing,   setOngoing]   = useState([]);
  const [upcoming,  setUpcoming]  = useState([]);
  const [completed, setCompleted] = useState([]);
  const [drafts,    setDrafts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [q,         setQ]         = useState('');
  const [error,     setError]     = useState('');

  const fetchAll = async (search = '') => {
    setLoading(true);
    try {
      const params = search ? { q: search, limit: 50 } : { limit: 50 };
      const res = await tripsApi.list(params);
      const all = res.items || [];
      setOngoing(all.filter(t => t.status === 'ongoing'));
      setUpcoming(all.filter(t => t.status === 'upcoming'));
      setDrafts(all.filter(t => t.status === 'draft'));
      setCompleted(all.filter(t => t.status === 'completed'));
    } catch {
      setError('Failed to load trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = e => { e.preventDefault(); fetchAll(q); };

  const handleDelete = id => {
    setOngoing(p   => p.filter(t => t.id !== id));
    setUpcoming(p  => p.filter(t => t.id !== id));
    setDrafts(p    => p.filter(t => t.id !== id));
    setCompleted(p => p.filter(t => t.id !== id));
  };

  // Update visibility badge after trip is made public
  const handleMadePublic = id => {
    const patch = arr => arr.map(t => t.id === id ? { ...t, visibility: 'public' } : t);
    setOngoing(patch);
    setUpcoming(patch);
    setDrafts(patch);
    setCompleted(patch);
  };

  const totalTrips = ongoing.length + upcoming.length + drafts.length + completed.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">My Trips</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {loading ? 'Loading…' : `${totalTrips} trip${totalTrips !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-pure border border-surface-muted rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm"
              placeholder="Search trips…"
              value={q}
              onChange={e => setQ(e.target.value)}
              type="text"
            />
          </div>
          <button type="submit"
            className="bg-surface-pure border border-surface-muted text-on-surface px-4 py-2 rounded-lg text-xs font-semibold tracking-wider hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">search</span> Search
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>
      )}

      {!loading && totalTrips === 0 ? (
        <div className="text-center py-20 bg-surface-pure rounded-xl border border-surface-muted">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">luggage</span>
          <p className="text-lg font-semibold text-on-surface mb-1">No trips found</p>
          <p className="text-sm text-on-surface-variant mb-5">
            {q ? `No results for "${q}"` : "You haven't planned any trips yet."}
          </p>
          <Link to="/trips/create"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          <TripSection title="Ongoing"   trips={ongoing}   loading={loading} onDelete={handleDelete} onMadePublic={handleMadePublic} />
          <TripSection title="Upcoming"  trips={upcoming}  loading={loading} onDelete={handleDelete} onMadePublic={handleMadePublic} />
          <TripSection title="Drafts"    trips={drafts}    loading={loading} onDelete={handleDelete} onMadePublic={handleMadePublic} />
          <TripSection title="Completed" trips={completed} loading={loading} onDelete={handleDelete} onMadePublic={handleMadePublic} isCompleted />
        </div>
      )}
    </div>
  );
}

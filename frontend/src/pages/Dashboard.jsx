import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripsApi, citiesApi } from '../api';

const STATUS_STYLE = {
  upcoming: { label: 'Upcoming', bg: 'bg-accent-teal-light text-on-secondary-container', accent: 'bg-secondary' },
  ongoing: { label: 'In Progress', bg: 'bg-primary-container text-on-primary', accent: 'bg-primary' },
  draft: { label: 'Draft', bg: 'bg-surface-container-high text-on-surface-variant', accent: 'bg-surface-dim' },
  completed: { label: 'Completed', bg: 'bg-surface-muted text-on-surface-variant', accent: 'bg-surface-muted' },
};

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // search & filter state
  const [q, setQ] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [searching, setSearching] = useState(false);

  // Initial load
  useEffect(() => {
    Promise.all([
      tripsApi.list({ limit: 4, sort_by: 'created_at' }),
      citiesApi.featured(),
    ])
      .then(([tripsRes, dests]) => {
        setTrips(tripsRes.items || []);
        setDestinations(dests || []);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch trips when filters change
  const fetchTrips = useCallback(() => {
    setSearching(true);
    const params = { limit: 4, sort_by: sortBy };
    if (q) params.q = q;
    if (filterBy !== 'all') params.status = filterBy;

    tripsApi.list(params)
      .then(res => setTrips(res.items || []))
      .catch(() => { })
      .finally(() => setSearching(false));
  }, [q, filterBy, sortBy]);

  const handleSearch = (e) => { e.preventDefault(); fetchTrips(); };

  // Re-fetch when selects change
  useEffect(() => { if (!loading) fetchTrips(); }, [filterBy, sortBy]); // eslint-disable-line

  const firstTripId = trips[0]?.id;

  return (
    <div className="flex flex-col gap-8 relative pb-12">
      {/* Hero Banner */}
      <section
        className="relative w-full rounded-xl overflow-hidden shadow-sm min-h-[300px] md:min-h-[340px] flex flex-col justify-center items-center text-center p-6 md:p-8"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIAjQwefthHdLsBb0KEpeSXHBro_7f4lXMDPN8QbakZYseiz6bj3wry4YaLx96HqY3ESr3PinxJD1VLKoEVqxWx7u9fpsoeT7ndj0JX-SZGICBphMRsEyJvybnJNbrX4khMZxPkjHH7c-AJuP6vGTqxCbYgoWgEQ25laoAoDpX0bSww-YZmZxNm_81f2mAKrInlGVVUBep5rlgX59q9-P_0XBByRPwT0CoGPB-KLEq_7a91uSYf1o')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        {firstTripId && (
          <Link
            to={`/trips/${firstTripId}/calendar`}
            className="absolute top-4 right-4 z-20 bg-surface-pure/80 hover:bg-surface-pure text-primary p-2.5 rounded-full flex items-center justify-center transition-all shadow-sm border border-surface-muted hover:scale-105"
            title="Trip Calendar"
          >
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </Link>
        )}
        <div className="absolute inset-0 bg-surface-pure/60 backdrop-blur-[2px]" />
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-4">
          <h2 className="text-4xl md:text-5xl font-bold text-primary drop-shadow-sm tracking-tight">
            {user ? `Welcome back, ${user.first_name}!` : 'Where to next?'}
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-xl">
            Plan your perfect itinerary, manage budgets, and share memories.
          </p>

          {/* Search + Controls */}
          <form onSubmit={handleSearch} className="mt-2 flex flex-col lg:flex-row gap-3 w-full items-stretch lg:items-center">
            <div className="flex-1 flex bg-surface-pure rounded-lg border border-surface-muted overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant p-3 flex items-center">search</span>
              <input
                className="w-full border-none focus:ring-0 text-sm text-on-surface bg-transparent px-2 outline-none"
                placeholder="Search your trips..."
                value={q}
                onChange={e => setQ(e.target.value)}
                type="text"
              />
              <button type="submit" className="bg-primary-container text-on-primary px-5 text-xs font-semibold tracking-wider hover:bg-primary transition-colors cursor-pointer">
                {searching ? '...' : 'Search'}
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-center lg:justify-end">
              {/* Filter */}
              <div className="relative flex-1 sm:flex-initial">
                <select value={filterBy} onChange={e => setFilterBy(e.target.value)}
                  className="w-full appearance-none bg-surface-pure border border-surface-muted rounded-lg pl-8 pr-7 py-2.5 text-xs font-semibold tracking-wider text-on-surface hover:border-primary focus:outline-none cursor-pointer shadow-sm">
                  <option value="all">Filter: All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="draft">Draft</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <span className="material-symbols-outlined text-[16px] text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">filter_list</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
              </div>
              {/* Sort By */}
              <div className="relative flex-1 sm:flex-initial">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-surface-pure border border-surface-muted rounded-lg pl-8 pr-7 py-2.5 text-xs font-semibold tracking-wider text-on-surface hover:border-primary focus:outline-none cursor-pointer shadow-sm">
                  <option value="created_at">Sort: Newest</option>
                  <option value="start_date">Sort: Start Date</option>
                  <option value="title">Sort: Name</option>
                </select>
                <span className="material-symbols-outlined text-[16px] text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">swap_vert</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="flex flex-col gap-8">


        {/* Recent Trips */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-semibold text-on-surface">Recent Trips</h3>
            <Link className="text-xs font-semibold tracking-wider text-secondary hover:underline" to="/trips">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-surface-muted overflow-hidden">
                  <Skeleton className="h-32 rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-16 bg-surface-pure rounded-xl border border-surface-muted">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">luggage</span>
              <p className="text-base font-semibold text-on-surface mb-1">No trips yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Start planning your first adventure!</p>
              <Link to="/trips/create" className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-sm">add</span> Plan a Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trips.map(trip => {
                const s = STATUS_STYLE[trip.status] || STATUS_STYLE.draft;
                const startFmt = trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
                const endFmt = trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                const dateStr = startFmt && endFmt ? `${startFmt} - ${endFmt}` : startFmt || 'Dates TBD';
                return (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}/itinerary`}
                    className="bg-surface-pure rounded-xl border border-surface-muted hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className="h-32 bg-surface-muted relative"
                      style={trip.cover_image_url ? { backgroundImage: `url('${trip.cover_image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                      {!trip.cover_image_url && (
                        <div className="w-full h-full bg-gradient-to-br from-primary-container/40 to-secondary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary/30 text-5xl">flight_takeoff</span>
                        </div>
                      )}
                      <div className={`absolute top-3 left-3 ${s.bg} text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm`}>
                        {s.label}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 relative pl-6">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.accent} rounded-l-xl opacity-50`} />
                      <h4 className="text-lg font-semibold text-primary line-clamp-1">{trip.title}</h4>
                      <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        {dateStr}
                      </div>
                      {trip.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-1">{trip.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Top Regional Selections */}
        <section>
          <h3 className="text-xl font-semibold text-on-surface mb-4">Top Regional Selections</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[140px] h-[180px] rounded-lg shrink-0" />
              ))
              : destinations.length > 0
                ? destinations.map(dest => (
                  <Link
                    key={dest.id}
                    to={`/cities`}
                    className="min-w-[140px] h-[180px] rounded-lg overflow-hidden relative cursor-pointer group snap-start border border-surface-muted shrink-0"
                  >
                    {dest.cover_image_url ? (
                      <img src={dest.cover_image_url} alt={dest.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-primary text-4xl">location_city</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 to-transparent flex items-end p-3">
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-surface-pure">{dest.name}</p>
                        <p className="text-[10px] text-surface-pure/70">{dest.country}</p>
                      </div>
                    </div>
                  </Link>
                ))
                : (
                  <p className="text-sm text-on-surface-variant py-8">No destinations found.</p>
                )
            }
          </div>
        </section>
      </div>

      {/* FAB */}
      <Link
        to="/trips/create"
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-50 bg-primary-container text-on-primary hover:bg-primary shadow-lg hover:shadow-xl rounded-full py-3.5 px-6 flex items-center gap-2.5 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 text-sm font-semibold tracking-wide group cursor-pointer border border-on-primary/10"
      >
        <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
        <span>Plan a Trip</span>
      </Link>
    </div>
  );
}

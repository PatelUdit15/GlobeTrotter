import { useState, useEffect, useCallback } from 'react';
import { citiesApi, tripsApi, stopsApi, activitiesApi } from '../api';

const REGIONS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

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

function CostDots({ level }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <span key={i} className={`material-symbols-outlined text-[14px] ${i <= level ? 'text-secondary' : 'text-outline-variant'}`}>
          attach_money
        </span>
      ))}
    </div>
  );
}

/* ── City Detail Modal with Activity Selection ── */
function CityDetailModal({ city, onClose }) {
  const [activities,      setActivities]      = useState([]);
  const [selected,        setSelected]        = useState(new Set());
  const [loading,         setLoading]         = useState(true);
  const [showTripPicker,  setShowTripPicker]  = useState(false);
  const [trips,           setTrips]           = useState([]);
  const [tripsLoading,    setTripsLoading]    = useState(false);
  const [adding,          setAdding]          = useState(null); // tripId being processed
  const [error,           setError]           = useState('');
  const [successMsg,      setSuccessMsg]      = useState('');

  useEffect(() => {
    citiesApi.suggestions(city.name)
      .then(data => setActivities(data || []))
      .catch(() => setError('Failed to load activities.'))
      .finally(() => setLoading(false));
  }, [city.name]);

  const toggleSelect = (idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else               next.add(idx);
      return next;
    });
  };

  const handleProceed = () => {
    if (selected.size === 0) {
      setError('Please select at least one activity.');
      return;
    }
    setError('');
    setShowTripPicker(true);
    setTripsLoading(true);
    tripsApi.list({ limit: 50, sort_by: 'created_at' })
      .then(res => setTrips(res.items || []))
      .catch(() => setError('Could not load your trips.'))
      .finally(() => setTripsLoading(false));
  };

  const handleAddToTrip = async (trip) => {
    setAdding(trip.id);
    setError('');
    try {
      // Find or create a stop for this city in the selected trip
      let stop = trip.stops?.find(s => s.city_name?.toLowerCase() === city.name.toLowerCase());

      if (!stop) {
        // Create a new stop
        stop = await stopsApi.create(trip.id, {
          city_name:       city.name,
          country:         city.country,
          duration_nights: 1,
        });
      }

      // Add selected activities to the stop
      const selectedActivities = Array.from(selected).map(idx => activities[idx]);
      for (const act of selectedActivities) {
        await activitiesApi.create(trip.id, stop.id, {
          name:        act.name,
          category:    act.category,
          cost:        act.estimated_cost || 0,
          currency:    act.currency || 'USD',
          description: act.description || '',
        });
      }

      setSuccessMsg(`Added ${selected.size} ${selected.size === 1 ? 'activity' : 'activities'} to "${trip.title}"!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      setError(e.message || 'Failed to add activities.');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-2xl w-full max-w-3xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-surface-muted shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-2">{city.name}</h2>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mb-3">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {city.country}{city.region ? ` · ${city.region}` : ''}
              </p>
              {city.description && (
                <p className="text-sm text-on-surface-variant leading-relaxed">{city.description}</p>
              )}
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer shrink-0">
              <span className="material-symbols-outlined text-[28px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        {!showTripPicker ? (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">explore</span>
                  Recommended Activities
                </h3>
                {selected.size > 0 && (
                  <span className="text-xs font-semibold bg-primary-container text-on-primary px-3 py-1 rounded-full">
                    {selected.size} selected
                  </span>
                )}
              </div>

              {error && (
                <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>{error}
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-surface-muted rounded-lg">
                      <Skeleton className="w-10 h-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-surface-muted rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">travel_explore</span>
                  <p className="text-sm text-on-surface-variant">No suggestions available for this city yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((act, idx) => {
                    const isSelected = selected.has(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelect(idx)}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary-container/20'
                            : 'border-surface-muted hover:border-primary/50 hover:bg-surface-muted/50'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected ? 'bg-primary border-primary' : 'border-outline-variant'
                        }`}>
                          {isSelected && (
                            <span className="material-symbols-outlined text-on-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check
                            </span>
                          )}
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-secondary text-[22px]">
                            {CATEGORY_ICON[act.category] || 'star'}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-on-surface">{act.name}</h4>
                            {act.estimated_cost > 0 && (
                              <span className="text-xs font-bold text-secondary shrink-0">
                                ${act.estimated_cost}
                              </span>
                            )}
                          </div>
                          {act.description && (
                            <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">{act.description}</p>
                          )}
                          <span className="inline-block text-[10px] font-semibold tracking-wider bg-surface-muted text-on-surface-variant px-2 py-0.5 rounded capitalize">
                            {act.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-surface-muted shrink-0">
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-lg border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleProceed} disabled={selected.size === 0}
                  className="flex-1 py-3 rounded-lg bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  Proceed ({selected.size})
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Trip Picker */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setShowTripPicker(false)}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h3 className="text-lg font-semibold text-on-surface">
                  Add to Trip ({selected.size} {selected.size === 1 ? 'activity' : 'activities'})
                </h3>
              </div>

              {error && (
                <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>{error}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>{successMsg}
                </div>
              )}

              {tripsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-surface-muted rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">luggage</span>
                  <p className="text-sm text-on-surface-variant mb-1">No trips yet.</p>
                  <p className="text-xs text-on-surface-variant">Create a trip first, then add cities and activities to it.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map(trip => {
                    const isAdding = adding === trip.id;
                    const startFmt = trip.start_date
                      ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : null;

                    return (
                      <div
                        key={trip.id}
                        className="flex items-center gap-3 p-4 rounded-lg border border-surface-muted hover:bg-surface-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">{trip.title}</p>
                          <p className="text-xs text-on-surface-variant capitalize">
                            {trip.status}{startFmt ? ` · ${startFmt}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddToTrip(trip)}
                          disabled={isAdding || !!adding}
                          className="shrink-0 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                        >
                          {isAdding ? (
                            <>
                              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                              Adding...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              Add Here
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-surface-muted shrink-0">
              <button onClick={() => setShowTripPicker(false)}
                className="w-full py-3 rounded-lg border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors cursor-pointer">
                Back to Activities
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Add-to-Trip Modal (simple version, city only) ── */
function AddToTripModal({ city, onClose }) {
  const [trips,     setTrips]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(null);
  const [added,     setAdded]     = useState([]);
  const [error,     setError]     = useState('');

  useEffect(() => {
    tripsApi.list({ limit: 50, sort_by: 'created_at' })
      .then(res => setTrips(res.items || []))
      .catch(() => setError('Could not load your trips.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (trip) => {
    setAdding(trip.id);
    setError('');
    try {
      await stopsApi.create(trip.id, {
        city_name:       city.name,
        country:         city.country,
        duration_nights: 1,
      });
      setAdded(prev => [...prev, trip.id]);
    } catch (e) {
      setError(e.message || 'Failed to add city to trip.');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-muted">
          <div>
            <h3 className="text-base font-semibold text-on-surface">Add to Trip</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {city.name}, {city.country}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-72 overflow-y-auto">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">{error}</p>
          )}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant block mb-2">luggage</span>
              <p className="text-sm text-on-surface-variant">No trips yet.</p>
              <p className="text-xs text-on-surface-variant mt-1">Create a trip first, then add cities to it.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trips.map(trip => {
                const isAdded  = added.includes(trip.id);
                const isAdding = adding === trip.id;
                const startFmt = trip.start_date
                  ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : null;

                return (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-surface-muted hover:bg-surface-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{trip.title}</p>
                      <p className="text-xs text-on-surface-variant capitalize">
                        {trip.status}{startFmt ? ` · ${startFmt}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => !isAdded && handleAdd(trip)}
                      disabled={isAdding || isAdded}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-default ${
                        isAdded
                          ? 'bg-accent-teal-light text-on-secondary-container'
                          : 'bg-primary-container text-on-primary hover:bg-primary'
                      } disabled:opacity-80`}
                    >
                      {isAdding ? (
                        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                      ) : isAdded ? (
                        <><span className="material-symbols-outlined text-[14px]">check</span>Added</>
                      ) : (
                        <><span className="material-symbols-outlined text-[14px]">add</span>Add</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 pt-0">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function CitySearch() {
  const [cities,         setCities]         = useState([]);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [hasMore,        setHasMore]        = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [error,          setError]          = useState('');
  const [detailCity,     setDetailCity]     = useState(null); // city shown in detail modal
  const [quickAddCity,   setQuickAddCity]   = useState(null); // city shown in quick-add modal

  const LIMIT = 12;

  const fetchCities = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) { setLoading(true); setCities([]); setPage(1); }
    else        setLoadingMore(true);

    try {
      const params = { page: currentPage, limit: LIMIT };
      if (searchQuery.trim())       params.q      = searchQuery.trim();
      if (selectedRegion !== 'All') params.region = selectedRegion;

      const res = await citiesApi.list(params);
      setCities(prev => reset ? (res.items || []) : [...prev, ...(res.items || [])]);
      setTotal(res.total || 0);
      setHasMore(res.has_more || false);
      if (!reset) setPage(p => p + 1);
    } catch {
      setError('Failed to load cities.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedRegion, page]); // eslint-disable-line

  useEffect(() => { fetchCities(true); }, [selectedRegion]); // eslint-disable-line

  const handleSearch = (e) => { e.preventDefault(); fetchCities(true); };

  return (
    <div className="flex flex-col gap-6">
      {/* Modals */}
      {detailCity && (
        <CityDetailModal city={detailCity} onClose={() => setDetailCity(null)} />
      )}
      {quickAddCity && (
        <AddToTripModal city={quickAddCity} onClose={() => setQuickAddCity(null)} />
      )}

      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Find Destinations</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-2">
            {loading ? 'Loading…' : `${total.toLocaleString()} destination${total !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-surface-pure border border-surface-muted rounded-lg focus:border-primary focus:outline-none text-sm"
              placeholder="Search city, country..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <button type="submit"
            className="px-5 py-2.5 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:bg-primary transition-colors cursor-pointer shrink-0">
            Search
          </button>
        </form>
      </header>

      {/* Region filter pills */}
      <div className="flex gap-2 flex-wrap">
        {REGIONS.map(r => (
          <button key={r} onClick={() => setSelectedRegion(r)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer border ${
              selectedRegion === r
                ? 'bg-primary-container text-on-primary border-primary shadow-sm'
                : 'bg-surface-pure text-on-surface-variant border-surface-muted hover:border-outline-variant'
            }`}>
            {r}
          </button>
        ))}
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {/* City grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-surface-muted overflow-hidden">
              <Skeleton className="h-44 rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">location_off</span>
          <p className="text-lg font-semibold text-on-surface">No destinations found</p>
          <p className="text-sm text-on-surface-variant mt-1">
            {searchQuery ? `No results for "${searchQuery}"` : 'Try a different region.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cities.map(city => (
              <div key={city.id}
                className="bg-surface-pure rounded-xl border border-surface-muted overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer"
                onClick={() => setDetailCity(city)}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden shrink-0">
                  {city.cover_image_url ? (
                    <img src={city.cover_image_url} alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-container/40 to-secondary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary/30 text-5xl">location_city</span>
                    </div>
                  )}
                  {city.popularity_label && (
                    <span className="absolute top-3 left-3 bg-primary-container/90 text-on-primary text-[10px] font-bold tracking-wider px-2 py-1 rounded-sm backdrop-blur-sm">
                      {city.popularity_label}
                    </span>
                  )}
                  {city.is_featured && (
                    <span className="absolute top-3 right-3 bg-secondary/90 text-on-secondary text-[10px] font-bold tracking-wider px-2 py-1 rounded-sm backdrop-blur-sm">
                      Featured
                    </span>
                  )}

                  {/* Hover overlay with explore icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-4xl">travel_explore</span>
                      <span className="text-xs font-semibold tracking-wide">Explore Activities</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-on-surface leading-tight">{city.name}</h3>
                    <CostDots level={city.cost_level} />
                  </div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {city.country}{city.region ? ` · ${city.region}` : ''}
                  </p>
                  {city.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">{city.description}</p>
                  )}

                  {/* Quick Add button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setQuickAddCity(city); }}
                    className="mt-auto w-full py-2 rounded-lg bg-surface-muted hover:bg-primary-container hover:text-on-primary text-on-surface-variant text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-surface-muted hover:border-primary group/btn"
                  >
                    <span className="material-symbols-outlined text-[16px] group-hover/btn:text-on-primary">add_location_alt</span>
                    Quick Add to Trip
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button onClick={() => fetchCities(false)} disabled={loadingMore}
                className="px-8 py-3 rounded-lg border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer">
                {loadingMore
                  ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Loading…</>
                  : `Load More (${total - cities.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

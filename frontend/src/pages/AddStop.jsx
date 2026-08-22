import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stopsApi, citiesApi } from '../api';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

export default function AddStop() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [searchQuery,          setSearchQuery]          = useState('');
  const [selectedDestination,  setSelectedDestination]  = useState(null);
  const [customDestination,    setCustomDestination]    = useState('');
  const [duration,             setDuration]             = useState(3);
  const [accommodation,        setAccommodation]        = useState('');
  const [notes,                setNotes]                = useState('');
  const [arrivalDate,          setArrivalDate]          = useState('');
  const [departureDate,        setDepartureDate]        = useState('');

  const [cities,       setCities]       = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');

  // Load recommended cities on mount
  useEffect(() => {
    citiesApi.recommended({ limit: 8 })
      .then(data => setCities(data || []))
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  }, []);

  // Search cities when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      citiesApi.recommended({ limit: 8 })
        .then(data => setCities(data || []))
        .catch(() => {});
      return;
    }
    const timer = setTimeout(() => {
      setLoadingCities(true);
      citiesApi.list({ q: searchQuery, limit: 12 })
        .then(res => setCities(res.items || []))
        .catch(() => {})
        .finally(() => setLoadingCities(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (city) => {
    setSelectedDestination(city);
    setCustomDestination('');
    setSearchQuery('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const cityName = selectedDestination?.name || customDestination.trim();
    if (!cityName) { setError('Please select or enter a destination.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await stopsApi.create(tripId, {
        city_name:       cityName,
        country:         selectedDestination?.country || undefined,
        duration_nights: duration,
        accommodation:   accommodation || undefined,
        notes:           notes         || undefined,
        arrival_date:    arrivalDate   || undefined,
        departure_date:  departureDate || undefined,
      });
      navigate(`/trips/${tripId}/itinerary`);
    } catch (err) {
      setError(err.message || 'Failed to add stop.');
      setSubmitting(false);
    }
  };

  const cityName = selectedDestination?.name || customDestination || null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(`/trips/${tripId}/itinerary`)}
          className="p-2 hover:bg-surface-muted rounded-full transition-colors border border-surface-muted cursor-pointer">
          <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
        </button>
        <div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Add Next Stop</h2>
          <p className="text-sm text-on-surface-variant mt-1">Choose a destination for your next leg.</p>
        </div>
      </header>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Destination Selection */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {error && (
              <div className="px-4 py-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>{error}
              </div>
            )}

            <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface mb-3">Where are you heading next?</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[18px]">search</span>
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-muted bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Search cities..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCustomDestination(e.target.value);
                    setSelectedDestination(null);
                  }}
                />
              </div>

              {searchQuery && !selectedDestination && (
                <div className="mt-3 p-3 bg-surface-muted rounded-lg flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant font-semibold">
                    Custom city: <strong className="text-primary">"{customDestination}"</strong>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-secondary px-2 py-0.5 bg-accent-teal-light rounded">Custom</span>
                </div>
              )}
            </div>

            {/* City grid */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-on-surface">
                {searchQuery ? 'Search Results' : 'Recommended Destinations'}
              </h3>
              {loadingCities ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
                </div>
              ) : cities.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-6 text-center">No cities found.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {cities.map(city => {
                    const isSelected = selectedDestination?.id === city.id;
                    return (
                      <button key={city.id} type="button" onClick={() => handleSelect(city)}
                        className={`relative rounded-lg overflow-hidden h-24 text-left transition-all cursor-pointer border-2 group ${
                          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-outline-variant'
                        }`}>
                        {city.cover_image_url ? (
                          <img src={city.cover_image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-container/40 to-secondary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary/30 text-3xl">location_city</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{city.name}</p>
                            <p className="text-[10px] text-white/70">{city.country}</p>
                          </div>
                          {isSelected && (
                            <div className="ml-auto bg-primary rounded-full p-0.5">
                              <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Stop Details */}
          <div className="lg:col-span-5">
            <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm space-y-5 sticky top-6">
              <div className="flex items-center gap-2 pb-4 border-b border-surface-muted">
                <span className="material-symbols-outlined text-secondary">tune</span>
                <h3 className="text-lg font-bold text-on-surface">Stop Details</h3>
              </div>

              {cityName ? (
                <div className="flex items-center gap-2 bg-accent-teal-light/30 px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-secondary text-[18px]">location_on</span>
                  <span className="text-sm font-semibold text-on-surface">{cityName}</span>
                  {selectedDestination?.country && (
                    <span className="text-xs text-on-surface-variant">{selectedDestination.country}</span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-on-surface-variant bg-surface-muted px-3 py-2 rounded-lg">
                  Select a destination on the left
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-2">Duration (Nights)</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setDuration(Math.max(1, duration - 1))}
                    className="w-8 h-8 rounded-full border border-surface-muted flex items-center justify-center hover:bg-surface-muted transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="text-xl font-bold text-primary w-8 text-center">{duration}</span>
                  <button type="button" onClick={() => setDuration(duration + 1)}
                    className="w-8 h-8 rounded-full border border-surface-muted flex items-center justify-center hover:bg-surface-muted transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                  <span className="text-sm text-on-surface-variant">{duration === 1 ? 'night' : 'nights'}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Arrival</label>
                  <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Departure</label>
                  <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} min={arrivalDate}
                    className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Accommodation</label>
                <input type="text" value={accommodation} onChange={e => setAccommodation(e.target.value)}
                  placeholder="Hotel name or address..."
                  className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Visa requirements, must-do activities..."
                  className="w-full px-3 py-2 rounded-md border border-surface-muted bg-surface-pure text-sm focus:outline-none focus:border-primary resize-none" />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button type="submit" disabled={submitting || (!selectedDestination && !customDestination.trim())}
                  className="w-full py-3 rounded-lg bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  {submitting ? 'Adding…' : 'Add to Itinerary'}
                </button>
                <button type="button" onClick={() => navigate(`/trips/${tripId}/itinerary`)}
                  className="w-full py-2.5 rounded-lg border border-surface-muted text-on-surface text-sm font-semibold hover:bg-surface-muted transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

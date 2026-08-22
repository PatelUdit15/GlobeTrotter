import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsApi } from '../api';
import { useAuth } from '../context/AuthContext';

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

export default function SharedItinerary() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip,         setTrip]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [isCopied,     setIsCopied]     = useState(false);
  const [isSaved,      setIsSaved]      = useState(false);
  const [actionMsg,    setActionMsg]    = useState('');
  const [actionErr,    setActionErr]    = useState('');
  const [showFullPlan, setShowFullPlan] = useState(false);

  useEffect(() => {
    if (!tripId) { setError('No trip ID provided.'); setLoading(false); return; }
    tripsApi.getPublic(tripId)
      .then(data => {
        setTrip(data);
        // Fire view counter
        tripsApi.recordView(tripId).catch(() => {});
      })
      .catch(() => setError('This itinerary is not available or is not public.'))
      .finally(() => setLoading(false));
  }, [tripId]);

  const flash = (msg, isError = false) => {
    if (isError) setActionErr(msg);
    else         setActionMsg(msg);
    setTimeout(() => { setActionMsg(''); setActionErr(''); }, 3000);
  };

  const handleCopyTrip = async () => {
    if (!user) { navigate('/'); return; }
    try {
      const res = await tripsApi.copy(tripId);
      setIsCopied(true);
      flash('Trip copied to your account!');
      setTimeout(() => navigate(`/trips/${res.new_trip_id}/itinerary`), 1500);
    } catch (e) { flash(e.message || 'Copy failed.', true); }
  };

  const handleSaveTrip = async () => {
    if (!user) { navigate('/'); return; }
    try {
      await tripsApi.saveToMyTrips(tripId);
      setIsSaved(true);
      flash('Saved to your trips!');
    } catch (e) { flash(e.message || 'Save failed.', true); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/shared-itinerary/${tripId}`;
    try {
      await navigator.clipboard.writeText(url);
      flash('Link copied to clipboard!');
    } catch { flash('Share link: ' + url); }
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-[320px] rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (error || !trip) return (
    <div className="text-center py-24">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">lock</span>
      <h2 className="text-xl font-semibold text-on-surface mb-2">{error || 'Itinerary not found'}</h2>
      <p className="text-sm text-on-surface-variant mb-6">This itinerary may be private or no longer available.</p>
      <button onClick={() => navigate('/dashboard')}
        className="px-6 py-2.5 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:bg-primary transition-colors cursor-pointer">
        Back to Dashboard
      </button>
    </div>
  );

  const ownerName = trip.first_name && trip.last_name
    ? `${trip.first_name} ${trip.last_name}`
    : 'Unknown traveller';

  const startFmt = trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  const endFmt   = trip.end_date   ? new Date(trip.end_date).toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const dateStr  = startFmt && endFmt ? `${startFmt} - ${endFmt}` : startFmt || 'Dates TBD';

  const totalNights = (trip.stops || []).reduce((s, st) => s + (st.duration_nights || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="relative w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden shadow-sm border border-surface-muted">
        <div className="absolute inset-0">
          {trip.cover_image_url ? (
            <img src={trip.cover_image_url.startsWith('http') ? trip.cover_image_url : `http://localhost:5000${trip.cover_image_url}`}
              alt={trip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-container to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8 z-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-secondary/80 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">Public Itinerary</span>
              {trip.view_count > 0 && (
                <span className="text-white/80 text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  {trip.view_count.toLocaleString()} views
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{trip.title}</h1>
            {trip.description && <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">{trip.description}</p>}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-xs font-semibold">
              {(startFmt || endFmt) && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>{dateStr}
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">person</span>
                Curated by {ownerName}
              </div>
              {totalNights > 0 && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">hotel</span>
                  {totalNights} nights
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0 flex-wrap">
            {actionMsg && <span className="text-xs font-semibold text-white bg-secondary/70 px-3 py-1.5 rounded-full">{actionMsg}</span>}
            {actionErr && <span className="text-xs font-semibold text-white bg-red-500/80 px-3 py-1.5 rounded-full">{actionErr}</span>}
            <button onClick={handleCopyTrip} disabled={isCopied}
              className="bg-surface-pure text-primary px-5 py-2.5 rounded text-xs font-semibold hover:bg-surface-muted transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-80">
              <span className="material-symbols-outlined text-[18px]">{isCopied ? 'done' : 'content_copy'}</span>
              {isCopied ? 'Copied!' : 'Copy Trip'}
            </button>
            <button onClick={handleSaveTrip} disabled={isSaved}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2.5 rounded flex items-center gap-2 transition-colors border border-white/30 text-xs font-semibold cursor-pointer disabled:opacity-80">
              <span className="material-symbols-outlined text-[18px]" style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}>bookmark</span>
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={handleShare}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded flex items-center justify-center transition-colors border border-white/30 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Itinerary Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {(trip.stops || []).length === 0 ? (
            <div className="text-center py-12 bg-surface-pure rounded-xl border border-surface-muted">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">route</span>
              <p className="text-sm text-on-surface-variant">No stops added to this itinerary yet.</p>
            </div>
          ) : (
            (trip.stops || []).map((stop, idx) => {
              const stopActivities = stop.activities || [];
              const visibleActs    = showFullPlan ? stopActivities : stopActivities.slice(0, 3);

              return (
                <div key={stop.id} className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-muted">
                    <h2 className="text-xl font-bold text-primary flex items-baseline gap-2">
                      Stop {idx + 1} <span className="text-base font-semibold text-on-surface">{stop.city_name}{stop.country ? `, ${stop.country}` : ''}</span>
                    </h2>
                    <span className="text-xs font-semibold text-on-surface-variant bg-surface-muted px-2 py-1 rounded">
                      {stop.duration_nights} night{stop.duration_nights !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {stop.accommodation && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">hotel</span>
                      {stop.accommodation}
                    </div>
                  )}

                  {visibleActs.length === 0 ? (
                    <p className="text-sm text-on-surface-variant italic">No activities listed.</p>
                  ) : (
                    <div className="space-y-3">
                      {visibleActs.map(act => (
                        <div key={act.id} className="flex gap-3 p-3 bg-surface-container-low rounded-lg">
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
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {act.start_time}{act.end_time ? ` – ${act.end_time}` : ''}
                              </p>
                            )}
                            {act.description && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{act.description}</p>}
                            <span className="inline-block mt-1.5 text-[10px] font-semibold bg-surface-muted text-on-surface-variant px-2 py-0.5 rounded capitalize">{act.category}</span>
                          </div>
                        </div>
                      ))}
                      {!showFullPlan && stopActivities.length > 3 && (
                        <button onClick={() => setShowFullPlan(true)}
                          className="text-secondary text-sm font-semibold hover:underline cursor-pointer">
                          +{stopActivities.length - 3} more activities
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {(trip.stops || []).length > 0 && !showFullPlan && (
            <button onClick={() => setShowFullPlan(true)}
              className="w-full py-3 rounded-xl border border-surface-muted text-sm font-semibold text-on-surface hover:bg-surface-muted transition-colors cursor-pointer flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
              View Full Plan
            </button>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Route summary */}
          {(trip.stops || []).length > 0 && (
            <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
              <h3 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">route</span>
                Route Overview
              </h3>
              <div className="space-y-3">
                {(trip.stops || []).map((stop, i) => (
                  <div key={stop.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                      {i < trip.stops.length - 1 && <div className="w-0.5 h-6 bg-surface-muted mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-semibold text-on-surface">{stop.city_name}</p>
                      <p className="text-xs text-on-surface-variant">{stop.duration_nights} night{stop.duration_nights !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trip stats */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
            <h3 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
              Trip Highlights
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>Destinations
                </span>
                <span className="font-semibold">{(trip.stops || []).length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">hotel</span>Total Nights
                </span>
                <span className="font-semibold">{totalNights}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">local_activity</span>Activities
                </span>
                <span className="font-semibold">
                  {(trip.stops || []).reduce((s, st) => s + (st.activities?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>Views
                </span>
                <span className="font-semibold">{(trip.view_count || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button onClick={handleCopyTrip} disabled={isCopied}
              className="w-full py-3 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80">
              <span className="material-symbols-outlined text-[18px]">{isCopied ? 'done' : 'content_copy'}</span>
              {isCopied ? 'Copied to your trips!' : 'Copy This Trip'}
            </button>
            <button onClick={handleSaveTrip} disabled={isSaved}
              className="w-full py-3 rounded-xl border border-surface-muted text-on-surface text-sm font-semibold hover:bg-surface-muted transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80">
              <span className="material-symbols-outlined text-[18px]" style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}>bookmark</span>
              {isSaved ? 'Saved' : 'Save to My Trips'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

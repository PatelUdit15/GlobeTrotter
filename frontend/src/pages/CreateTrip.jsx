import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsApi, templatesApi, uploadsApi } from '../api';

const BADGE_COLORS = {
  Popular:    'bg-accent-teal-light text-on-secondary-container',
  Trending:   'bg-primary-fixed text-on-primary-fixed',
  Adventure:  'bg-tertiary-fixed text-on-tertiary-fixed',
  'Best Value':'bg-secondary-container text-on-secondary-container',
  Seasonal:   'bg-primary-container text-on-primary',
  New:        'bg-surface-container-high text-on-surface',
  Budget:     'bg-accent-teal-light text-on-secondary-container',
  Premium:    'bg-secondary text-on-secondary',
};

export default function CreateTrip() {
  const navigate = useNavigate();

  // form state
  const [tripName,      setTripName]      = useState('');
  const [startDate,     setStartDate]     = useState('');
  const [endDate,       setEndDate]       = useState('');
  const [tripDesc,      setTripDesc]      = useState('');
  const [coverFile,     setCoverFile]     = useState(null);
  const [coverPreview,  setCoverPreview]  = useState('');

  // template selection
  const [templates,          setTemplates]          = useState([]);
  const [selectedTemplate,   setSelectedTemplate]   = useState(null);
  const [selectedCategory,   setSelectedCategory]   = useState('All');
  const [categories,         setCategories]         = useState(['All']);
  const [loadingTemplates,   setLoadingTemplates]   = useState(true);

  // submission
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    templatesApi.list()
      .then(data => {
        setTemplates(data);
        const cats = ['All', ...new Set(data.map(t => t.category).filter(Boolean))];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  const applyTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    setTripName(tmpl.title);
    setTripDesc(tmpl.description || '');
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tripName.trim()) { setError('Trip name is required.'); return; }
    setError('');
    setSubmitting(true);

    try {
      let coverUrl = null;

      // Upload cover image if selected
      if (coverFile) {
        const uploaded = await uploadsApi.coverImage(coverFile);
        coverUrl = uploaded.url;
      }

      let trip;
      if (selectedTemplate) {
        // Create from template
        trip = await tripsApi.fromTemplate(selectedTemplate.id, {
          title:      tripName,
          start_date: startDate || undefined,
          end_date:   endDate   || undefined,
        });
      } else {
        // Create blank trip
        trip = await tripsApi.create({
          title:           tripName,
          description:     tripDesc  || undefined,
          cover_image_url: coverUrl  || undefined,
          start_date:      startDate || undefined,
          end_date:        endDate   || undefined,
        });
      }

      navigate(`/trips/${trip.id}/itinerary`);
    } catch (err) {
      setError(err.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">Plan a new trip</h1>
        <p className="text-base text-on-surface-variant leading-relaxed">
          Start by defining the core details, or choose a curated template below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-xl shadow-sm p-6 md:p-8 space-y-8">
        {error && (
          <div className="px-4 py-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        {/* Trip Essentials */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary border-b border-surface-muted pb-2">Trip Essentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold tracking-wider text-on-surface">Trip Name *</label>
              <div className="relative rounded-md overflow-hidden bg-surface-pure border border-surface-muted">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">flight_takeoff</span>
                </div>
                <input
                  className="block w-full pl-10 py-2.5 text-sm bg-transparent text-on-surface outline-none"
                  value={tripName}
                  onChange={e => setTripName(e.target.value)}
                  placeholder="e.g., Summer in Kyoto"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider text-on-surface">Start Date</label>
              <div className="relative rounded-md overflow-hidden bg-surface-pure border border-surface-muted">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_today</span>
                </div>
                <input type="date" className="block w-full pl-10 py-2.5 text-sm bg-transparent text-on-surface outline-none"
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider text-on-surface">End Date</label>
              <div className="relative rounded-md overflow-hidden bg-surface-pure border border-surface-muted">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">event</span>
                </div>
                <input type="date" className="block w-full pl-10 py-2.5 text-sm bg-transparent text-on-surface outline-none"
                  value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wider text-on-surface">Description (Optional)</label>
            <div className="rounded-md overflow-hidden bg-surface-pure border border-surface-muted">
              <textarea
                className="block w-full p-3 text-sm bg-transparent text-on-surface resize-none outline-none"
                value={tripDesc}
                onChange={e => setTripDesc(e.target.value)}
                placeholder="Describe the vibe of this trip…"
                rows="3"
              />
            </div>
          </div>
        </div>


        {/* Templates */}
        <section className="bg-surface-pure rounded-xl border border-surface-muted p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-muted pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">auto_awesome</span>
                <h2 className="text-xl font-semibold text-primary">Curated Trip Templates</h2>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">Select a template to jump-start your planning.</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    selectedCategory === cat ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-muted text-on-surface-variant hover:bg-surface-container-high'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-xl border border-surface-muted overflow-hidden">
                  <div className="animate-pulse bg-surface-muted h-36" />
                  <div className="p-4 space-y-2">
                    <div className="animate-pulse bg-surface-muted h-4 w-3/4 rounded" />
                    <div className="animate-pulse bg-surface-muted h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-8 text-center">No templates in this category.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTemplates.map(tmpl => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                const tagList = tmpl.tags ? tmpl.tags.split(',').filter(Boolean) : [];
                const badgeColor = BADGE_COLORS[tmpl.badge] || 'bg-surface-container-high text-on-surface';
                return (
                  <div key={tmpl.id} onClick={() => applyTemplate(tmpl)}
                    className={`rounded-xl border overflow-hidden flex flex-col transition-all cursor-pointer group hover:shadow-md ${
                      isSelected ? 'border-primary ring-2 ring-primary/20 bg-accent-teal-light/20' : 'border-surface-muted bg-surface-pure hover:border-outline-variant'
                    }`}>
                    <div className="h-36 bg-surface-muted relative"
                      style={tmpl.cover_image_url ? { backgroundImage: `url('${tmpl.cover_image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                      {!tmpl.cover_image_url && (
                        <div className="w-full h-full bg-gradient-to-br from-primary-container/40 to-secondary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary/30 text-5xl">map</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                      {tmpl.badge && (
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm shadow-sm ${badgeColor}`}>{tmpl.badge}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-primary text-on-primary text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check</span> Selected
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white text-xs font-semibold">
                        {tmpl.duration_days && (
                          <span className="flex items-center gap-1 drop-shadow-md">
                            <span className="material-symbols-outlined text-sm">schedule</span>{tmpl.duration_days} Days
                          </span>
                        )}
                        {tmpl.estimated_budget && (
                          <span className="flex items-center gap-1 drop-shadow-md">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            ${parseFloat(tmpl.estimated_budget).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-primary group-hover:text-secondary transition-colors">{tmpl.title}</h3>
                        {tmpl.description && <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">{tmpl.description}</p>}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-surface-muted gap-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {tagList.slice(0,3).map(tag => (
                            <span key={tag} className="bg-surface-muted text-on-surface-variant text-[10px] font-medium px-2 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                        <button type="button" onClick={e => { e.stopPropagation(); applyTemplate(tmpl); }}
                          className={`text-xs font-semibold tracking-wider px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                            isSelected ? 'bg-secondary text-on-secondary' : 'text-secondary hover:bg-accent-teal-light'
                          }`}>
                          {isSelected ? 'Applied' : 'Use Template'}
                          <span className="material-symbols-outlined text-xs">{isSelected ? 'done' : 'arrow_forward'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="pt-6 flex justify-end gap-4 border-t border-surface-muted">
          <button type="button" onClick={() => navigate('/trips')}
            className="px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wider text-on-surface hover:bg-surface-muted transition-colors border border-surface-muted cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wider bg-primary-container text-on-primary hover:bg-primary transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60">
            {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
            {submitting ? 'Creating…' : 'Save & Continue'}
            {!submitting && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
          </button>
        </div>
      </form>
    </div>
  );
}

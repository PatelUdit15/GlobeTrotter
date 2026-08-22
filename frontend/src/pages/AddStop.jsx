import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const recommendedDestinations = [
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANh5FPrRNHeRdT7yNojPAWY9FV6b6jsU8RShN_pEDF6hK47Kx19dgXG7kkW9P4qA8Zsafisgud1j5pu65sGGQ2draYlkKBheEHol6j_AyHEdv-UFzF3jdvtVXNLcF5ilYVM9UvTp8t-nzKb1vWGGU878W0qcZk1_es2-YHeKiqMWuBHzUWJUYzD8Lo1McIAg9job_OLbqDs3rDFfpiRNBDrWkzxF4m1VrDfMtt6x2K_c7E3u2vT5c',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQqlmTq7Bz6vsdtdCs34kuiF5YfgOuwXAlNEuh5SYCQ0KivuxagMgzzimjwDT-c5f8ghThsImmB6Bzvq-MjHsDwKccXgOuttkYTV-MGjiIgy2GjSGIFlPf2meAYqA9dwFiCS8WZD8T-HqTYdQSX_288CqLu5f909hDfh_TCgC8nrLwAQPfyoYGHEajc9S_mxCi0OizY3IkvBSp52P7WXmVSPmQ5gmQlmNCHDrkqp_sj7bTqMxKxeM',
  },
  {
    name: 'London',
    country: 'United Kingdom',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnlASTwACLzm0hxnC9jHskpyxWJ0v7D0esVk543Ym_N88vCAvCLenqL_G2REUUe9vV0PmUx5ZdKxDAOs_8lJeAMQNVPoKawMaY9gkRpYVK01Ws_zbwjRAYy5tqb-IQ1KLaTphTxo9AputYmOifqJG0wpBSV9Og1u1jwj0aelIU62Q3-YKq_yG6Xx2RKmrBgMRtaFVpstOei8YR65beGZMCi7sUk4gPnFJKhH8D5xHWPuQTw0cbQHI',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApoxKJoTXnnXxGwPkYMsSBf7tT4T6hKGu5MkO-TFCS-WqQO51srAU146OjaSfNDOL4DhXLcqvf6hSxpRQVdpC93GQpKr41p6aM0drd-BPFfCJvbMmF6DOIz75_R0Bg4Z-axAKQfbDy0Xr6Ju1PLqSiqyEsjL3Mtm1o5ypwl8DeNX7yYnZG8NNm7_U5h5Rd8saMnxaXHILk0EcXExWQ9vhL_e63zCjp5UMK2M82EyHEUPw95rC1w4c',
  },
];

export default function AddStop() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [duration, setDuration] = useState(3);
  const [accommodation, setAccommodation] = useState('');
  const [notes, setNotes] = useState('');
  const [customDestination, setCustomDestination] = useState('');

  const handleSelect = (dest) => {
    setSelectedDestination(dest);
    setCustomDestination('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate saving the stop
    alert(`Successfully added stop: ${selectedDestination ? selectedDestination.name : customDestination} to your itinerary!`);
    navigate(`/trips/${id}/itinerary`);
  };

  const filteredDestinations = recommendedDestinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/trips/${id}/itinerary`)}
          className="p-2 hover:bg-surface-muted rounded-full transition-colors flex items-center justify-center border border-surface-muted cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
        </button>
        <div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Add Next Stop</h2>
          <p className="text-sm text-on-surface-variant mt-1">Design the next destination of your journey.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Destination Selection */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Search Destination */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-3">Where are you heading next?</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[18px]">search</span>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-muted bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                placeholder="Search or enter a custom city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCustomDestination(e.target.value);
                  setSelectedDestination(null);
                }}
              />
            </div>

            {searchQuery && !selectedDestination && (
              <div className="mt-4 p-3 bg-surface-muted rounded-lg flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Use custom input: <strong className="text-primary">"{customDestination}"</strong>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary px-2 py-0.5 bg-accent-teal-light rounded">Custom Stop</span>
              </div>
            )}
          </div>

          {/* Recommended Grid */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-wider text-outline uppercase">Recommended Destinations</h4>
            <div className="grid grid-cols-2 gap-4">
              {filteredDestinations.map((dest) => {
                const isSelected = selectedDestination?.name === dest.name;
                return (
                  <div
                    key={dest.name}
                    onClick={() => handleSelect(dest)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer group h-36 border transition-all ${
                      isSelected
                        ? 'border-secondary ring-2 ring-secondary'
                        : 'border-surface-muted hover:shadow-md'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-103"
                      style={{ backgroundImage: `url('${dest.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 z-10 text-white">
                      <p className="text-[10px] font-bold text-secondary tracking-wider uppercase">{dest.country}</p>
                      <h5 className="text-sm font-bold">{dest.name}</h5>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-md">
                        <span className="material-symbols-outlined text-[16px]">done</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Stop Details & Save Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSave} className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-lg font-bold text-on-surface border-b border-surface-muted pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">assignment</span> Stop details
            </h3>

            {/* Selected Stop Badge */}
            <div className="p-4 bg-surface rounded-lg border border-surface-muted flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-3xl">location_city</span>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Target Destination</p>
                <h4 className="text-base font-bold text-on-surface">
                  {selectedDestination ? `${selectedDestination.name}, ${selectedDestination.country}` : customDestination || 'No destination selected'}
                </h4>
              </div>
            </div>

            {/* Duration / Nights */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Duration (Nights)</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  className="w-10 h-10 border border-surface-muted rounded-lg flex items-center justify-center hover:bg-surface-muted cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">remove</span>
                </button>
                <span className="text-lg font-bold text-primary w-12 text-center">{duration}</span>
                <button
                  type="button"
                  onClick={() => setDuration(duration + 1)}
                  className="w-10 h-10 border border-surface-muted rounded-lg flex items-center justify-center hover:bg-surface-muted cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">add</span>
                </button>
              </div>
            </div>

            {/* Accommodation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Planned Accommodation (Optional)</label>
              <input
                type="text"
                className="w-full px-3.5 py-2 border border-surface-muted rounded-lg bg-surface text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-outline-variant"
                placeholder="e.g. Grand Plaza Hotel"
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Notes / Plans</label>
              <textarea
                rows="3"
                className="w-full px-3.5 py-2 border border-surface-muted rounded-lg bg-surface text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-outline-variant resize-none"
                placeholder="e.g. Visit canals, museums, rent bikes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Save Actions */}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate(`/trips/${id}/itinerary`)}
                className="flex-1 py-2.5 border border-surface-muted text-on-surface-variant hover:bg-surface-muted rounded-lg text-xs font-semibold tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedDestination && !customDestination}
                className="flex-1 py-2.5 bg-primary-container text-on-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold tracking-wider transition-opacity shadow-sm cursor-pointer"
              >
                Add Stop
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

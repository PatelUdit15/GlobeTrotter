import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tripSuggestions = [
  {
    id: 'paris-riviera',
    title: 'Romantic Paris & French Riviera',
    category: 'Romantic',
    duration: '7 Days',
    estBudget: '$2,800',
    badge: 'Trending',
    badgeColor: 'bg-primary-fixed text-on-primary-fixed',
    description: 'Stroll by the Seine, explore the Louvre, and unwind along the azure Mediterranean coastline.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-fEHTGNWWB5-CKeMkCY7kGhbont-9Zr-IH3snu7XCvzedILzs4MJ7FeJjm9iqwzGxiZlcZCtr9RZEy-YpG4FyB1-RpvGXTq9iGiquWMLVrfzr3PSbCSA2W084rYMDt1s5yI_E3wmZrgWDKJzfRL5xlvt_aWpxJbpJyEHg2jQ7i1N7c8B8SVPOnqD1Z_zl9sdhh4Zjv6lXksQaDiSEOSFweixRf5UbAmfszDqM151N3jF_An_Jc3g',
    tags: ['Sightseeing', 'Culture', 'Coastal'],
  },
  {
    id: 'japan-odyssey',
    title: 'Tokyo & Kyoto Cultural Odyssey',
    category: 'Popular',
    duration: '10 Days',
    estBudget: '$3,400',
    badge: 'Popular',
    badgeColor: 'bg-accent-teal-light text-on-secondary-container',
    description: 'Modern neon cityscapes, historic bamboo groves, ancient shrines, and authentic culinary journeys.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF6u1yZRm7t5PrORh-qdsPzwuOnWK1gy89Jrd677FOMQ3ogc_qfPYovAgeAifDGZ7gQBK1ivr3gua0A1LWxbooueAHcgG-aiKwgvrqMGQQDKC_YPc_mNT7MjmuvYx7rWoN8j-ubvDXRQfEwqE_MtM-VPMnMbHLOJ047ACfRVAeb8QJE2uW3awvyIJlwsVAfW2by6hQlbMRq64wdCwlotYlaiPIVMWQOiPae1J0ECLv5AoxnNHxcOM',
    tags: ['Temples', 'Food', 'Bullet Train'],
  },
  {
    id: 'swiss-alps',
    title: 'Swiss Alps Mountain Escape',
    category: 'Adventure',
    duration: '5 Days',
    estBudget: '$2,200',
    badge: 'Adventure',
    badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
    description: 'Scenic alpine train journeys, glacier hiking, crystalline lakes, and cozy mountain chalet retreats.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbcgJVd2HCe9GXm3-QyZrkiHK8GM6MD4W84JkE2ut9PB0CYC_aV41L2braz2y9Zs75skQShTaQDgmNuC1jdm4Ulz3QwtzfXwZCVvpngcJsGKKjPNXlL5a9dxcNyL35ycwx0KISpsExBa4IBuDyo3Mfyle_EC0_pbxVEEhF1GGUNEMk03Npl8wgsjq8rtztnp16IuQAbnF9r8wfAbRzFSeQ1WjUiOBlStfCxmTf79SkANq_0pzAH7A',
    tags: ['Hiking', 'Nature', 'Glaciers'],
  },
  {
    id: 'bali-wellness',
    title: 'Bali Tropical Island Retreat',
    category: 'Relaxation',
    duration: '8 Days',
    estBudget: '$1,650',
    badge: 'Best Value',
    badgeColor: 'bg-secondary-container text-on-secondary-container',
    description: 'Lush rice terraces, pristine beaches, vibrant wellness retreats, and magical sunset ocean temples.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH87C1nG5VK8r9m-LoTQv_WGoI8BJpyANPt5Xj1s_-xA-PCgm9zwl0X_tU8dceBFUUCNuzsJBQ1cnvxnck5mzNVIKH_r-eEsrmKtp8T6NimY4V2RtEDYUaVsFbPogOerGIdi96wZWTo1LcUUxqjIGXKUGAPxy5iAVVvA_h1Wfp0-ZfHzajME06NW_qHNe2R9jo2MZyrJznA42rxL6afW0zv6bv-daPmYJsXuDAbfoF3SrTBGT6SjA',
    tags: ['Beach', 'Wellness', 'Surfing'],
  },
];

const suggestionCategories = ['All', 'Popular', 'Adventure', 'Romantic', 'Relaxation'];

const inspirationDestinations = [
  {
    name: 'Amalfi Coast',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXfiCK9FJyGx9ocqAW86dv37S5rt3n5BFqujilDODqFXt1V5mqDYqeeGtdm321yLiWShC0l9-wEex_Y7aMsTm5es0QPfc26pJ-NpVVTSBuxfiOOCHnOizYSFhC6nxG37es9d8gfmIaJZ5dj4PXpHWnLjhynqlUTKl8nI5tbhI1X7tnF0KacP22_qbildHoAQlHGDJaSDWgqzpAEXaG6TuVJbqiOztGpvXouJs5mmHJQAUEmGcvv1I',
  },
  {
    name: 'Kyoto, Japan',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGX3VOMCbkm5VzI5Daa734HAqbOMpMGOgzxURkzkKcdE1WnEd3couriBiidQv4VP-su6K_-hydA_NdSpRkKTY9C_CPocsZPUDCE6xqatoEs_KAYvQqkba111tYzjfKrGAy9n8lbV2hh8s0TmoiRlZKBmzrytABgzRbYTTC6ZgeiNgAHyA0E3up51lj5Rll03KsO0hU_eot69lyvTq7c8f8lO0T4rUb-thBlcMd4VbnrDyMrxgxHqs',
  },
  {
    name: 'Marrakech',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTuCuZoB_ukOFhKj7zllslojDX43JSUPCeY5nlML3fIJkuCyCxm_Nr55pbplYha-y_ydLSxWvBpQcISm_QyL6WZrXy8rRxBwgivE8jpxhojCmja4UAs892zhuWfXO8NMGsWeP2oDF6n0xT9cKkxCGlgyZLfpfOIgH8xofzqLm4fIqZjALeRyRn1isdep_Xaratb5n-Nd99SessEnQsJiLuVWD1k2vCcT49fUcg8A5XYtpjpPP6zoQ',
  },
  {
    name: 'Reykjavik',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaAypOZmi2Gy4FAyGKQoG4lP1nPuOFBWi5WvOofy5aJdmxQwVwb1GQH7HVeG6tWPNFQySPHsiby2UwI8LNBuQIcwVqBFiP2FyHACKtbpXN2h6w422CWeJNvlfnN-lH21WJsmGRVQ4g2RP3lOYmQ6ESeU1k1t9BFc04BaVG49DhH41HfE_DiVQHBEX6f2FfsHHqXS19yWsNklj0A4sE7nDARsgw07DZoGYW1A1UAuFv9j4F2MjfJF4',
  },
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripDesc, setTripDesc] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const applySuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion.id);
    setTripName(suggestion.title);
    setTripDesc(suggestion.description);
  };

  const filteredSuggestions =
    selectedCategory === 'All'
      ? tripSuggestions
      : tripSuggestions.filter((s) => s.category === selectedCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/trips/1/itinerary');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">Plan a new trip</h1>
        <p className="text-base text-on-surface-variant leading-relaxed">
          Start by defining the core details of your next adventure, or choose a curated trip suggestion.
        </p>
      </div>



      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-card rounded-xl shadow-sm p-6 md:p-8 space-y-8">
        {/* Trip Essentials */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary border-b border-surface-muted pb-2">Trip Essentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold tracking-wider text-on-surface" htmlFor="trip-name">
                Trip Name
              </label>
              <div className="relative input-glow rounded-md overflow-hidden bg-surface-pure border border-surface-muted transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">flight_takeoff</span>
                </div>
                <input
                  className="block w-full pl-10 py-2.5 text-sm border-0 focus:ring-0 bg-transparent text-on-surface placeholder-on-surface-variant outline-none"
                  id="trip-name"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="e.g., Summer in Kyoto"
                  type="text"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider text-on-surface" htmlFor="start-date">
                Start Date
              </label>
              <div className="relative input-glow rounded-md overflow-hidden bg-surface-pure border border-surface-muted transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_today</span>
                </div>
                <input
                  className="block w-full pl-10 py-2.5 text-sm border-0 focus:ring-0 bg-transparent text-on-surface outline-none"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  type="date"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider text-on-surface" htmlFor="end-date">
                End Date
              </label>
              <div className="relative input-glow rounded-md overflow-hidden bg-surface-pure border border-surface-muted transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">event</span>
                </div>
                <input
                  className="block w-full pl-10 py-2.5 text-sm border-0 focus:ring-0 bg-transparent text-on-surface outline-none"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  type="date"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wider text-on-surface" htmlFor="trip-desc">
              Trip Description (Optional)
            </label>
            <div className="input-glow rounded-md overflow-hidden bg-surface-pure border border-surface-muted transition-all duration-200">
              <textarea
                className="block w-full p-3 text-sm border-0 focus:ring-0 bg-transparent text-on-surface placeholder-on-surface-variant resize-none outline-none"
                id="trip-desc"
                value={tripDesc}
                onChange={(e) => setTripDesc(e.target.value)}
                placeholder="Briefly describe the goal or vibe of this trip..."
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary border-b border-surface-muted pb-2">Cover Photo</h2>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-muted border-dashed rounded-lg bg-surface-bright hover:bg-surface-muted/50 transition-colors cursor-pointer group">
            <div className="space-y-1 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
                add_photo_alternate
              </span>
              <div className="flex text-sm text-on-surface justify-center mt-2">
                <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-container" htmlFor="file-upload">
                  <span>Upload a file</span>
                  <input className="sr-only" id="file-upload" name="file-upload" type="file" />
                </label>
                <p className="pl-1 text-on-surface-variant">or drag and drop</p>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Trip Suggestions Section */}
        <section className="bg-surface-pure rounded-xl border border-surface-muted p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-muted pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">auto_awesome</span>
                <h2 className="text-xl font-semibold text-primary">Curated Trip Suggestions</h2>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">
                Select a pre-designed itinerary template to jump-start your planning.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {suggestionCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${selectedCategory === cat
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'bg-surface-muted text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSuggestions.map((suggestion) => {
              const isSelected = selectedSuggestion === suggestion.id;
              return (
                <div
                  key={suggestion.id}
                  onClick={() => applySuggestion(suggestion)}
                  className={`rounded-xl border overflow-hidden flex flex-col transition-all cursor-pointer group hover:shadow-md ${isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-accent-teal-light/20'
                    : 'border-surface-muted bg-surface-pure hover:border-outline-variant'
                    }`}
                >
                  {/* Image & Badges */}
                  <div
                    className="h-36 bg-surface-muted relative"
                    style={{
                      backgroundImage: `url('${suggestion.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm shadow-sm ${suggestion.badgeColor}`}
                      >
                        {suggestion.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-primary text-on-primary text-[10px] font-semibold tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-xs">check</span>
                        Selected
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white text-xs font-semibold">
                      <span className="flex items-center gap-1 drop-shadow-md">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {suggestion.duration}
                      </span>
                      <span className="flex items-center gap-1 drop-shadow-md">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        {suggestion.estBudget}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-primary group-hover:text-secondary transition-colors">
                        {suggestion.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>

                    {/* Tags & Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-surface-muted gap-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {suggestion.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-surface-muted text-on-surface-variant text-[10px] font-medium px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          applySuggestion(suggestion);
                        }}
                        className={`text-xs font-semibold tracking-wider px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${isSelected
                          ? 'bg-secondary text-on-secondary'
                          : 'text-secondary hover:bg-accent-teal-light'
                          }`}
                      >
                        {isSelected ? 'Applied' : 'Use Template'}
                        <span className="material-symbols-outlined text-xs">
                          {isSelected ? 'done' : 'arrow_forward'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Popular Destinations Inspiration */}
        {/* <div className="space-y-6 pt-4">
          <h2 className="text-xl font-semibold text-primary border-b border-surface-muted pb-2">Destinations Inspiration</h2>
          <p className="text-sm text-on-surface-variant mb-4">Explore popular regional travel destinations.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inspirationDestinations.map((dest) => (
              <div
                key={dest.name}
                onClick={() => setTripName(`Trip to ${dest.name}`)}
                className="relative rounded-lg overflow-hidden h-32 group cursor-pointer border border-surface-muted hover:shadow-md transition-all hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                <img className="w-full h-full object-cover absolute inset-0" src={dest.image} alt={dest.name} />
                <div className="absolute bottom-2 left-2 z-20">
                  <span className="text-white text-xs font-semibold tracking-wider drop-shadow-md">{dest.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Actions */}
        <div className="pt-6 flex justify-end gap-4 border-t border-surface-muted">
          <button
            onClick={() => navigate('/trips')}
            className="px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wider text-on-surface hover:bg-surface-muted transition-colors border border-surface-muted cursor-pointer"
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wider bg-primary-container text-on-primary hover:bg-primary transition-colors flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
            type="submit"
          >
            Save &amp; Continue
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}

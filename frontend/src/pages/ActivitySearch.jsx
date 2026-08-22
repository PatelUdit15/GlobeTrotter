import { useState } from 'react';

const activitiesData = [
  {
    id: 1,
    name: 'Shibuya Crossing & Hachiko',
    category: 'Sightseeing',
    rating: '4.8',
    description: "Experience the organized chaos of the world's busiest intersection and visit the famous loyal dog statue.",
    duration: '1-2 hours',
    cost: 'Free',
    costValue: 0,
    durationValue: '1-2 hours',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU97t6f8XjBZU7eG_FfBi9w1WeARgMS8k9nHZSKIfwzAovUpgzyo2ZHgjvE_YATLhN62g68rZwtA4jn-t-dgKYFisITSKkfDBiEsxg36u9nntn_G3RYpeD3wCDR6udhmlp_JeisjBbUqPKhihkb7a-QcUwLhNJYaM9jVCNc_98V8yarOO34hxrUq2LdEIl-V-77xzkTUNBH1kk3BYg7F9PexHUoT_DfUM97Y6MWSg3ozt617bRDLk',
  },
  {
    id: 2,
    name: 'Tsukiji Outer Market Tasting',
    category: 'Food Tours',
    rating: '4.9',
    description: 'Sample fresh seafood, tamagoyaki, and local street food in this historic bustling market area.',
    duration: 'Half day',
    cost: '$$',
    costValue: 50,
    durationValue: 'Half day',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIkE0JTYqX6huoSshLlM1S87I-TWS4gdlL2JADuXicCmLeOMe_tBxOpXDv58aQ0iXwzHGkfgf_RilJUForDYFPxujI4Jyf78X6fq3WQ8S_eAkdT58K0RiNLtNEON5r8hMwR1fmo6iTgsXg5VjV4sYnAueLgfGFi1tqyTC8wlsx0EyArNVqshaRg5WcjcWKazcbSVuxWhmFjq78wS-qDS9PB_7FnqnDQ-KMD5UWc8-JOoFg99CMzAo',
  },
  {
    id: 3,
    name: 'Mt. Fuji Day Trip',
    category: 'Adventure',
    rating: '4.7',
    description: 'Guided coach tour to the 5th station, Hakone ropeway, and a scenic pirate ship cruise on Lake Ashi.',
    duration: 'Full day',
    cost: '$$$',
    costValue: 120,
    durationValue: 'Full day',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5ggVEmrYJN0aX_ucjM3dHxYMkrDSZqrG2AbkPjxRD3n4tkJZkIcR6_SnaOBg4icoBrilhXmz_i_2vAm4tBVGDDJe0_gvxvBc_Me7v5BW7INh1UCZ4I6StCpsErAxpyH1-olrMH3rBJpgjCG2RFt0xjiQrekBYi0MU2zmxaYQozys0RiLBZHBF3Ayk1GrzrybrYhAXfxo5Ew4TYCyZVQ-dZaWgEh4M2GWBww4msGpB7sd9AO9yX-Y',
  },
];

const categories = ['All', 'Sightseeing', 'Food Tours', 'Adventure', 'Culture'];

export default function ActivitySearch() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [costFilter, setCostFilter] = useState('Any');
  const [durationFilter, setDurationFilter] = useState('Any');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedActivities, setAddedActivities] = useState([3]); // Mt. Fuji added by default as in screen mockup

  const toggleActivity = (id) => {
    if (addedActivities.includes(id)) {
      setAddedActivities(addedActivities.filter(item => item !== id));
    } else {
      setAddedActivities([...addedActivities, id]);
    }
  };

  const filteredActivities = activitiesData.filter(act => {
    const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
    
    let matchesCost = true;
    if (costFilter === '$ (Under $25)') {
      matchesCost = act.costValue < 25;
    } else if (costFilter === '$$ ($25 - $100)') {
      matchesCost = act.costValue >= 25 && act.costValue <= 100;
    } else if (costFilter === '$$$ (Over $100)') {
      matchesCost = act.costValue > 100;
    }

    const matchesDuration = durationFilter === 'Any' || act.durationValue === durationFilter;

    const matchesSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCost && matchesDuration && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Context Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Discover Tokyo</h2>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mt-2">
            Browse and add activities to your itinerary. Filter by your interests to find the perfect experiences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-surface-pure border border-surface-muted rounded text-on-background text-xs font-semibold tracking-wider flex items-center gap-2 hover:bg-surface-muted transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">map</span>
            Map View
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-surface-pure p-4 rounded-xl border border-surface-muted flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-primary-container text-on-primary border-transparent'
                    : 'bg-surface-muted text-primary border-transparent hover:bg-surface-variant'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          {/* Search bar inside filters for standalone page utility */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input 
              className="pl-9 pr-4 py-2 bg-surface border border-surface-muted rounded-full focus:border-primary focus:ring-1 focus:ring-primary text-sm w-full transition-all text-on-surface placeholder:text-outline-variant outline-none" 
              placeholder="Search activities..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2 border-r border-surface-muted pr-3">
              <span className="text-on-surface-variant text-xs font-bold tracking-wider">Cost:</span>
              <select 
                value={costFilter}
                onChange={(e) => setCostFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold py-1 pr-6 focus:ring-0 cursor-pointer outline-none text-primary"
              >
                <option>Any</option>
                <option>$ (Under $25)</option>
                <option>$$ ($25 - $100)</option>
                <option>$$$ (Over $100)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-xs font-bold tracking-wider">Duration:</span>
              <select 
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold py-1 pr-6 focus:ring-0 cursor-pointer outline-none text-primary"
              >
                <option>Any</option>
                <option>1-2 hours</option>
                <option>Half day</option>
                <option>Full day</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Results */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const isAdded = addedActivities.includes(act.id);
            return (
              <div 
                key={act.id} 
                className={`bg-surface-pure rounded-xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${
                  isAdded ? 'border-primary shadow-[0_0_0_2px_rgba(113,75,103,0.2)]' : 'border-surface-muted'
                }`}
              >
                <div className="relative h-48 w-full bg-surface-muted">
                  <img 
                    className="w-full h-full object-cover" 
                    alt={act.name} 
                    src={act.image}
                  />
                  <div className="absolute top-3 right-3 bg-surface-pure/90 backdrop-blur-sm px-2 py-1 rounded text-primary text-[10px] font-bold tracking-wider shadow-sm uppercase">
                    {act.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-on-background line-clamp-1">{act.name}</h3>
                    <div className="flex items-center shrink-0">
                      <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-secondary ml-1">{act.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 flex-grow">{act.description}</p>
                  <div className="flex items-center gap-4 mb-4 text-on-surface-variant text-[11px] font-semibold tracking-wider">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {act.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">payments</span> {act.cost}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-surface-muted">
                    <button className="text-primary text-xs font-bold tracking-wider hover:underline cursor-pointer">Quick View</button>
                    {isAdded ? (
                      <button 
                        onClick={() => toggleActivity(act.id)}
                        className="bg-surface-muted text-primary px-4 py-1.5 rounded flex items-center gap-1 text-xs font-bold tracking-wider hover:bg-surface-variant transition-colors border border-surface-muted cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span> Added
                      </button>
                    ) : (
                      <button 
                        onClick={() => toggleActivity(act.id)}
                        className="bg-primary-container text-on-primary px-4 py-1.5 rounded flex items-center gap-1 text-xs font-bold tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-pure rounded-xl border border-surface-muted">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">search_off</span>
          <p className="text-sm font-semibold text-on-surface-variant">No activities found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

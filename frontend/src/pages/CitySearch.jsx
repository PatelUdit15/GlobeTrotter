import { useState } from 'react';

const citiesData = [
  {
    id: 1,
    name: 'New York City',
    country: 'United States',
    popularity: 'Highly Popular',
    description: 'Tech and cultural hub known for its iconic skyscrapers, broadway shows, and central park.',
    cost: 3, // out of 4 dollars
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQqlmTq7Bz6vsdtdCs34kuiF5YfgOuwXAlNEuh5SYCQ0KivuxagMgzzimjwDT-c5f8ghThsImmB6Bzvq-MjHsDwKccXgOuttkYTV-MGjiIgy2GjSGIFlPf2meAYqA9dwFiCS8WZD8T-HqTYdQSX_288CqLu5f909hDfh_TCgC8nrLwAQPfyoYGHEajc9S_mxCi0OizY3IkvBSp52P7WXmVSPmQ5gmQlmNCHDrkqp_sj7bTqMxKxeM',
    region: 'North America',
    featured: true,
  },
  {
    id: 2,
    name: 'San Francisco',
    country: 'United States',
    popularity: 'Popular',
    description: 'Tech hub known for its iconic golden gate bridge, steep hills, and rolling fog.',
    cost: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApoxKJoTXnnXxGwPkYMsSBf7tT4T6hKGu5MkO-TFCS-WqQO51srAU146OjaSfNDOL4DhXLcqvf6hSxpRQVdpC93GQpKr41p6aM0drd-BPFfCJvbMmF6DOIz75_R0Bg4Z-axAKQfbDy0Xr6Ju1PLqSiqyEsjL3Mtm1o5ypwl8DeNX7yYnZG8NNm7_U5h5Rd8saMnxaXHILk0EcXExWQ9vhL_e63zCjp5UMK2M82EyHEUPw95rC1w4c',
    region: 'North America',
  },
  {
    id: 3,
    name: 'Kyoto',
    country: 'Japan',
    popularity: 'Recommended',
    description: 'Historic city famous for classical Buddhist temples, gardens, and imperial palaces.',
    cost: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANh5FPrRNHeRdT7yNojPAWY9FV6b6jsU8RShN_pEDF6hK47Kx19dgXG7kkW9P4qA8Zsafisgud1j5pu65sGGQ2draYlkKBheEHol6j_AyHEdv-UFzF3jdvtVXNLcF5ilYVM9UvTp8t-nzKb1vWGGU878W0qcZk1_es2-YHeKiqMWuBHzUWJUYzD8Lo1McIAg9job_OLbqDs3rDFfpiRNBDrWkzxF4m1VrDfMtt6x2K_c7E3u2vT5c',
    region: 'Asia',
  },
  {
    id: 4,
    name: 'Rome',
    country: 'Italy',
    popularity: 'Highly Popular',
    description: 'Sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture and culture on display.',
    cost: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnlASTwACLzm0hxnC9jHskpyxWJ0v7D0esVk543Ym_N88vCAvCLenqL_G2REUUe9vV0PmUx5ZdKxDAOs_8lJeAMQNVPoKawMaY9gkRpYVK01Ws_zbwjRAYy5tqb-IQ1KLaTphTxo9AputYmOifqJG0wpBSV9Og1u1jwj0aelIU62Q3-YKq_yG6Xx2RKmrBgMRtaFVpstOei8YR65beGZMCi7sUk4gPnFJKhH8D5xHWPuQTw0cbQHI',
    region: 'Europe',
  },
  {
    id: 5,
    name: 'Vancouver',
    country: 'Canada',
    popularity: 'Recommended',
    description: 'A bustling west coast seaport in British Columbia, among Canada’s densest, most ethnically diverse cities.',
    cost: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxypExQW4WXxM3Ye0rzzYX1--JBetpnoyjKD6D4YW42b-ebayAtt92ZwgFZKDk8B9H5YhQKToymMvmFFNB4-cjiw1Z3sEFBkyEHYnbc2FZxoLVRUeGoHbX1oknTPw7x4KM4tyUTNVx5DfBj8QNbrMRV5qZlrlbX0sqvysON_BkyP3ZaLINvdF4njwLBTDbiw5vi5xDJLC0wqNPVuBzPXvMct1WcUnWIz40P9cjouNbZ9Btp9EQ33Q',
    region: 'North America',
  },
];

const regions = ['All', 'Europe', 'Asia', 'North America', 'South America'];

export default function CitySearch() {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedCities, setAddedCities] = useState([]);

  const toggleCity = (id) => {
    if (addedCities.includes(id)) {
      setAddedCities(addedCities.filter(item => item !== id));
    } else {
      setAddedCities([...addedCities, id]);
    }
  };

  const filteredCities = citiesData.filter(city => {
    const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          city.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const renderCostSymbol = (costLevel) => {
    const symbols = [];
    for (let i = 0; i < 4; i++) {
      symbols.push(
        <span 
          key={i} 
          className={`material-symbols-outlined text-[16px] ${i < costLevel ? 'text-secondary' : 'text-surface-variant'}`}
        >
          attach_money
        </span>
      );
    }
    return symbols;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Find Destinations</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-2">Discover and add cities to your next adventure.</p>
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
          {regions.map(reg => {
            const isActive = selectedRegion === reg;
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-colors cursor-pointer border ${
                  isActive
                    ? 'border-primary bg-accent-teal-light text-primary'
                    : 'border-outline-variant bg-surface-pure text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {reg}
              </button>
            );
          })}
        </div>
      </header>

      {/* Search Bar Area */}
      <div className="relative w-full max-w-3xl mx-auto mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-outline text-[20px]">search</span>
        </div>
        <input 
          className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-surface-muted bg-surface-pure text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow shadow-sm placeholder:text-outline-variant outline-none" 
          placeholder="Search cities, countries, or regions..." 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="absolute right-2 top-1.5 bottom-1.5 px-6 bg-primary-container text-on-primary rounded-lg text-xs font-semibold tracking-wider hover:bg-primary transition-colors cursor-pointer">
          Search
        </button>
      </div>

      {/* Bento Grid Results */}
      {filteredCities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => {
            const isAdded = addedCities.includes(city.id);
            if (city.featured) {
              return (
                <div 
                  key={city.id} 
                  className="md:col-span-2 relative rounded-2xl overflow-hidden group min-h-[300px] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                    style={{ backgroundImage: `url('${city.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10 text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-accent-teal-light/20 backdrop-blur-md border border-accent-teal-light/30 text-accent-teal-light text-[9px] font-bold tracking-wider uppercase">{city.country}</span>
                        <span className="flex text-secondary-container">
                          {renderCostSymbol(city.cost)}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-bold mb-1">{city.name}</h3>
                      <p className="text-xs sm:text-sm text-surface-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">trending_up</span> {city.popularity}
                      </p>
                    </div>
                    <button 
                      onClick={() => toggleCity(city.id)}
                      className={`px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-colors flex items-center gap-2 shadow-lg w-fit cursor-pointer ${
                        isAdded 
                          ? 'bg-primary-container text-on-primary' 
                          : 'bg-surface-pure text-primary-container hover:bg-surface-muted'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{isAdded ? 'check' : 'add'}</span>
                      {isAdded ? 'Added' : 'Add to Trip'}
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div 
                key={city.id} 
                className="relative rounded-2xl overflow-hidden group border border-surface-muted bg-surface-pure flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div 
                  className="h-48 bg-cover bg-center transition-transform duration-700 group-hover:scale-103" 
                  style={{ backgroundImage: `url('${city.image}')` }}
                />
                <div className="p-5 flex flex-col flex-grow justify-between bg-surface-pure relative z-10">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-outline tracking-wider uppercase">{city.country}</span>
                      <span className="flex">
                        {renderCostSymbol(city.cost)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-1">{city.name}</h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{city.description}</p>
                  </div>
                  <button 
                    onClick={() => toggleCity(city.id)}
                    className={`mt-4 w-full py-2 border rounded-lg text-xs font-semibold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isAdded 
                        ? 'bg-primary-container text-on-primary border-transparent' 
                        : 'border-primary-container text-primary-container hover:bg-primary-container hover:text-surface-pure'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{isAdded ? 'check' : 'add'}</span>
                    {isAdded ? 'Added' : 'Add to Trip'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-pure rounded-xl border border-surface-muted">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">search_off</span>
          <p className="text-sm font-semibold text-on-surface-variant">No destinations found matching your search.</p>
        </div>
      )}

      {/* Load More */}
      <div className="mt-6 flex justify-center">
        <button className="px-6 py-2.5 bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold tracking-wider hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer border border-transparent">
          Load More Destinations <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
      </div>
    </div>
  );
}

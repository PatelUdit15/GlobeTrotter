import { useState } from 'react';
import { Link } from 'react-router-dom';

const recentTrips = [
  {
    id: 1,
    title: 'Paris Getaway',
    dates: 'Oct 12 - Oct 18, 2024',
    status: 'Upcoming',
    statusColor: 'bg-accent-teal-light text-on-secondary-container',
    accentColor: 'bg-secondary',
    tags: ['Flight Booked', 'Hotel Pending'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-fEHTGNWWB5-CKeMkCY7kGhbont-9Zr-IH3snu7XCvzedILzs4MJ7FeJjm9iqwzGxiZlcZCtr9RZEy-YpG4FyB1-RpvGXTq9iGiquWMLVrfzr3PSbCSA2W084rYMDt1s5yI_E3wmZrgWDKJzfRL5xlvt_aWpxJbpJyEHg2jQ7i1N7c8B8SVPOnqD1Z_zl9sdhh4Zjv6lXksQaDiSEOSFweixRf5UbAmfszDqM151N3jF_An_Jc3g',
  },
  {
    id: 2,
    title: 'Japan Tour 2025',
    dates: 'Apr 05 - Apr 20, 2025',
    status: 'Draft',
    statusColor: 'bg-surface-container-high text-on-surface-variant',
    accentColor: 'bg-surface-dim',
    tags: ['Planning'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF6u1yZRm7t5PrORh-qdsPzwuOnWK1gy89Jrd677FOMQ3ogc_qfPYovAgeAifDGZ7gQBK1ivr3gua0A1LWxbooueAHcgG-aiKwgvrqMGQQDKC_YPc_mNT7MjmuvYx7rWoN8j-ubvDXRQfEwqE_MtM-VPMnMbHLOJ047ACfRVAeb8QJE2uW3awvyIJlwsVAfW2by6hQlbMRq64wdCwlotYlaiPIVMWQOiPae1J0ECLv5AoxnNHxcOM',
  },
];

const destinations = [
  {
    name: 'New York',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDshlsvCe-ZC_Nbu6skZ2F3vwFl72Syr5EPzz6dzApecAcyJqu63ElXLv7WDnOppQjDh9GGmcRSd8Vh1o2847R1MSSLCzE63DFcu6is-C4_DGxm561vtD1SvriVm1rNUJML49x3l00c6th6i4CHtKKGPiesrLMh6sQw_eQnQzRVNvFreEuEV-8qwS2LmHFpkwBd-FZUuWG5atQilhcNOQFGMunaaltSNMC8Ewlf1zn4riSG1ErPZUw',
  },
  {
    name: 'Tokyo',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT9SyuA_ztYJ9yHUmGLPdlo4G-w9X0yltUqz3LPoL0u80B4_bSgIILniNAnU1hBNt9yXeOZGGTRow8katHB9I6QuiZUG5Ft2Xh_jdjaUeH3EHrvSzBsk6wI4poQzzUNkECublk07wbYMTUbtzMILsU_TvpKtdOWwAlSk4m00iqXPA7cXfpJUVc1X7TRGZimor0vrsJA72tGfqFvrdRD9kd8Gmue4mDxgtS40UM0ntqw8Pttn-u4cw',
  },
  {
    name: 'Rome',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcxjGXJjIOaPdPhL9KFiPmt6pIZqh2xs-f_Cf0UZsbyQ9RLIm9qFcsk7hCdqkRGUp9V6WgCGtdVHxtGifKvjF9uELO8O-qJxuEQvTPBDuCORyrk1DeBZQvDWyRKwSpJlvIKihW7c_WWwXSMAF6ogkR6cFU2nAij7KZU-rLTKbmmfSuFiWrJLhiUx9PHP5DH4vSHFPSMtRpTeaYmJ7eMFbtoFK2NNVgdOjKY4KHc6Mo2v4lhQLySg4',
  },
  {
    name: 'Sydney',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbhWDIEdIm5keA24MVQNHatL_Hhfs0ARZD2kk-le-tl98pN5lPOkqv0FfWXKBClWfW-e2bdkJRipbM00_7g61DYBVNvEuOoeTRgIwKpfvJnw3phaiGaUE6J8p_X3__hUKnVlh3xTIwZL0HYVGCyu3WZDhJEU7-BwCWGL28TrqoutOW15PQY3q6hU1YmxyC_yOw2Fl3u89E3iWlf3f-4ZrGfhtYL-jYkrlT2TKpjCeygGTHcElE-Sk',
  },
];

const quickActions = [
  { icon: 'flight_takeoff', label: 'Flights' },
  { icon: 'hotel', label: 'Stays' },
  { icon: 'local_activity', label: 'Activities' },
  { icon: 'map', label: 'Maps' },
];

export default function Dashboard() {
  const [filterBy, setFilterBy] = useState('all');
  const [groupBy, setGroupBy] = useState('none');
  const [sortBy, setSortBy] = useState('date');

  return (
    <div className="flex flex-col gap-8 relative pb-12">
      {/* Welcome & Search Banner */}
      <section
        className="relative w-full rounded-xl overflow-hidden shadow-sm min-h-[300px] md:min-h-[340px] flex flex-col justify-center items-center text-center p-6 md:p-8"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIAjQwefthHdLsBb0KEpeSXHBro_7f4lXMDPN8QbakZYseiz6bj3wry4YaLx96HqY3ESr3PinxJD1VLKoEVqxWx7u9fpsoeT7ndj0JX-SZGICBphMRsEyJvybnJNbrX4khMZxPkjHH7c-AJuP6vGTqxCbYgoWgEQ25laoAoDpX0bSww-YZmZxNm_81f2mAKrInlGVVUBep5rlgX59q9-P_0XBByRPwT0CoGPB-KLEq_7a91uSYf1o')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-surface-pure/60 backdrop-blur-[2px]" />
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-4">
          <h2 className="text-4xl md:text-5xl font-bold text-primary drop-shadow-sm tracking-tight">Where to next?</h2>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-xl">
            Plan your perfect itinerary, manage budgets, and share memories.
          </p>

          {/* Search Bar + Filter, Group By, Sort By Row */}
          <div className="mt-2 flex flex-col lg:flex-row gap-3 w-full items-stretch lg:items-center">
            {/* Search Input Box */}
            <div className="flex-1 flex bg-surface-pure rounded-lg border border-surface-muted overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant p-3 flex items-center">search</span>
              <input
                className="w-full border-none focus:ring-0 text-sm text-on-surface bg-transparent px-2 outline-none"
                placeholder="Search destinations, trips, or activities..."
                type="text"
              />
              <button className="bg-primary-container text-on-primary px-5 text-xs font-semibold tracking-wider hover:bg-primary-container/90 transition-colors cursor-pointer">
                Search
              </button>
            </div>

            {/* Right side controls: Group By, Filter, Sort By */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-center lg:justify-end">
              {/* Filter */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full appearance-none bg-surface-pure border border-surface-muted rounded-lg pl-8 pr-7 py-2.5 text-xs font-semibold tracking-wider text-on-surface hover:border-primary focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                >
                  <option value="all">Filter: All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
                <span className="material-symbols-outlined text-[16px] text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  filter_list
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Group By */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full appearance-none bg-surface-pure border border-surface-muted rounded-lg pl-8 pr-7 py-2.5 text-xs font-semibold tracking-wider text-on-surface hover:border-primary focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                >
                  <option value="none">Group By: None</option>
                  <option value="month">Month</option>
                  <option value="status">Status</option>
                  <option value="destination">Destination</option>
                </select>
                <span className="material-symbols-outlined text-[16px] text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  grid_view
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Sort By */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-surface-pure border border-surface-muted rounded-lg pl-8 pr-7 py-2.5 text-xs font-semibold tracking-wider text-on-surface hover:border-primary focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                >
                  <option value="date">Sort By: Date</option>
                  <option value="name">Name</option>
                  <option value="budget">Budget</option>
                  <option value="duration">Duration</option>
                </select>
                <span className="material-symbols-outlined text-[16px] text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  swap_vert
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Trips */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Top Regional Selections */}
          <section>
            <h3 className="text-xl font-semibold text-on-surface mb-4">Top Regional Selections</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {destinations.map((dest) => (
                <div
                  key={dest.name}
                  className="min-w-[140px] h-[180px] rounded-lg overflow-hidden relative cursor-pointer group snap-start border border-surface-muted"
                >
                  <img
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    src={dest.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold tracking-wider text-surface-pure">{dest.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Previous Trips */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-semibold text-on-surface">Previous Trips</h3>
              <Link className="text-xs font-semibold tracking-wider text-secondary hover:underline" to="/trips">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-surface-pure rounded-xl border border-surface-muted hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow overflow-hidden flex flex-col"
                >
                  <div
                    className="h-32 bg-surface-muted relative"
                    style={{ backgroundImage: `url('${trip.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <div className={`absolute top-3 left-3 ${trip.statusColor} text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm`}>
                      {trip.status}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 relative pl-6">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${trip.accentColor} rounded-l-xl opacity-50`} />
                    <h4 className="text-lg font-semibold text-primary">{trip.title}</h4>
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {trip.dates}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {trip.tags.map((tag) => (
                        <span key={tag} className="bg-surface-muted text-primary text-[10px] font-semibold tracking-wider px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Floating "Plan a Trip" Button */}
      <Link
        to="/trips/create"
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-50 bg-primary-container text-on-primary hover:bg-primary shadow-lg hover:shadow-xl rounded-full py-3.5 px-6 flex items-center gap-2.5 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 text-sm font-semibold tracking-wide group cursor-pointer border border-on-primary/10"
      >
        <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
        <span>Plan a Trip</span>
      </Link>
    </div>
  );
}

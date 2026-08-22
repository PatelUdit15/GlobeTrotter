import { useState } from 'react';

const routeStops = [
  { name: 'Zurich', duration: '2 Nights' },
  { name: 'Lucerne', duration: '3 Nights' },
  { name: 'Interlaken', duration: '5 Nights' },
];

const highlights = [
  { icon: 'landscape', label: 'Matterhorn View' },
  { icon: 'directions_railway', label: 'Glacier Express' },
  { icon: 'sailing', label: 'Lake Cruise' },
  { icon: 'restaurant', label: 'Fondue Tasting' },
];

export default function SharedItinerary() {
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullPlan, setShowFullPlan] = useState(false);

  const handleCopyTrip = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveTrip = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <section className="relative w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden shadow-sm border border-surface-muted">
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqihxeO0wD9IVPkYo3V4fcciLjyEvshp_cR9ARXF8SxDeJtUwSED7s5OGhRamrZi3DU2frPczphy1SgeI2Kd0_0MQHVjJ-Kn0ceZWvxe2Sb_xj1MbhXE16invL0LnkKuzhFK4BvUBoWJmaaSPCF3-1K7D8FEriV6bIFfcYUQIc3aUWx5jJpM1S5kJ-BT5Hj4zgpb-nYqgr6puvE2bZbfIWPCWmnPgzq71lIvLCnHvkXxuzToAa6fI')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 z-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-secondary text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md bg-opacity-80">Public Itinerary</span>
              <span className="text-white/80 text-xs font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">visibility</span> 1.2k views</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Alpine Escape: 10 Days in Switzerland</h1>
            <p className="text-xs sm:text-sm text-white/95 max-w-2xl leading-relaxed">A breathtaking journey through Zurich, Lucerne, and Interlaken, featuring scenic train rides, glacier explorations, and cozy chalets.</p>
            <div className="flex items-center gap-4 text-white/80 text-[11px] sm:text-xs font-semibold">
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> Oct 12 - Oct 22</div>
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> Curated by Alex Wander</div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleCopyTrip}
              className="bg-surface-pure text-primary px-5 py-2.5 rounded text-xs font-semibold tracking-wider hover:bg-surface-muted transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">{isCopied ? 'done' : 'content_copy'}</span>
              {isCopied ? 'Copied!' : 'Copy Trip'}
            </button>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded flex items-center justify-center transition-colors border border-white/30 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Itinerary Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Day 1 */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-surface-muted pb-4">
              <h2 className="text-xl font-bold text-primary flex items-baseline gap-2">
                Day 1 <span className="text-xs font-semibold text-on-surface-variant font-normal">Arrival in Zurich</span>
              </h2>
              <span className="text-xs font-semibold text-on-surface-variant">Oct 12</span>
            </div>
            
            {/* Timeline Wrapper */}
            <div className="relative pl-2 space-y-8 timeline-line">
              {/* Item 1 */}
              <div className="relative z-10 flex gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-teal-light border-2 border-secondary flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>flight_land</span>
                </div>
                <div className="flex-1 bg-surface rounded-lg p-4 sm:p-5 border border-surface-muted group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-on-surface">Arrive at ZRH Airport</h3>
                    <span className="text-[11px] font-semibold text-on-surface-variant shrink-0">10:00 AM</span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-3">Clear customs and pick up Swiss Travel Pass at the SBB counter in the airport.</p>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-muted text-primary text-[10px] font-bold tracking-wider uppercase">
                      <span className="material-symbols-outlined text-[14px]">train</span> Transport
                    </span>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative z-10 flex gap-4 sm:gap-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-fixed border-2 border-primary-container flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                </div>
                <div className="flex-1 bg-surface rounded-lg p-4 sm:p-5 border border-surface-muted group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-on-surface">Check-in: Hotel Schweizerhof</h3>
                    <span className="text-[11px] font-semibold text-on-surface-variant shrink-0">12:30 PM</span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">Drop off luggage and freshen up. Located directly across from the main station.</p>
                  <div className="h-32 rounded-md overflow-hidden border border-surface-muted relative">
                    <div 
                      className="bg-cover bg-center w-full h-full" 
                      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9p40221Ks6W_DYcV_r-uvlLXFRHVdt46U1dp5dG5aoKWM-cEKEZBuenHSnnLL9bifDyNhklipVg32fIVTnY1L82YSxBC8omGXwRKH-j3OTDAkaNQEYNTHnwMtIEYqPIB6eP6ldI0v38gsGpoPRTBFqvfZdh939tJyVDp3j-SniThn35TcRz92dl8QVtrVtlu8vvuc5E4nFHD_PrXNLTvhbaT8VqI7PvTH-7ImaJ2oqKYJDZB6W0w')" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day 2 */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-surface-muted pb-4">
              <h2 className="text-xl font-bold text-primary flex items-baseline gap-2">
                Day 2 <span className="text-xs font-semibold text-on-surface-variant font-normal">Exploring Lucerne</span>
              </h2>
              <span className="text-xs font-semibold text-on-surface-variant">Oct 13</span>
            </div>
            
            {showFullPlan ? (
              <div className="relative pl-2 space-y-8 timeline-line">
                <div className="relative z-10 flex gap-4 sm:gap-6 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-teal-light border-2 border-secondary flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>directions_train</span>
                  </div>
                  <div className="flex-1 bg-surface rounded-lg p-4 sm:p-5 border border-surface-muted group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-on-surface">Scenic Train to Lucerne</h3>
                      <span className="text-[11px] font-semibold text-on-surface-variant shrink-0">09:00 AM</span>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">Catch the regional express train from Zurich HB. A beautiful 45-minute journey passing lakes and hills.</p>
                  </div>
                </div>
                <div className="relative z-10 flex gap-4 sm:gap-6 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-fixed border-2 border-primary-container flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
                  </div>
                  <div className="flex-1 bg-surface rounded-lg p-4 sm:p-5 border border-surface-muted group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-on-surface">Chapel Bridge & Old Town Walk</h3>
                      <span className="text-[11px] font-semibold text-on-surface-variant shrink-0">11:30 AM</span>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">Stroll across the iconic wooden covered bridge and explore the historic guild halls in the Old Town.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative pl-2 text-center py-6">
                <p className="text-sm text-on-surface-variant italic">More itinerary details continue...</p>
                <button 
                  onClick={() => setShowFullPlan(true)}
                  className="mt-4 text-secondary text-xs font-bold tracking-wider hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  View Full 10-Day Plan <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Route Overview Map */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted overflow-hidden shadow-sm flex flex-col">
            <div className="h-48 w-full bg-surface-variant relative">
              <div 
                className="bg-cover bg-center w-full h-full" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA9tCaYPPL4ut8VJbIsTqNUYGThnDemKImRuEi-yd4ht-dqiQZMLb91bn0j2XpOEMv6otMhQj5IQ_YnXfDW1StvigXIG5QJH2CCwOGFsfOmsyDnM3zmFI5VDUtYfHG0X3IW2tH1YzKWmX23HDGIuIfhm3ZkkzzvvVkLSSdRsknKIkTK9aBj2EgbXO6fKRgamkZzya_QAD7D8kniNfhDbqkfQGdRgOaB_MRyeQ5ng42_Dcakh8Viuko')" }}
              />
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-on-surface mb-4">Route Overview</h3>
              <ul className="flex flex-col gap-3 text-xs font-semibold text-on-surface-variant">
                {routeStops.map((stop, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary" /> 
                    <span>{stop.name} <span className="text-[10px] font-normal text-on-surface-variant/70">({stop.duration})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Highlights Bento Box */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm">
            <h3 className="text-base font-bold text-on-surface mb-4">Trip Highlights</h3>
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((hl, idx) => (
                <div key={idx} className="bg-surface rounded-lg p-3 border border-surface-muted flex flex-col items-center text-center gap-2 hover:bg-surface-muted transition-colors">
                  <span className="material-symbols-outlined text-secondary text-[28px]">{hl.icon}</span>
                  <span className="text-[10px] font-bold text-on-surface tracking-wide">{hl.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save / Engage Banner */}
          <div className="bg-primary-container rounded-xl p-6 text-center text-on-primary-container shadow-sm">
            <h3 className="text-lg font-bold mb-2 text-white">Inspired by this trip?</h3>
            <p className="text-xs leading-relaxed mb-6 text-white/90">Save this itinerary to your profile and start customizing it for your own adventure.</p>
            <button 
              onClick={handleSaveTrip}
              className={`w-full bg-surface-pure text-primary py-3 rounded text-xs font-bold tracking-wider flex justify-center items-center gap-2 hover:bg-surface-muted transition-colors shadow-sm cursor-pointer ${
                isSaved ? 'opacity-90' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{isSaved ? 'check' : 'bookmark_add'}</span>
              {isSaved ? 'Saved to Trips!' : 'Save to My Trips'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

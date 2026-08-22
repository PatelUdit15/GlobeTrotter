const activities = [
  {
    id: 1,
    name: 'Eiffel Tower Visit',
    time: '10:00 AM - 12:30 PM',
    cost: '$35',
    category: 'Sightseeing',
    addedBy: 'Sarah',
  },
  {
    id: 2,
    name: 'Lunch at Le Jules Verne',
    time: '1:00 PM - 2:30 PM',
    cost: '$120',
    category: 'Dining',
    addedBy: null,
  },
];

const suggestions = [
  {
    name: 'Louvre Museum',
    type: 'Art & History',
    cost: '$20',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvW46jpSGssuonNe2f2LHdNs14y2x-RClcIRpmQhwGbS2Ymlz0Zcs3Fqge1YvggcOl1sXeOHa0GjzwaT-SPo_-y_fvCmpDp_ofeZax_n5QuLLlvHJWjRgEbg32GwnHAM__jnb2j6MwyHyn7JlrGfjilMZytJgoCK7gAA0DUtEYDYrmRn47knc1Ie6jeViozhO5V7m3Hmcy0W8_WktP9eaflDmbvFVzk-zyZPVhcMRFaMudryrfUVY',
  },
];

import { useParams, useNavigate } from 'react-router-dom';

export default function ItineraryBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-5xl font-bold text-primary tracking-tight">European Adventure</h2>
          <p className="text-sm text-on-surface-variant mt-1">14 Days • 3 Cities • Est. $3,500</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">group_add</span> Share
          </button>
          <button className="px-4 py-2 rounded bg-primary-container text-on-primary hover:opacity-90 transition-opacity text-sm flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">save</span> Save Itinerary
          </button>
        </div>
      </div>

      {/* Itinerary Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timeline & Stops */}
        <div className="lg:col-span-8 relative timeline-line pb-12">
          {/* Stop: Paris */}
          <div className="relative z-10 mb-12 pl-12">
            {/* Timeline Node */}
            <div className="absolute left-[18px] top-4 w-3 h-3 bg-secondary rounded-full border-2 border-surface-pure" />

            {/* City Header Card */}
            <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    <h3 className="text-xl font-semibold text-on-surface">Paris, France</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant">Oct 10 - Oct 14 (4 Days)</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1 cursor-pointer">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="text-on-surface-variant hover:text-error transition-colors p-1 cursor-pointer">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button className="text-on-surface-variant cursor-grab p-1">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Day 1 Activities */}
            <div className="ml-4 pl-4 border-l-2 border-surface-muted mb-6">
              <h4 className="text-xs font-semibold tracking-wider text-primary mb-3">DAY 1 - OCT 10</h4>
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-surface-pure rounded-lg border border-surface-muted p-4 mb-3 flex gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow cursor-grab"
                >
                  <div className="material-symbols-outlined text-on-surface-variant cursor-grab">drag_indicator</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className="text-base font-semibold text-on-surface">{activity.name}</h5>
                      <span className="text-sm font-semibold text-primary">{activity.cost}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-2">{activity.time}</p>
                    <div className="flex gap-2">
                      <span className="inline-block px-2 py-1 bg-surface-muted text-primary rounded text-xs font-semibold">
                        {activity.category}
                      </span>
                      {activity.addedBy && (
                        <span className="inline-block px-2 py-1 bg-accent-teal-light text-secondary rounded text-xs font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span> Added by {activity.addedBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button className="mt-2 text-secondary hover:text-secondary-fixed-dim text-sm flex items-center gap-1 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Activity to Day 1
              </button>
            </div>
          </div>

          {/* Stop: Rome */}
          <div className="relative z-10 mb-12 pl-12">
            <div className="absolute left-[18px] top-4 w-3 h-3 bg-secondary rounded-full border-2 border-surface-pure" />
            <div className="bg-surface-pure rounded-xl border border-surface-muted p-5 shadow-sm mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    <h3 className="text-xl font-semibold text-on-surface">Rome, Italy</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant">Oct 15 - Oct 19 (5 Days)</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1 cursor-pointer">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="text-on-surface-variant hover:text-error transition-colors p-1 cursor-pointer">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button className="text-on-surface-variant cursor-grab p-1">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="ml-4 pl-4 border-l-2 border-surface-muted mb-6">
              <h4 className="text-xs font-semibold tracking-wider text-primary mb-3">DAY 5 - OCT 15</h4>
              <div className="bg-surface-pure rounded-lg border border-surface-muted p-4 mb-3 flex gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow cursor-grab">
                <div className="material-symbols-outlined text-on-surface-variant cursor-grab">drag_indicator</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="text-base font-semibold text-on-surface">Colosseum Tour</h5>
                    <span className="text-sm font-semibold text-primary">$45</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-2">9:00 AM - 12:00 PM</p>
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-1 bg-surface-muted text-primary rounded text-xs font-semibold">Sightseeing</span>
                  </div>
                </div>
              </div>
              <button className="mt-2 text-secondary hover:text-secondary-fixed-dim text-sm flex items-center gap-1 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Activity to Day 5
              </button>
            </div>
          </div>

          {/* Add Stop Button */}
          <div className="relative z-10 pl-12 mt-8">
            <div className="absolute left-[16px] top-3 w-4 h-4 bg-surface-pure rounded-full border-2 border-secondary flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
            </div>
            <button 
              onClick={() => navigate(`/trips/${id}/itinerary/add-stop`)}
              className="w-full border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:bg-surface-muted transition-colors flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-3xl">add_location_alt</span>
              <span className="text-base font-semibold text-outline group-hover:text-primary transition-colors">Add Next Stop</span>
            </button>
          </div>
        </div>

        {/* Right Column: Budget & Suggestions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Budget Summary Panel */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">account_balance_wallet</span> Budget Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Flights</span>
                <span className="text-sm font-semibold">$1,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Accommodation</span>
                <span className="text-sm font-semibold">$1,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Activities</span>
                <span className="text-sm font-semibold">$450</span>
              </div>
              <div className="pt-4 border-t border-surface-muted flex justify-between items-center">
                <span className="text-base font-bold text-on-surface">Total Est.</span>
                <span className="text-base font-bold text-primary">$3,100</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-surface-muted rounded-full h-2 mb-2 overflow-hidden flex">
                <div className="bg-secondary h-full" style={{ width: '40%' }} />
                <div className="bg-primary h-full" style={{ width: '45%' }} />
                <div className="bg-accent-teal-light h-full" style={{ width: '15%' }} />
              </div>
              <p className="text-xs font-semibold tracking-wider text-on-surface-variant text-center">88% of $3,500 budget planned</p>
            </div>
          </div>

          {/* Suggestions Panel */}
          <div className="bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">lightbulb</span> Suggested for Paris
            </h3>
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div
                  key={s.name}
                  className="flex gap-3 items-center border border-surface-muted rounded-lg p-3 hover:shadow-sm cursor-pointer transition-shadow"
                >
                  <div className="w-16 h-16 bg-surface-muted rounded overflow-hidden shrink-0">
                    <img alt={s.name} className="w-full h-full object-cover" src={s.image} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold line-clamp-1">{s.name}</h4>
                    <p className="text-xs font-semibold tracking-wider text-on-surface-variant">
                      {s.type} • {s.cost}
                    </p>
                  </div>
                  <button className="material-symbols-outlined text-secondary hover:bg-accent-teal-light p-1 rounded-full transition-colors cursor-pointer">
                    add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

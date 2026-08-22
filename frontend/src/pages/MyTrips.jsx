const trips = {
  ongoing: [
    {
      id: 1,
      title: 'European Summer',
      dates: 'Jul 10 - Aug 05, 2024',
      destinations: 4,
      accentColor: 'bg-secondary',
      statusBadge: 'In Progress',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjKwETUbbmHTDExObhOlk8TXK-PGLNDEgvzhD2vzxpAdQVCe5XtumCTdYpX7m-IlYSYvPsNRIoDydRN9xiYV3fyRfYcx57_VGi8trNOb5hCK8Z1oWkqynUsLhkky9Xe4dbSs5X2w-B8Vx2tuzTT3c1sHzl3g89OeiJoiHQUVd51kmw5Whr0qGPJw_5Ec0YnJ-26j9KkbL7O5GNMPF70a3NxOOFsr98QCWpJ7WUYikKrZvCWMO0rUU',
    },
  ],
  upcoming: [
    {
      id: 2,
      title: 'Alpine Retreat',
      dates: 'Dec 15 - Dec 22, 2024',
      destinations: 1,
      accentColor: 'bg-surface-dim',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbcgJVd2HCe9GXm3-QyZrkiHK8GM6MD4W84JkE2ut9PB0CYC_aV41L2braz2y9Zs75skQShTaQDgmNuC1jdm4Ulz3QwtzfXwZCVvpngcJsGKKjPNXlL5a9dxcNyL35ycwx0KISpsExBa4IBuDyo3Mfyle_EC0_pbxVEEhF1GGUNEMk03Npl8wgsjq8rtztnp16IuQAbnF9r8wfAbRzFSeQ1WjUiOBlStfCxmTf79SkANq_0pzAH7A',
    },
    {
      id: 3,
      title: 'Tokyo Tech Conf',
      dates: 'Feb 02 - Feb 08, 2025',
      destinations: 2,
      accentColor: 'bg-surface-dim',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAnVUi1rwhJTuutbYOOesFGv87ELpJaI58zAbIks9ldJsSOmoXypW48d3h_V7llF0Og9tlujgz7WzJzwR_ncgcxU_2OOLTE8v0Jo_mW24NX6Kq_0s0kEVHzhlYcZc2KRT5J5i0WrW8GNZ5MFchG_F8U2IaA7N0gAZlAlm-Foay8iSy5IxOie4WX-3oinZk2VkTz9BypACFMZz4OAKKtdcI_BE803NZ3-LHLUOhvFKO4XCDM4afSKM',
    },
  ],
  completed: [
    {
      id: 4,
      title: 'Bali Getaway',
      dates: 'May 01 - May 14, 2023',
      destinations: 3,
      accentColor: 'bg-surface-muted',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH87C1nG5VK8r9m-LoTQv_WGoI8BJpyANPt5Xj1s_-xA-PCgm9zwl0X_tU8dceBFUUCNuzsJBQ1cnvxnck5mzNVIKH_r-eEsrmKtp8T6NimY4V2RtEDYUaVsFbPogOerGIdi96wZWTo1LcUUxqjIGXKUGAPxy5iAVVvA_h1Wfp0-ZfHzajME06NW_qHNe2R9jo2MZyrJznA42rxL6afW0zv6bv-daPmYJsXuDAbfoF3SrTBGT6SjA',
    },
  ],
};

function TripCard({ trip, isCompleted = false }) {
  return (
    <div
      className={`trip-card bg-surface-pure border border-surface-muted rounded-xl overflow-hidden flex flex-col ${
        isCompleted ? 'grayscale hover:grayscale-0 transition-all' : ''
      }`}
    >
      <div
        className="h-32 bg-surface-muted relative border-b border-surface-muted"
        style={{ backgroundImage: `url('${trip.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {trip.statusBadge && (
          <div className="absolute top-2 right-2 bg-surface-pure/90 backdrop-blur-sm px-2 py-1 rounded text-primary text-[10px] font-semibold tracking-wider uppercase">
            {trip.statusBadge}
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col relative pl-5">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${trip.accentColor} rounded-r-full`} />
        <h3 className="text-xl font-semibold text-on-surface line-clamp-1 mb-1">{trip.title}</h3>
        <p className="text-sm text-on-surface-variant mb-3">{trip.dates}</p>
        <div className="flex gap-2 mb-4 mt-auto">
          <span className="inline-flex items-center gap-1 bg-surface-muted text-primary px-2 py-1 rounded text-[11px] font-semibold tracking-wider">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {trip.destinations} {trip.destinations === 1 ? 'Destination' : 'Destinations'}
          </span>
        </div>
        <div className="flex gap-2 pt-3 border-t border-surface-muted mt-auto">
          {isCompleted ? (
            <button className="w-full py-1.5 border border-surface-muted text-on-surface rounded text-xs font-semibold tracking-wider hover:bg-surface-muted transition-colors cursor-pointer">
              View Itinerary
            </button>
          ) : (
            <>
              <button className="flex-1 py-1.5 border border-primary text-primary rounded text-xs font-semibold tracking-wider hover:bg-accent-teal-light transition-colors cursor-pointer">
                View
              </button>
              <button className="flex-1 py-1.5 border border-surface-muted text-on-surface rounded text-xs font-semibold tracking-wider hover:bg-surface-muted transition-colors cursor-pointer">
                Edit
              </button>
              <button className="p-1.5 border border-surface-muted text-on-surface-variant rounded hover:text-error hover:border-error transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TripSection({ title, tripList, isCompleted = false }) {
  return (
    <section className={isCompleted ? 'opacity-75' : ''}>
      <h2 className="text-xl font-semibold text-on-surface mb-4 pb-2 border-b border-surface-muted">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tripList.map((trip) => (
          <TripCard key={trip.id} trip={trip} isCompleted={isCompleted} />
        ))}
      </div>
    </section>
  );
}

export default function MyTrips() {
  return (
    <div>
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">My Trips</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage and view all your planned adventures.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-pure border border-surface-muted rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none text-sm"
              placeholder="Search trips..."
              type="text"
            />
          </div>
          <button className="bg-surface-pure border border-surface-muted text-on-surface px-4 py-2 rounded-lg text-xs font-semibold tracking-wider hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
          </button>
        </div>
      </div>

      {/* Trip Categories */}
      <div className="space-y-12">
        <TripSection title="Ongoing" tripList={trips.ongoing} />
        <TripSection title="Upcoming" tripList={trips.upcoming} />
        <TripSection title="Completed" tripList={trips.completed} isCompleted />
      </div>
    </div>
  );
}

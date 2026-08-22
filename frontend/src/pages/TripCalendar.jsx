import { useState } from 'react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const tripEvents = [
  { startDay: 12, endDay: 18, title: 'Paris Getaway', color: 'bg-primary-container text-on-primary' },
  { startDay: 22, endDay: 25, title: 'Weekend in Rome', color: 'bg-secondary text-on-secondary' },
];

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay();
}

export default function TripCalendar() {
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const cells = [];
  // Empty cells before the first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="p-2 min-h-[80px] md:min-h-[100px] border border-surface-muted bg-surface-container-low/50" />);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const eventsOnDay = tripEvents.filter((e) => day >= e.startDay && day <= e.endDay);
    const isToday = day === 15; // Mock "today"
    cells.push(
      <div
        key={day}
        className={`p-2 min-h-[80px] md:min-h-[100px] border border-surface-muted hover:bg-surface-container-low transition-colors cursor-pointer ${
          isToday ? 'bg-accent-teal-light/30' : 'bg-surface-pure'
        }`}
      >
        <span className={`text-sm font-semibold ${isToday ? 'text-secondary' : 'text-on-surface'}`}>{day}</span>
        <div className="mt-1 space-y-1">
          {eventsOnDay.map((event, idx) => (
            <div key={idx} className={`text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded truncate ${event.color}`}>
              {day === event.startDay ? event.title : ''}
              {day > event.startDay && day <= event.endDay && <span className="opacity-50">•••</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">Trip Calendar</h1>
          <p className="text-sm text-on-surface-variant mt-1">View all your trips at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">today</span> Today
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-sm overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-surface-muted bg-surface-container-low">
          <button onClick={prevMonth} className="p-2 hover:bg-surface-muted rounded-lg transition-colors cursor-pointer">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="text-xl font-semibold text-primary">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-surface-muted rounded-lg transition-colors cursor-pointer">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-semibold tracking-wider text-on-surface-variant border border-surface-muted bg-surface-container-low">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">{cells}</div>
      </div>

      {/* Upcoming Trips Legend */}
      <div className="mt-6 bg-surface-pure rounded-xl border border-surface-muted p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-on-surface mb-4">Trips This Month</h3>
        <div className="space-y-3">
          {tripEvents.map((event, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${event.color.split(' ')[0]}`} />
              <span className="text-sm font-semibold text-on-surface">{event.title}</span>
              <span className="text-sm text-on-surface-variant">
                Oct {event.startDay} - Oct {event.endDay}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

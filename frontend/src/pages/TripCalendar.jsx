import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tripsApi } from '../api';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_COLOR = {
  upcoming:  'bg-primary-container text-on-primary',
  ongoing:   'bg-secondary text-on-secondary',
  draft:     'bg-surface-container-high text-on-surface-variant',
  completed: 'bg-surface-muted text-on-surface-variant',
};

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(month, year) {
  return new Date(year, month, 1).getDay();
}

export default function TripCalendar() {
  const { id: tripId } = useParams();
  const navigate       = useNavigate();

  const today = new Date();
  const [month,  setMonth]  = useState(today.getMonth());
  const [year,   setYear]   = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchCalendar = useCallback((m, y) => {
    setLoading(true);
    // If we have a trip id, fetch that trip's calendar; otherwise fetch all user trips
    const promise = tripId
      ? tripsApi.calendar(m + 1, y)   // API uses 1-indexed month
      : tripsApi.calendar(m + 1, y);

    promise
      .then(data => setEvents(data.events || []))
      .catch(() => setError('Failed to load calendar.'))
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => { fetchCalendar(month, year); }, [month, year, fetchCalendar]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else              setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else               setMonth(m => m + 1);
  };
  const goToday = () => { setMonth(today.getMonth()); setYear(today.getFullYear()); };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay    = getFirstDay(month, year);
  const monthLabel  = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map events to day ranges using 1-indexed day numbers
  const getEventsForDay = (day) => {
    return events.filter(ev => {
      if (!ev.start_date) return false;
      const start = new Date(ev.start_date);
      const end   = ev.end_date ? new Date(ev.end_date) : start;
      const cell  = new Date(year, month, day);
      return cell >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             cell <= new Date(end.getFullYear(),   end.getMonth(),   end.getDate());
    });
  };

  const isStartDay = (ev, day) => {
    if (!ev.start_date) return false;
    const s = new Date(ev.start_date);
    return s.getFullYear() === year && s.getMonth() === month && s.getDate() === day;
  };

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} className="p-2 min-h-[80px] md:min-h-[100px] border border-surface-muted bg-surface-container-low/30" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents  = getEventsForDay(day);
    const todayClass = isToday(day) ? 'bg-accent-teal-light/30' : 'bg-surface-pure';
    cells.push(
      <div key={day} className={`p-2 min-h-[80px] md:min-h-[100px] border border-surface-muted hover:bg-surface-container-low transition-colors cursor-pointer ${todayClass}`}>
        <span className={`text-sm font-semibold ${isToday(day) ? 'text-secondary' : 'text-on-surface'}`}>{day}</span>
        <div className="mt-1 space-y-0.5">
          {dayEvents.map((ev, idx) => {
            const colorClass = STATUS_COLOR[ev.status] || 'bg-surface-muted text-on-surface-variant';
            const showTitle  = isStartDay(ev, day);
            return (
              <Link key={idx} to={`/trips/${ev.trip_id}/itinerary`}
                className={`block text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded truncate ${colorClass} hover:opacity-80 transition-opacity`}
                title={ev.title}>
                {showTitle ? ev.title : <span className="opacity-40">···</span>}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-on-surface">Trip Calendar</h1>
          <p className="text-sm text-on-surface-variant mt-1">All your trips at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          {tripId && (
            <button onClick={() => navigate(`/trips/${tripId}/itinerary`)}
              className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Itinerary
            </button>
          )}
          <button onClick={goToday}
            className="px-4 py-2 rounded border border-surface-muted text-on-surface hover:bg-surface-muted transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">today</span> Today
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {/* Legend */}
      {events.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {events.map(ev => (
            <Link key={ev.trip_id} to={`/trips/${ev.trip_id}/itinerary`}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold ${STATUS_COLOR[ev.status] || 'bg-surface-muted text-on-surface-variant'} hover:opacity-80`}>
              <span className="w-2 h-2 rounded-full bg-current opacity-60" />{ev.title}
            </Link>
          ))}
        </div>
      )}

      <div className="bg-surface-pure rounded-xl border border-surface-muted shadow-sm overflow-hidden">
        {/* Month Nav */}
        <div className="flex items-center justify-between p-4 border-b border-surface-muted bg-surface-container-low">
          <button onClick={prevMonth} className="p-2 hover:bg-surface-muted rounded-lg transition-colors cursor-pointer">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            {loading && <span className="material-symbols-outlined text-[16px] animate-spin text-on-surface-variant">progress_activity</span>}
            {monthLabel}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-surface-muted rounded-lg transition-colors cursor-pointer">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-surface-muted">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="p-3 text-center text-xs font-semibold tracking-wider text-on-surface-variant bg-surface-container-low">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    </div>
  );
}

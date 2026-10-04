import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, type View, type SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Event } from '../types/event';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, isPastEvent } from '../lib/event-style';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

interface CalendarEntry {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

interface EventCalendarProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onSelectDate: (date: Date) => void;
}

export function EventCalendar({ events, onSelectEvent, onSelectDate }: EventCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const entries: CalendarEntry[] = useMemo(
    () =>
      events.map((e) => {
        const d = new Date(`${e.date}T00:00:00`);
        return {
          id: e.id,
          title: e.name,
          start: d,
          end: d,
          resource: e,
        };
      }),
    [events],
  );

  const eventStyleGetter = (entry: CalendarEntry) => {
    const event = entry.resource;
    const past = isPastEvent(event);
    const color = EVENT_TYPE_COLORS[event.type];
    return {
      style: {
        backgroundColor: past ? '#e7e5e4' : color,
        borderColor: 'transparent',
        borderRadius: '6px',
        color: past ? '#57534e' : '#ffffff',
        fontSize: '11px',
        fontWeight: 500,
        padding: '1px 6px',
      },
    };
  };

  return (
    <div className="veloer-calendar rounded-xl border border-border bg-card p-4">
      <Calendar
        localizer={localizer}
        events={entries}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={(entry: CalendarEntry) => onSelectEvent(entry.resource)}
        onSelectSlot={(slot: SlotInfo) => onSelectDate(slot.start)}
        selectable
        eventPropGetter={eventStyleGetter}
        style={{ height: 640 }}
        popup
        views={['month', 'agenda']}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: EVENT_TYPE_COLORS[type as Event['type']] }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

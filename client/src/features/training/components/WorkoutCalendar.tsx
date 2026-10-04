import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, type View, type SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { TrainingWorkout } from '../types/training';
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS } from '../types/training';
import { isStrengthType } from '../lib/discipline';
import { useState } from 'react';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: TrainingWorkout;
}

interface WorkoutCalendarProps {
  workouts: TrainingWorkout[];
  onSelectWorkout: (workout: TrainingWorkout) => void;
  onSelectSlot: (date: Date) => void;
}

export function WorkoutCalendar({ workouts, onSelectWorkout, onSelectSlot }: WorkoutCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const events: CalendarEvent[] = useMemo(
    () =>
      workouts.map((w) => {
        const d = new Date(w.scheduled_date + 'T00:00:00');
        const prefix = isStrengthType(w.workout_type)
          ? 'Strength'
          : WORKOUT_TYPE_LABELS[w.workout_type];
        return {
          id: w.id,
          title: `${prefix}: ${w.title}`,
          start: d,
          end: d,
          resource: w,
        };
      }),
    [workouts],
  );

  const eventStyleGetter = (event: CalendarEvent) => {
    const workout = event.resource;
    const color = WORKOUT_TYPE_COLORS[workout.workout_type];
    const isDone = workout.status === 'completed';
    const isMissed = workout.status === 'missed';
    return {
      style: {
        backgroundColor: isDone ? '#0f6e4e' : isMissed ? '#a8a29e' : color,
        borderColor: 'transparent',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '11px',
        opacity: isMissed ? 0.6 : 1,
      },
    };
  };

  return (
    <div className="veloer-calendar rounded-xl border border-border bg-card p-4">
      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={(event: CalendarEvent) => onSelectWorkout(event.resource)}
        onSelectSlot={(slotInfo: SlotInfo) => onSelectSlot(slotInfo.start)}
        selectable
        eventPropGetter={eventStyleGetter}
        style={{ height: 600 }}
        popup
      />
    </div>
  );
}

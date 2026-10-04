import { CalendarDays, MapPin, Route, Wallet, Trophy, Pencil, Trash2 } from 'lucide-react';
import type { Event } from '../types/event';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatIDR } from '@/shared/lib/utils';
import {
  countdownLabel,
  EVENT_STATUS_VARIANTS,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
} from '../lib/event-style';

interface EventDetailProps {
  event: Event;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventDetail({ event, onClose, onEdit, onDelete }: EventDetailProps) {
  const rows = [
    { icon: CalendarDays, label: 'Date', value: formatDate(event.date) },
    ...(event.location ? [{ icon: MapPin, label: 'Location', value: event.location }] : []),
    ...(event.distance != null
      ? [{ icon: Route, label: 'Distance', value: `${event.distance} km` }]
      : []),
    ...(event.registration_fee != null
      ? [{ icon: Wallet, label: 'Registration fee', value: formatIDR(event.registration_fee) }]
      : []),
    ...(event.result ? [{ icon: Trophy, label: 'Result', value: event.result }] : []),
  ];

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {EVENT_TYPE_LABELS[event.type]}
            </span>
          </div>
          <SheetTitle className="text-xl">{event.name}</SheetTitle>
          <SheetDescription>{countdownLabel(event.date)}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          <div>
            <Badge variant={EVENT_STATUS_VARIANTS[event.status]}>{event.status}</Badge>
          </div>

          <dl className="space-y-3">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-start gap-3">
                  <Icon
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="text-sm font-medium text-foreground">{row.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>

          {event.notes && (
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notes
              </p>
              <p className="mt-1 text-sm text-foreground">{event.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2 border-t border-border p-4">
          <Button variant="outline" className="flex-1" onClick={() => onEdit(event)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => onDelete(event)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

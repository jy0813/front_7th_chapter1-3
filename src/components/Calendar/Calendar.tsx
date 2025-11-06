import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { Event, RepeatType } from '../../types';

export interface CalendarProps {
  view: 'week' | 'month';
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateClick?: (_dateString: string) => void;
  getRepeatTypeLabel: (_type: RepeatType) => string;
}

export const Calendar = ({
  view,
  currentDate,
  events,
  notifiedEvents,
  holidays,
  onDateClick,
  getRepeatTypeLabel,
}: CalendarProps) => {
  return view === 'week' ? (
    <WeekView
      currentDate={currentDate}
      events={events}
      notifiedEvents={notifiedEvents}
      holidays={holidays}
      onDateClick={onDateClick}
      getRepeatTypeLabel={getRepeatTypeLabel}
    />
  ) : (
    <MonthView
      currentDate={currentDate}
      events={events}
      notifiedEvents={notifiedEvents}
      holidays={holidays}
      onDateClick={onDateClick}
      getRepeatTypeLabel={getRepeatTypeLabel}
    />
  );
};

import {
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';

import DraggableEvent from './DraggableEvent';
import DroppableCell from './DroppableCell';
import { Event, RepeatType } from '../../types';
import { formatMonth, getWeeksAtMonth, formatDate, getEventsForDay } from '../../utils/dateUtils';

export interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateClick?: (_dateString: string) => void;
  getRepeatTypeLabel: (_type: RepeatType) => string;
}

export const MonthView = ({
  currentDate,
  events,
  notifiedEvents,
  holidays,
  onDateClick = () => {},
  getRepeatTypeLabel,
}: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatMonth(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const holiday = holidays[dateString];

                  return (
                    <DroppableCell
                      key={dayIndex}
                      dateString={dateString}
                      day={day}
                      holiday={holiday}
                      onClick={() => onDateClick(dateString)}
                    >
                      {day &&
                        getEventsForDay(events, day).map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          const isRepeating = event.repeat.type !== 'none';

                          return (
                            <DraggableEvent
                              key={event.id}
                              event={event}
                              isNotified={isNotified}
                              isRepeating={isRepeating}
                              getRepeatTypeLabel={getRepeatTypeLabel}
                            />
                          );
                        })}
                    </DroppableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

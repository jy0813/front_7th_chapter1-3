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
import { formatWeek, getWeekDates, formatDate } from '../../utils/dateUtils';

export interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateClick?: (_dateString: string) => void;
  getRepeatTypeLabel: (_type: RepeatType) => string;
}

export const WeekView = ({
  currentDate,
  events,
  notifiedEvents,
  holidays,
  onDateClick = () => {},
  getRepeatTypeLabel,
}: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatWeek(currentDate)}</Typography>
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
            <TableRow>
              {weekDates.map((date) => {
                const dateString = formatDate(date, date.getDate());
                const day = date.getDate();
                const holiday = holidays[dateString];

                return (
                  <DroppableCell
                    key={date.toISOString()}
                    dateString={dateString}
                    day={day}
                    holiday={holiday}
                    onClick={() => onDateClick(dateString)}
                  >
                    {events
                      .filter(
                        (event) => new Date(event.date).toDateString() === date.toDateString()
                      )
                      .map((event) => {
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
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

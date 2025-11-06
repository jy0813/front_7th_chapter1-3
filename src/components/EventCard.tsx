import { Notifications, Repeat } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { forwardRef, CSSProperties } from 'react';

import { Event, RepeatType } from '../types';

interface EventCardProps {
  event: Event;
  isNotified: boolean;
  isRepeating: boolean;
  getRepeatTypeLabel: (_type: RepeatType) => string;
  style?: CSSProperties;
}

const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

const EventCard = forwardRef<HTMLDivElement, EventCardProps>(
  ({ event, isNotified, isRepeating, getRepeatTypeLabel, style }, ref) => {
    return (
      <Box
        ref={ref}
        data-testid={`event-${event.id}`}
        sx={{
          ...style,
          ...eventBoxStyles.common,
          ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {isNotified && <Notifications fontSize="small" />}
          {isRepeating && (
            <Tooltip
              title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
              }`}
            >
              <Repeat fontSize="small" data-testid="RepeatIcon" />
            </Tooltip>
          )}
          <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
            {event.title}
          </Typography>
        </Stack>
      </Box>
    );
  }
);

EventCard.displayName = 'EventCard';

export default EventCard;

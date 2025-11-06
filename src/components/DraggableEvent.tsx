import { useDraggable } from '@dnd-kit/core';

import { Event, RepeatType } from '../types';
import EventCard from './EventCard';

interface DraggableEventProps {
  event: Event;
  isNotified: boolean;
  isRepeating: boolean;
  getRepeatTypeLabel: (_type: RepeatType) => string;
}

const DraggableEvent = ({
  event,
  isNotified,
  isRepeating,
  getRepeatTypeLabel,
}: DraggableEventProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <EventCard
        event={event}
        isNotified={isNotified}
        isRepeating={isRepeating}
        getRepeatTypeLabel={getRepeatTypeLabel}
        style={style}
      />
    </div>
  );
};

export default DraggableEvent;

import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  Delete,
  Edit,
  Notifications,
  Repeat,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { Calendar } from './components/Calendar/Calendar';
import DraggableEvent from './components/Calendar/DraggableEvent.tsx';
import { OverlapWarningDialog } from './components/Dialogs/OverlapWarningDialog.tsx';
import RecurringEventDialog from './components/Dialogs/RecurringEventDialog.tsx';
import { EventForm } from './components/EventForm/EventForm.tsx';
import { notificationOptions } from './constants/formOptions';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType, RepeatType } from './types.ts';
import { addDays, calculateDaysDiff } from './utils/dateUtils.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

function App() {
  // 드래그 센서 설정: 2px 이상 움직여야 드래그 시작 (클릭과 드래그 구분)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );

  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, updateEvent, deleteEvent, createRepeatEvent, fetchEvents } =
    useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));

  const { handleRecurringEdit, handleRecurringDelete, findRelatedRecurringEvents } =
    useRecurringEventOperations(events, async () => {
      // After recurring edit, refresh events from server
      await fetchEvents();
      setEditingEvent(null);
    });

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null); // true = single, false = all
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete' | 'move'>(
    'edit'
  );
  const [pendingDragMove, setPendingDragMove] = useState<{
    event: Event;
    newDate: string;
  } | null>(null);
  const [pendingOverlapConfirm, setPendingOverlapConfirm] = useState<'drag' | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    // 이동 모드 처리
    if (recurringDialogMode === 'move' && pendingDragMove) {
      await handleRecurringMove(pendingDragMove.event, pendingDragMove.newDate, editSingleOnly);
      setIsRecurringDialogOpen(false);
      setPendingDragMove(null);
      return;
    }

    // 편집 모드 처리
    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      // 편집 모드 저장하고 편집 폼으로 이동
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
      return;
    }

    // 삭제 모드 처리
    if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    }
  };

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  const handleRecurringMove = async (
    draggedEvent: Event,
    newDate: string,
    moveSingleOnly: boolean
  ) => {
    try {
      if (moveSingleOnly) {
        // "예" - 단일 일정만 이동 (반복 속성 제거)
        const updatedEvent: Event = {
          ...draggedEvent,
          date: newDate,
          repeat: {
            type: 'none',
            interval: 0,
          },
        };
        await updateEvent(updatedEvent);
        enqueueSnackbar('일정이 이동되었습니다', { variant: 'success' });
      } else {
        // "아니오" - 시리즈 전체 이동
        const daysDiff = calculateDaysDiff(draggedEvent.date, newDate);
        const relatedEvents = findRelatedRecurringEvents(draggedEvent);

        if (relatedEvents.length === 0) {
          // 연관 일정이 없으면 단일 이동
          const updatedEvent: Event = { ...draggedEvent, date: newDate };
          await updateEvent(updatedEvent);
        } else {
          // 모든 관련 일정의 날짜 이동
          const updatedEvents = relatedEvents.map((event) => ({
            ...event,
            date: addDays(event.date, daysDiff),
          }));

          const response = await fetch('/api/events-list', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: updatedEvents }),
          });

          if (!response.ok) {
            throw new Error('Failed to move recurring events');
          }

          await fetchEvents();
        }
        enqueueSnackbar('반복 일정이 모두 이동되었습니다', { variant: 'success' });
      }
    } catch (error) {
      console.error('일정 이동 실패:', error);
      enqueueSnackbar('일정 이동에 실패했습니다', { variant: 'error' });
    }
  };

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventFormType = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? editingEvent.repeat // Keep original repeat settings for recurring event detection
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    // 수정
    if (editingEvent) {
      if (hasOverlapEvent) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }

      if (
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.interval > 0 &&
        recurringEditMode !== null
      ) {
        await handleRecurringEdit(eventData as Event, recurringEditMode);
        setRecurringEditMode(null);
      } else {
        await saveEvent(eventData);
      }

      resetForm();
      return;
    }

    // 생성
    if (isRepeating) {
      // 반복 생성은 반복 일정을 고려하지 않는다.
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    if (hasOverlapEvent) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEvent(event.active.data.current?.event);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveEvent(null);

    // 드롭존 밖에 떨어뜨렸거나, 드롭 대상이 없으면 취소
    if (!over) {
      return;
    }

    const draggedEvent = active.data.current?.event as Event;
    const newDateString = over.id as string;

    // 같은 날짜면 변경 안 함
    if (draggedEvent.date === newDateString) {
      return;
    }

    if (isRecurringEvent(draggedEvent)) {
      // 반복 일정 다이얼로그 표시
      setPendingDragMove({
        event: draggedEvent,
        newDate: newDateString,
      });
      setRecurringDialogMode('move');
      setIsRecurringDialogOpen(true);
      return;
    }

    // 날짜만 변경한 새 일정 객체
    const updatedEvent: Event = {
      ...draggedEvent,
      date: newDateString,
    };

    // 겹침 체크
    const overlapping = findOverlappingEvents(updatedEvent, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setPendingDragMove({
        event: draggedEvent,
        newDate: newDateString,
      });
      setPendingOverlapConfirm('drag');
      setIsOverlapDialogOpen(true);
      return;
    }

    try {
      await updateEvent(updatedEvent);
    } catch (error) {
      console.error('일정 이동 실패:', error);
      enqueueSnackbar('일정 이동에 실패했습니다', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <Box sx={{ width: '20%' }}>
          <EventForm
            title={title}
            setTitle={setTitle}
            date={date}
            setDate={setDate}
            startTime={startTime}
            endTime={endTime}
            description={description}
            setDescription={setDescription}
            location={location}
            setLocation={setLocation}
            category={category}
            setCategory={setCategory}
            isRepeating={isRepeating}
            setIsRepeating={setIsRepeating}
            repeatType={repeatType}
            setRepeatType={setRepeatType}
            repeatInterval={repeatInterval}
            setRepeatInterval={setRepeatInterval}
            repeatEndDate={repeatEndDate}
            setRepeatEndDate={setRepeatEndDate}
            notificationTime={notificationTime}
            setNotificationTime={setNotificationTime}
            startTimeError={startTimeError}
            endTimeError={endTimeError}
            editingEvent={editingEvent}
            handleStartTimeChange={handleStartTimeChange}
            handleEndTimeChange={handleEndTimeChange}
            onSubmit={addOrUpdateEvent}
          />
        </Box>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Stack flex={1} spacing={5}>
            <Typography variant="h4">일정 보기</Typography>

            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
                <ChevronLeft />
              </IconButton>
              <Select
                size="small"
                aria-label="뷰 타입 선택"
                value={view}
                onChange={(e) => setView(e.target.value as 'week' | 'month')}
              >
                <MenuItem value="week" aria-label="week-option">
                  Week
                </MenuItem>
                <MenuItem value="month" aria-label="month-option">
                  Month
                </MenuItem>
              </Select>
              <IconButton aria-label="Next" onClick={() => navigate('next')}>
                <ChevronRight />
              </IconButton>
            </Stack>

            <Calendar
              view={view}
              currentDate={currentDate}
              events={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
              onDateClick={setDate}
              getRepeatTypeLabel={getRepeatTypeLabel}
            />
          </Stack>
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: 'ease-out',
              keyframes() {
                return [
                  { opacity: 1, scaleX: 1, scaleY: 1 },
                  { opacity: 0, scaleX: 1, scaleY: 1 },
                ];
              },
            }}
          >
            {activeEvent && (
              <DraggableEvent
                event={activeEvent}
                isNotified={notifiedEvents.includes(activeEvent.id)}
                isRepeating={activeEvent.repeat.type !== 'none'}
                getRepeatTypeLabel={getRepeatTypeLabel}
              />
            )}
          </DragOverlay>
        </DndContext>

        <Stack
          data-testid="event-list"
          spacing={2}
          sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
        >
          <FormControl fullWidth>
            <FormLabel htmlFor="search">일정 검색</FormLabel>
            <TextField
              id="search"
              size="small"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          {filteredEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            filteredEvents.map((event) => (
              <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                      {event.repeat.type !== 'none' && (
                        <Tooltip
                          title={`${event.repeat.interval}${getRepeatTypeLabel(
                            event.repeat.type
                          )}마다 반복${
                            event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
                          }`}
                        >
                          <Repeat fontSize="small" />
                        </Tooltip>
                      )}
                      <Typography
                        fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                        color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                      >
                        {event.title}
                      </Typography>
                    </Stack>
                    <Typography>{event.date}</Typography>
                    <Typography>
                      {event.startTime} - {event.endTime}
                    </Typography>
                    <Typography>{event.description}</Typography>
                    <Typography>{event.location}</Typography>
                    <Typography>카테고리: {event.category}</Typography>
                    {event.repeat.type !== 'none' && (
                      <Typography>
                        반복: {event.repeat.interval}
                        {event.repeat.type === 'daily' && '일'}
                        {event.repeat.type === 'weekly' && '주'}
                        {event.repeat.type === 'monthly' && '월'}
                        {event.repeat.type === 'yearly' && '년'}
                        마다
                        {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                      </Typography>
                    )}
                    <Typography>
                      알림:{' '}
                      {
                        notificationOptions.find(
                          (option) => option.value === event.notificationTime
                        )?.label
                      }
                    </Typography>
                  </Stack>
                  <Stack>
                    <IconButton aria-label="Edit event" onClick={() => handleEditEvent(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton aria-label="Delete event" onClick={() => handleDeleteEvent(event)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Stack>

      <OverlapWarningDialog
        open={isOverlapDialogOpen}
        onClose={() => {
          setIsOverlapDialogOpen(false);
          setPendingOverlapConfirm(null);
          setPendingDragMove(null);
        }}
        onConfirm={async () => {
          setIsOverlapDialogOpen(false);

          // 드래그 이동 처리
          if (pendingOverlapConfirm === 'drag' && pendingDragMove) {
            const updatedEvent: Event = {
              ...pendingDragMove.event,
              date: pendingDragMove.newDate,
            };
            try {
              await updateEvent(updatedEvent);
            } catch (error) {
              console.error('일정 이동 실패:', error);
              enqueueSnackbar('일정 이동에 실패했습니다', { variant: 'error' });
            }
            setPendingDragMove(null);
            setPendingOverlapConfirm(null);
            return;
          }

          // 생성/수정 처리
          await saveEvent({
            id: editingEvent ? editingEvent.id : undefined,
            title,
            date,
            startTime,
            endTime,
            description,
            location,
            category,
            repeat: {
              type: isRepeating ? repeatType : 'none',
              interval: repeatInterval,
              endDate: repeatEndDate || undefined,
            },
            notificationTime,
          });
        }}
        overlappingEvents={overlappingEvents}
      />

      <RecurringEventDialog
        open={isRecurringDialogOpen}
        onClose={() => {
          setIsRecurringDialogOpen(false);
          setPendingRecurringEdit(null);
          setPendingRecurringDelete(null);
        }}
        onConfirm={handleRecurringConfirm}
        event={recurringDialogMode === 'edit' ? pendingRecurringEdit : pendingRecurringDelete}
        mode={recurringDialogMode}
      />

      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;

import { Table, TableBody, TableRow } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import DraggableEvent from './DraggableEvent';
import DroppableCell from './DroppableCell';
import { Event } from '../../types';

// 공통 헬퍼 함수
const getRepeatTypeLabel = (type: string) => {
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

// 테스트용 이벤트 생성 헬퍼
const createEvent = (id: string, title: string, overrides: Partial<Event> = {}): Event => ({
  id,
  title,
  date: '2025-11-06',
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
  ...overrides,
});

const meta: Meta<typeof DroppableCell> = {
  component: DroppableCell,
  title: '각 셀 텍스트 길이에 따른 처리/DroppableCell',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Table style={{ tableLayout: 'fixed', width: '150px' }}>
        <TableBody>
          <TableRow>
            <Story />
          </TableRow>
        </TableBody>
      </Table>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '날짜 셀 컴포넌트 - 말줄임 처리된 이벤트 제목이 정상적으로 표시되는지 검증합니다.',
      },
    },
  },
  argTypes: {
    dateString: { control: 'text' },
    day: { control: 'number' },
    holiday: { control: 'text' },
    onClick: { control: false },
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: '빈 셀',
  args: {
    dateString: '2025-11-06',
    day: 6,
    onClick: () => {},
    children: null,
  },
  parameters: {
    docs: {
      description: {
        story: '이벤트가 없는 빈 날짜 셀',
      },
    },
  },
};

export const SingleEvent: Story = {
  name: '단일 이벤트',
  args: {
    dateString: '2025-11-06',
    day: 6,
    onClick: () => {},
    children: (
      <DraggableEvent
        event={createEvent('1', '팀 회의')}
        isNotified={false}
        isRepeating={false}
        getRepeatTypeLabel={getRepeatTypeLabel}
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '이벤트 1개만 있는 정상 상태',
      },
    },
  },
};

export const SingleLongTitleEvent: Story = {
  name: '단일 긴 제목 이벤트',
  args: {
    dateString: '2025-11-06',
    day: 6,
    onClick: () => {},
    children: (
      <DraggableEvent
        event={createEvent(
          '1',
          '2025년 4분기 전사 경영전략 회의 및 실적 분석 보고회 (본사 대강당)'
        )}
        isNotified={false}
        isRepeating={false}
        getRepeatTypeLabel={getRepeatTypeLabel}
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '긴 제목 이벤트 1개 - noWrap으로 "..." 처리되는지 검증',
      },
    },
  },
};

export const MultipleEvents: Story = {
  name: '다중 이벤트 (정상)',
  args: {
    dateString: '2025-11-06',
    day: 6,
    onClick: () => {},
    children: (
      <>
        <DraggableEvent
          event={createEvent('1', '아주 긴 제목의 일정 제목 테스트 용도입니다')}
          isNotified={false}
          isRepeating={false}
          getRepeatTypeLabel={getRepeatTypeLabel}
        />
        <DraggableEvent
          event={createEvent('2', '아주 긴 제목의 일정 제목 테스트 용도입니다')}
          isNotified={true}
          isRepeating={false}
          getRepeatTypeLabel={getRepeatTypeLabel}
        />
        <DraggableEvent
          event={createEvent('3', '아주 긴 제목의 일정 제목 테스트 용도입니다', {
            repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
          })}
          isNotified={false}
          isRepeating={true}
          getRepeatTypeLabel={getRepeatTypeLabel}
        />
        <DraggableEvent
          event={createEvent('4', '아주 긴 제목의 일정 제목 테스트 용도입니다')}
          isNotified={false}
          isRepeating={false}
          getRepeatTypeLabel={getRepeatTypeLabel}
        />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '이벤트 3-4개 noWrap으로 "..." 처리되는지 검증',
      },
    },
  },
};

export const WithHoliday: Story = {
  name: '휴일 + 다중 이벤트',
  args: {
    dateString: '2025-11-06',
    day: 6,
    holiday: '광복절',
    onClick: () => {},
    children: (
      <>
        <DraggableEvent
          event={createEvent('1', '아주 긴 제목의 일정 제목 테스트 용도입니다')}
          isNotified={false}
          isRepeating={false}
          getRepeatTypeLabel={getRepeatTypeLabel}
        />
        <DraggableEvent
          event={createEvent('2', '아주 긴 제목의 일정 제목 테스트 용도입니다')}
          isNotified={true}
          isRepeating={false}
          getRepeatTypeLabel={getRepeatTypeLabel}
        />
        <DraggableEvent
          event={createEvent('3', '아주 긴 제목의 일정 제목 테스트 용도입니다')}
          isNotified={false}
          isRepeating={true}
          getRepeatTypeLabel={getRepeatTypeLabel}
        />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '휴일 텍스트가 + 다중 이벤트 noWrap으로 "..." 처리되는지 검증',
      },
    },
  },
};

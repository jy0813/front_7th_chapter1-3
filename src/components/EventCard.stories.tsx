import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import EventCard from './EventCard';
import { Event } from '../types';

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

// 테스트용 이벤트 데이터
const createEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: '팀 회의',
  date: '2025-11-06',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 회의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
  ...overrides,
});

const meta: Meta<typeof EventCard> = {
  component: EventCard,
  title: 'Components/EventCard',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ padding: '20px', maxWidth: '300px' }}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '일정 카드 컴포넌트 - 알림, 반복 일정 등 다양한 상태를 시각적으로 표현합니다. 드래그 기능이 없는 순수 UI 컴포넌트입니다.',
      },
    },
  },
  argTypes: {
    event: { control: false },
    isNotified: {
      control: 'boolean',
      description: '알림 설정 여부 - true일 경우 빨간 배경과 Notifications 아이콘 표시',
    },
    isRepeating: {
      control: 'boolean',
      description: '반복 일정 여부 - true일 경우 Repeat 아이콘과 툴팁 표시',
    },
    getRepeatTypeLabel: { control: false },
    style: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '기본 상태',
  args: {
    event: createEvent(),
    isNotified: false,
    isRepeating: false,
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '회색 배경(#f5f5f5)에 일정 제목만 표시',
      },
    },
  },
};

export const Notified: Story = {
  name: '알림 상태',
  args: {
    event: createEvent({
      notificationTime: 10,
    }),
    isNotified: true,
    isRepeating: false,
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '빨간 배경(#ffebee), 굵은 글씨, Notifications 아이콘 표시',
      },
    },
  },
};

export const Repeating: Story = {
  name: '반복 일정',
  args: {
    event: createEvent({
      repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
    }),
    isNotified: false,
    isRepeating: true,
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: 'Repeat 아이콘과 툴팁 표시',
      },
    },
  },
};

export const RepeatingWithEndDate: Story = {
  name: '반복 일정 (종료일)',
  args: {
    event: createEvent({
      repeat: { type: 'daily', interval: 1, id: 'repeat-2', endDate: '2025-12-31' },
    }),
    isNotified: false,
    isRepeating: true,
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '툴팁에 종료일 정보 표시 (종료: 2025-12-31)',
      },
    },
  },
};

export const NotifiedAndRepeating: Story = {
  name: '알림 + 반복',
  args: {
    event: createEvent({
      repeat: { type: 'daily', interval: 1, id: 'repeat-4' },
      notificationTime: 10,
    }),
    isNotified: true,
    isRepeating: true,
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '빨간 배경에 Notifications와 Repeat 아이콘 모두 표시',
      },
    },
  },
};

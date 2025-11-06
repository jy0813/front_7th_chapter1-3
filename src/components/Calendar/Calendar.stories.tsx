import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Calendar } from './Calendar';
import { Event } from '../../types';

const theme = createTheme();

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

// ==================== 공통 이벤트 데이터 ====================

const commonEvents = {
  teamMeeting: {
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
  } as Event,

  lunch: {
    id: '2',
    title: '점심 약속',
    date: '2025-11-07',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '강남역',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,

  projectDeadline: {
    id: '3',
    title: '프로젝트 마감',
    date: '2025-11-08',
    startTime: '09:00',
    endTime: '18:00',
    description: '최종 제출',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  } as Event,

  exercise: {
    id: '4',
    title: '운동',
    date: '2025-11-09',
    startTime: '19:00',
    endTime: '20:30',
    description: '헬스장',
    location: '센트럴 짐',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,

  importantMeeting: {
    id: '1',
    title: '중요 회의',
    date: '2025-11-06',
    startTime: '14:00',
    endTime: '15:00',
    description: '임원진 회의',
    location: '본사 대회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,

  hospital: {
    id: '2',
    title: '병원 예약',
    date: '2025-11-07',
    startTime: '10:00',
    endTime: '11:00',
    description: '정기 검진',
    location: '서울대병원',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  } as Event,

  presentation: {
    id: '3',
    title: '프레젠테이션',
    date: '2025-11-08',
    startTime: '16:00',
    endTime: '17:00',
    description: '분기 실적 발표',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 120,
  } as Event,

  morningJog: (date: string, id: string): Event => ({
    id,
    title: '아침 조깅',
    date,
    startTime: '06:00',
    endTime: '07:00',
    description: '건강 관리',
    location: '한강공원',
    category: '개인',
    repeat: { type: 'daily', interval: 1, id: 'repeat-1' },
    notificationTime: 10,
  }),

  weeklyMeeting: (date: string, id: string): Event => ({
    id,
    title: '주간 회의',
    date,
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 업무 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, id: 'repeat-2' },
    notificationTime: 30,
  }),

  morningMeeting: {
    id: '1',
    title: '오전 회의',
    date: '2025-11-06',
    startTime: '10:00',
    endTime: '12:00',
    description: '전략 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,

  urgentMeeting: {
    id: '2',
    title: '긴급 미팅',
    date: '2025-11-06',
    startTime: '11:00',
    endTime: '12:00',
    description: '고객사 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,

  lunchTeam: {
    id: '3',
    title: '점심 식사',
    date: '2025-11-06',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀 점심',
    location: '구내식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event,

  workshop: {
    id: '4',
    title: '워크샵',
    date: '2025-11-07',
    startTime: '09:00',
    endTime: '18:00',
    description: '전사 워크샵',
    location: '강남',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  } as Event,

  teamBuilding: {
    id: '5',
    title: '팀 빌딩',
    date: '2025-11-07',
    startTime: '14:00',
    endTime: '17:00',
    description: '팀 빌딩 활동',
    location: '강남',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  } as Event,

  familyGathering: {
    id: '1',
    title: '가족 모임',
    date: '2025-11-06',
    startTime: '12:00',
    endTime: '15:00',
    description: '가족 점심 식사',
    location: '집',
    category: '가족',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  } as Event,

  friendMeeting: {
    id: '2',
    title: '친구 만남',
    date: '2025-11-07',
    startTime: '14:00',
    endTime: '17:00',
    description: '카페에서 수다',
    location: '스타벅스',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  } as Event,
};

// 시나리오별 이벤트 세트
const eventSets = {
  week: {
    basic: [
      commonEvents.teamMeeting,
      commonEvents.lunch,
      commonEvents.projectDeadline,
      commonEvents.exercise,
    ],
    withNotifications: [
      commonEvents.importantMeeting,
      commonEvents.hospital,
      commonEvents.presentation,
    ],
    repeating: [
      commonEvents.morningJog('2025-11-04', '1'),
      commonEvents.morningJog('2025-11-05', '2'),
      commonEvents.morningJog('2025-11-06', '3'),
      commonEvents.morningJog('2025-11-07', '4'),
      commonEvents.morningJog('2025-11-08', '5'),
      commonEvents.weeklyMeeting('2025-11-04', '6'),
    ],
    overlapping: [
      commonEvents.morningMeeting,
      commonEvents.urgentMeeting,
      commonEvents.lunchTeam,
      commonEvents.workshop,
      commonEvents.teamBuilding,
    ],
    withHolidays: [commonEvents.familyGathering, commonEvents.friendMeeting],
  },
  month: {
    basic: [
      { ...commonEvents.teamMeeting, date: '2025-11-06' },
      { ...commonEvents.lunch, date: '2025-11-12', id: '2' },
      { ...commonEvents.projectDeadline, date: '2025-11-20', id: '3' },
      { ...commonEvents.exercise, date: '2025-11-25', id: '4' },
    ],
    withNotifications: [
      { ...commonEvents.importantMeeting, date: '2025-11-06' },
      { ...commonEvents.hospital, date: '2025-11-15' },
      { ...commonEvents.presentation, date: '2025-11-22' },
    ],
    repeating: [
      commonEvents.morningJog('2025-11-03', '1'),
      commonEvents.morningJog('2025-11-04', '2'),
      commonEvents.morningJog('2025-11-05', '3'),
      commonEvents.morningJog('2025-11-06', '4'),
      commonEvents.morningJog('2025-11-07', '5'),
      commonEvents.weeklyMeeting('2025-11-03', '6'),
      commonEvents.weeklyMeeting('2025-11-10', '7'),
      commonEvents.weeklyMeeting('2025-11-17', '8'),
      commonEvents.weeklyMeeting('2025-11-24', '9'),
    ],
    overlapping: [
      { ...commonEvents.morningMeeting, date: '2025-11-06' },
      { ...commonEvents.urgentMeeting, date: '2025-11-06' },
      { ...commonEvents.lunchTeam, date: '2025-11-06' },
      { ...commonEvents.workshop, date: '2025-11-15', id: '4' },
      { ...commonEvents.teamBuilding, date: '2025-11-15', id: '5' },
    ],
    withHolidays: [
      { ...commonEvents.familyGathering, date: '2025-11-06' },
      { ...commonEvents.friendMeeting, date: '2025-11-15', id: '2' },
    ],
  },
};

const commonHolidays = {
  '2025-11-06': '한글날',
  '2025-11-07': '임시공휴일',
};

const monthHolidays = {
  '2025-11-06': '한글날',
  '2025-11-15': '광복절',
};

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  title: 'Calendar/Calendar',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '캘린더 컴포넌트 - view prop에 따라 주간/월간 뷰를 표시합니다.',
      },
    },
  },
  argTypes: {
    view: {
      control: 'radio',
      options: ['week', 'month'],
      description: '캘린더 뷰 타입',
    },
    currentDate: { control: false },
    events: { control: false },
    notifiedEvents: { control: false },
    holidays: { control: false },
    getRepeatTypeLabel: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Week_Empty: Story = {
  name: '주간 뷰 - 빈 캘린더',
  args: {
    view: 'week',
    currentDate: new Date('2025-11-06'),
    events: [],
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '일정이 없는 빈 주간 캘린더',
      },
    },
  },
};

export const Week_WithEvents: Story = {
  name: '주간 뷰 - 일정 있음',
  args: {
    view: 'week',
    currentDate: new Date('2025-11-06'),
    events: eventSets.week.basic,
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '다양한 카테고리의 일정이 포함된 주간 캘린더',
      },
    },
  },
};

export const Week_WithNotifications: Story = {
  name: '주간 뷰 - 알림',
  args: {
    view: 'week',
    currentDate: new Date('2025-11-06'),
    events: eventSets.week.withNotifications,
    notifiedEvents: ['1', '2'],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '알림이 활성화된 일정들이 포함된 주간 캘린더',
      },
    },
  },
};

export const Week_WithRepeatingEvents: Story = {
  name: '주간 뷰 - 반복 일정',
  args: {
    view: 'week',
    currentDate: new Date('2025-11-06'),
    events: eventSets.week.repeating,
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '매일/매주 반복되는 일정이 포함된 주간 캘린더',
      },
    },
  },
};

export const Week_WithOverlappingEvents: Story = {
  name: '주간 뷰 - 겹치는 일정',
  args: {
    view: 'week',
    currentDate: new Date('2025-11-06'),
    events: eventSets.week.overlapping,
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '시간이 겹치는 일정들이 포함된 주간 캘린더',
      },
    },
  },
};

export const Week_WithHolidays: Story = {
  name: '주간 뷰 - 공휴일',
  args: {
    view: 'week',
    currentDate: new Date('2025-11-06'),
    events: eventSets.week.withHolidays,
    notifiedEvents: [],
    holidays: commonHolidays,
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '공휴일이 포함된 주간 캘린더',
      },
    },
  },
};

export const Month_Empty: Story = {
  name: '월간 뷰 - 빈 캘린더',
  args: {
    view: 'month',
    currentDate: new Date('2025-11-06'),
    events: [],
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '일정이 없는 빈 월간 캘린더',
      },
    },
  },
};

export const Month_WithEvents: Story = {
  name: '월간 뷰 - 일정 있음',
  args: {
    view: 'month',
    currentDate: new Date('2025-11-06'),
    events: eventSets.month.basic,
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '다양한 카테고리의 일정이 포함된 월간 캘린더',
      },
    },
  },
};

export const Month_WithNotifications: Story = {
  name: '월간 뷰 - 알림',
  args: {
    view: 'month',
    currentDate: new Date('2025-11-06'),
    events: eventSets.month.withNotifications,
    notifiedEvents: ['1', '2'],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '알림이 활성화된 일정들이 포함된 월간 캘린더',
      },
    },
  },
};

export const Month_WithRepeatingEvents: Story = {
  name: '월간 뷰 - 반복 일정',
  args: {
    view: 'month',
    currentDate: new Date('2025-11-06'),
    events: eventSets.month.repeating,
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '매일/매주 반복되는 일정이 포함된 월간 캘린더',
      },
    },
  },
};

export const Month_WithOverlappingEvents: Story = {
  name: '월간 뷰 - 겹치는 일정',
  args: {
    view: 'month',
    currentDate: new Date('2025-11-06'),
    events: eventSets.month.overlapping,
    notifiedEvents: [],
    holidays: {},
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '시간이 겹치는 일정들이 포함된 월간 캘린더',
      },
    },
  },
};

export const Month_WithHolidays: Story = {
  name: '월간 뷰 - 공휴일',
  args: {
    view: 'month',
    currentDate: new Date('2025-11-06'),
    events: eventSets.month.withHolidays,
    notifiedEvents: [],
    holidays: monthHolidays,
    getRepeatTypeLabel,
  },
  parameters: {
    docs: {
      description: {
        story: '공휴일이 포함된 월간 캘린더',
      },
    },
  },
};

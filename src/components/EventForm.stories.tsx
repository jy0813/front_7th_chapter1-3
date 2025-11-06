import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { EventForm } from './EventForm';

const meta = {
  title: 'Components/EventForm',
  component: EventForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 스토리 (빈 폼)
export const Default: Story = {
  args: {
    title: '',
    setTitle: fn(),
    date: '',
    setDate: fn(),
    startTime: '',
    endTime: '',
    description: '',
    setDescription: fn(),
    location: '',
    setLocation: fn(),
    category: '업무',
    setCategory: fn(),
    isRepeating: false,
    setIsRepeating: fn(),
    repeatType: 'none',
    setRepeatType: fn(),
    repeatInterval: 1,
    setRepeatInterval: fn(),
    repeatEndDate: '',
    setRepeatEndDate: fn(),
    notificationTime: 10,
    setNotificationTime: fn(),
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    onSubmit: fn(),
  },
  name: '기본 (빈 폼)',
};

// 입력 완료 상태
export const Filled: Story = {
  args: {
    ...Default.args,
    title: '팀 회의',
    date: '2024-11-10',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    notificationTime: 10,
  },
  name: '입력 완료 상태',
};

// 시간 검증 에러 (시작 시간이 종료 시간보다 늦음)
export const WithTimeError: Story = {
  args: {
    ...Default.args,
    title: '점심 약속',
    date: '2024-11-10',
    startTime: '15:00',
    endTime: '14:00',
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  },
  name: '시간 검증 에러',
};

// 편집 모드
export const EditMode: Story = {
  args: {
    ...Default.args,
    title: '기존 일정',
    date: '2024-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '수정할 일정',
    location: '사무실',
    category: '개인',
    notificationTime: 60,
    editingEvent: {
      id: '1',
      title: '기존 일정',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정할 일정',
      location: '사무실',
      category: '개인',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 60,
    },
  },
  name: '편집 모드',
};

// 반복 일정 활성화 (반복 옵션 표시)
export const RepeatingEnabled: Story = {
  args: {
    ...Default.args,
    title: '매일 운동',
    date: '2024-11-10',
    startTime: '07:00',
    endTime: '08:00',
    description: '아침 조깅',
    location: '공원',
    category: '개인',
    isRepeating: true,
    repeatType: 'daily',
    repeatInterval: 1,
  },
  name: '반복 일정 활성화',
};

// 반복 일정 상세 설정 완료
export const RepeatingWithDetails: Story = {
  args: {
    ...Default.args,
    title: '주간 스터디',
    date: '2024-11-10',
    startTime: '19:00',
    endTime: '21:00',
    description: 'React 스터디',
    location: '스터디 카페',
    category: '개인',
    isRepeating: true,
    repeatType: 'weekly',
    repeatInterval: 1,
    repeatEndDate: '2024-12-31',
    notificationTime: 1440,
  },
  name: '반복 일정 상세 설정',
};

// 부분 입력 상태 (필수 필드만)
export const PartiallyFilled: Story = {
  args: {
    ...Default.args,
    title: '간단한 일정',
    date: '2024-11-10',
    startTime: '14:00',
    endTime: '15:00',
    // description, location은 비어있음
  },
  name: '부분 입력 (필수 필드만)',
};

// 반복 일정 편집 모드
export const EditRepeatingEvent: Story = {
  args: {
    ...Default.args,
    title: '매일 운동',
    date: '2024-11-10',
    startTime: '07:00',
    endTime: '08:00',
    description: '아침 조깅',
    location: '공원',
    category: '개인',
    notificationTime: 10,
    isRepeating: true,
    repeatType: 'daily',
    repeatInterval: 1,
    repeatEndDate: '2024-12-31',
    editingEvent: {
      id: '10',
      title: '매일 운동',
      date: '2024-11-10',
      startTime: '07:00',
      endTime: '08:00',
      description: '아침 조깅',
      location: '공원',
      category: '개인',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 10,
    },
  },
  name: '반복 일정 편집 모드',
};

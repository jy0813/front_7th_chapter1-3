import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { OverlapWarningDialog } from './OverlapWarningDialog';

const meta = {
  title: '다이얼로그 및 모달/OverlapWarningDialog',
  component: OverlapWarningDialog,
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        inline: false,
        iframeHeight: 500,
      },
    },
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 여부',
    },
    onClose: {
      action: 'onClose',
      description: '다이얼로그 닫기 함수',
    },
    onConfirm: {
      action: 'onConfirm',
      description: '계속 진행 버튼 클릭 함수',
    },
  },
} satisfies Meta<typeof OverlapWarningDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 단일 일정 겹침 경고
 */
export const SingleOverlap: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    overlappingEvents: [
      {
        id: '1',
        title: '팀 미팅',
        date: '2025-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
  },
};

/**
 * 여러 일정 겹침 경고
 */
export const MultipleOverlaps: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    overlappingEvents: [
      {
        id: '1',
        title: '팀 미팅',
        date: '2025-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '1:1 미팅',
        date: '2025-11-15',
        startTime: '10:30',
        endTime: '11:30',
        description: '팀장과 1:1 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '프로젝트 리뷰',
        date: '2025-11-15',
        startTime: '10:45',
        endTime: '11:45',
        description: '분기 프로젝트 리뷰',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
  },
};

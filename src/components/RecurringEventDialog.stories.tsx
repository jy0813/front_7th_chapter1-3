import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import RecurringEventDialog from './RecurringEventDialog';

const meta = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
    docs: {
      story: {
        inline: false,
        iframeHeight: 300,
      },
    },
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    event: null,
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 여부',
    },
    mode: {
      control: 'select',
      options: ['edit', 'delete', 'move'],
      description: '다이얼로그 모드 (수정/삭제/이동)',
    },
    onClose: {
      action: 'onClose',
      description: '다이얼로그 닫기 함수',
    },
    onConfirm: {
      action: 'onConfirm',
      description: '확인 버튼 클릭 함수 (true: 단일, false: 전체)',
    },
  },
} satisfies Meta<typeof RecurringEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// 공통 반복 일정 데이터
const weeklyEvent = {
  id: '1',
  title: '주간 팀 미팅',
  date: '2025-11-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '매주 월요일 팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'weekly' as const, interval: 1, id: 'weekly-123' },
  notificationTime: 10,
};

/**
 * 반복 일정 수정 모드
 * - 제목: "반복 일정 수정"
 * - 메시지: "해당 일정만 수정하시겠어요?"
 * - 버튼: 취소 / 아니오 (전체) / 예 (단일)
 */
export const EditMode: Story = {
  args: {
    mode: 'edit',
    event: weeklyEvent,
  },
};

/**
 * 반복 일정 삭제 모드
 * - 제목: "반복 일정 삭제"
 * - 메시지: "해당 일정만 삭제하시겠어요?"
 * - 버튼: 취소 / 아니오 (전체) / 예 (단일)
 */
export const DeleteMode: Story = {
  args: {
    mode: 'delete',
    event: weeklyEvent,
  },
};

/**
 * 반복 일정 이동 모드 (드래그 앤 드롭)
 * - 제목: "반복 일정 이동"
 * - 메시지: "해당 일정만 이동하시겠어요?"
 * - 버튼: 취소 / 아니오 (전체) / 예 (단일)
 */
export const MoveMode: Story = {
  args: {
    mode: 'move',
    event: weeklyEvent,
  },
};

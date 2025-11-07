import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect } from 'vitest';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('일정 폼 검증 통합 테스트', () => {
  describe('필수 필드 검증', () => {
    it('필수 필드 누락 시 에러 메시지가 표시된다', async () => {
      setupMockHandlerCreation([]);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 제목을 입력하지 않고 다른 필드만 입력
      const dateInput = screen.getByLabelText('날짜');
      await user.type(dateInput, '2025-10-15');

      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.type(startTimeInput, '14:00');

      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.type(endTimeInput, '15:00');

      // 제출 시도
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // 에러 메시지 확인
      await screen.findByText('필수 정보를 모두 입력해주세요.');

      // 일정이 생성되지 않았는지 확인
      expect(screen.queryByText('일정이 추가되었습니다')).not.toBeInTheDocument();
    });
  });

  describe('시간 유효성 검증', () => {
    it('종료 시간이 시작 시간보다 빠르면 에러 메시지가 표시된다', async () => {
      setupMockHandlerCreation([]);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 모든 필드 입력 (시간만 잘못됨)
      const titleInput = screen.getByLabelText('제목');
      await user.type(titleInput, '잘못된 시간');

      const dateInput = screen.getByLabelText('날짜');
      await user.type(dateInput, '2025-10-15');

      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.type(startTimeInput, '15:00');

      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.type(endTimeInput, '14:00'); // 시작보다 빠름

      // 제출 시도
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // 시간 에러 메시지 확인
      await screen.findByText('시간 설정을 확인해주세요.');

      // 일정이 생성되지 않았는지 확인
      expect(screen.queryByText('일정이 추가되었습니다')).not.toBeInTheDocument();
    });
  });

  describe('부분 수정 검증', () => {
    it('시간만 수정 시 다른 필드는 유지된다', async () => {
      // 기존 일정이 있는 상태로 시작
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '시간 수정 테스트',
          date: '2025-10-20',
          startTime: '10:00',
          endTime: '11:00',
          description: '원본 설명',
          location: '원본 위치',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 일정 목록에서 조회
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('시간 수정 테스트')).toBeInTheDocument();

      // 일정 클릭 후 수정 모드 진입
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 시간만 변경
      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '14:00');

      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '15:00');

      // 저장
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // 수정 성공 확인
      await screen.findByText('일정이 수정되었습니다');

      // 시간만 변경되고 다른 필드는 유지되는지 확인
      const updatedEventList = within(screen.getByTestId('event-list'));
      expect(updatedEventList.getByText('시간 수정 테스트')).toBeInTheDocument();
      expect(updatedEventList.getByText(/14:00 - 15:00/)).toBeInTheDocument();
      expect(updatedEventList.getByText('원본 설명')).toBeInTheDocument();
      expect(updatedEventList.getByText('원본 위치')).toBeInTheDocument();
    });
  });
});

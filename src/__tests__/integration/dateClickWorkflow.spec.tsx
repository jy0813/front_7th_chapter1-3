import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = () => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('날짜 클릭 워크플로우', () => {
  it('일정 추가 시 캘린더에서 날짜 셀을 클릭하면 해당 날짜에 일정이 생성된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup();

    // 1. 날짜 셀 클릭 (2025년 10월 15일)
    const dateCell = screen.getByTestId('date-cell-2025-10-15');
    await user.click(dateCell);

    // 2. 날짜 입력 폼에 자동 입력 확인
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-15');

    // 3. 나머지 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '클릭 테스트 일정');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '날짜 클릭으로 생성');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 4. 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 5. 일정 추가 스낵바 확인
    expect(await screen.findByText('일정이 추가되었습니다')).toBeVisible();

    // 6. 이벤트 리스트에 추가된 일정 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('클릭 테스트 일정')).toBeInTheDocument();
    expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
  });

  it('일정 수정 시 캘린더에서 날짜 셀을 클릭하면 해당 날짜로 일정이 수정된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup();

    // 1. 기존 일정의 수정 아이콘 클릭 (여러 개 중 첫 번째)
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 2. 수정 모드 확인 (버튼 텍스트가 '일정 수정'으로 변경)
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');

    // 3. 현재 날짜 확인 (기존 일정의 날짜)
    const dateInputBefore = screen.getByLabelText('날짜') as HTMLInputElement;
    const originalDate = dateInputBefore.value;

    // 4. 다른 날짜 셀 클릭 (2025-10-20으로 변경)
    const newDateCell = screen.getByTestId('date-cell-2025-10-20');
    await user.click(newDateCell);

    // 5. 날짜가 변경되었는지 확인
    const dateInputAfter = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInputAfter.value).toBe('2025-10-20');
    expect(dateInputAfter.value).not.toBe(originalDate);

    // 6. 일정 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 7. 일정 수정 스낵바 확인
    expect(await screen.findByText('일정이 수정되었습니다')).toBeVisible();

    // 8. 수정된 날짜가 이벤트 리스트에 반영되었는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('2025-10-20')).toBeInTheDocument();
  });

  it('빈 날짜 셀을 클릭하면 해당 날짜가 폼에 입력되지만 일정은 생성되지 않는다', async () => {
    const { user } = setup();

    // 1. 이벤트 리스트 초기 상태 확인
    const eventListBefore = screen.getByTestId('event-list');
    const allEventsBefore = within(eventListBefore).queryAllByTestId(/^event-/);
    const initialEventsCount = allEventsBefore.length;

    // 2. 빈 날짜 셀 클릭 (이벤트가 없는 날짜)
    const emptyDateCell = screen.getByTestId('date-cell-2025-10-25');
    await user.click(emptyDateCell);

    // 3. 날짜만 입력되고 폼은 비어있는 상태
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-25');

    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    expect(titleInput.value).toBe('');

    // 4. 이벤트 리스트는 변경 없음 (일정을 추가하지 않았으므로)
    const eventListAfter = screen.getByTestId('event-list');
    const allEventsAfter = within(eventListAfter).queryAllByTestId(/^event-/);
    expect(allEventsAfter.length).toBe(initialEventsCount);
  });

  it('같은 날짜 셀을 여러 번 클릭해도 날짜가 올바르게 유지된다', async () => {
    const { user } = setup();

    // 1. 첫 번째 날짜 셀 클릭
    const firstDateCell = screen.getByTestId('date-cell-2025-10-10');
    await user.click(firstDateCell);

    const dateInput1 = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput1.value).toBe('2025-10-10');

    // 2. 같은 날짜 셀 다시 클릭
    await user.click(firstDateCell);

    const dateInput2 = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput2.value).toBe('2025-10-10');

    // 3. 다른 날짜 셀 클릭
    const secondDateCell = screen.getByTestId('date-cell-2025-10-15');
    await user.click(secondDateCell);

    const dateInput3 = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput3.value).toBe('2025-10-15');

    // 4. 첫 번째 날짜로 다시 클릭
    await user.click(firstDateCell);

    const dateInput4 = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput4.value).toBe('2025-10-10');
  });

  it('이미 일부 정보를 입력한 상태에서 날짜 셀을 클릭하면 날짜만 변경되고 다른 필드는 유지된다', async () => {
    const { user } = setup();

    // 1. 먼저 일부 정보 입력 (날짜 제외)
    await user.type(screen.getByLabelText('제목'), '부분 입력 테스트');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '날짜만 변경 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 B');

    // 2. 입력한 값들 저장
    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
    const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('설명') as HTMLInputElement;
    const locationInput = screen.getByLabelText('위치') as HTMLInputElement;

    const originalTitle = titleInput.value;
    const originalStartTime = startTimeInput.value;
    const originalEndTime = endTimeInput.value;
    const originalDescription = descriptionInput.value;
    const originalLocation = locationInput.value;

    // 3. 날짜 셀 클릭
    const dateCell = screen.getByTestId('date-cell-2025-10-18');
    await user.click(dateCell);

    // 4. 날짜만 변경되었는지 확인
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('2025-10-18');

    // 5. 다른 필드들은 그대로 유지되는지 확인
    expect(titleInput.value).toBe(originalTitle);
    expect(startTimeInput.value).toBe(originalStartTime);
    expect(endTimeInput.value).toBe(originalEndTime);
    expect(descriptionInput.value).toBe(originalDescription);
    expect(locationInput.value).toBe(originalLocation);

    // 6. 다른 날짜 셀을 클릭해도 여전히 다른 필드는 유지
    const anotherDateCell = screen.getByTestId('date-cell-2025-10-22');
    await user.click(anotherDateCell);

    const dateInputAfter = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInputAfter.value).toBe('2025-10-22');

    expect(titleInput.value).toBe(originalTitle);
    expect(startTimeInput.value).toBe(originalStartTime);
    expect(endTimeInput.value).toBe(originalEndTime);
    expect(descriptionInput.value).toBe(originalDescription);
    expect(locationInput.value).toBe(originalLocation);
  });
});

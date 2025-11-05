import { test, expect } from './fixtures';

/**
 * 검색 및 필터링 전반 검증 (CRUD with Search/Filter)
 *
 * 검색/필터링이 적용된 상태에서 일정 CRUD 작업이 올바르게 동작하는지 검증:
 * - CREATE: 검색어 입력 상태에서 새 일정 생성 → 검색 결과에 즉시 반영
 * - READ: 주간/월간 뷰 필터링 → 해당 기간 일정만 표시
 * - UPDATE: 검색된 일정 수정 → 검색어 매칭 여부에 따라 표시/숨김
 * - DELETE: 필터링된 뷰에서 일정 삭제 → 정상 삭제 확인
 */

test.describe('검색 및 필터링 전반', () => {
  test('검색어 입력 상태에서 일정 생성 (CREATE with Search)', async ({ page, createEvent }) => {
    // 기존 일정들 생성
    await createEvent({
      title: '팀 회의',
      date: '2025-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
    });

    await createEvent({
      title: '개인 약속',
      date: '2025-11-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '병원 방문',
      location: '병원',
    });

    await page.reload();

    // 검색어 입력 - "회의"로 필터링
    await page.getByLabel('일정 검색').fill('회의');

    // 검색 결과 확인 - '팀 회의'만 표시
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의', { exact: true })).toBeVisible();
    await expect(eventList.getByText('개인 약속', { exact: true })).not.toBeVisible();

    // 검색어 입력 상태에서 새 일정 생성 (검색어와 매칭됨)
    await page.getByLabel('제목').fill('임원 회의');
    await page.getByLabel('날짜').fill('2025-11-17');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('17:00');
    await page.getByLabel('설명').fill('월간 임원 회의');
    await page.getByLabel('위치').fill('회의실 B');

    await page.getByTestId('event-submit-button').click();

    // 생성 성공 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 새로 생성된 일정이 검색 결과에 즉시 표시됨
    await expect(eventList.getByText('임원 회의', { exact: true })).toBeVisible();
    await expect(eventList.getByText('팀 회의', { exact: true })).toBeVisible();

    // 여전히 검색어와 매칭되지 않는 일정은 숨겨짐
    await expect(eventList.getByText('개인 약속', { exact: true })).not.toBeVisible();
  });

  test('주간 뷰 필터링으로 일정 조회 (READ with Week Filter)', async ({ page, createEvent }) => {
    // 다른 주의 일정들 생성
    // 현재 주 (2025-11-02 ~ 2025-11-08) - 11월 1주
    await createEvent({
      title: '이번주 회의',
      date: '2025-11-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '현재 주 일정',
      location: '회의실',
    });

    // 다음 주 (2025-11-12) - 11월 2주
    await createEvent({
      title: '다음주 회의',
      date: '2025-11-12',
      startTime: '14:00',
      endTime: '15:00',
      description: '다음 주 일정',
      location: '회의실',
    });

    await page.reload();

    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByLabel('week-option').click();

    // 주간 뷰 확인
    await expect(page.getByTestId('week-view')).toBeVisible();

    // 현재 주(11월 1주)의 일정만 캘린더와 리스트에 표시됨
    const weekView = page.getByTestId('week-view');
    const eventList = page.getByTestId('event-list');

    await expect(weekView.getByText('이번주 회의', { exact: true })).toBeVisible();
    await expect(eventList.getByText('이번주 회의', { exact: true })).toBeVisible();

    // 다음 주 일정은 캘린더와 일정 리스트 모두에서 필터링됨
    await expect(weekView.getByText('다음주 회의')).not.toBeVisible();
    await expect(eventList.getByText('다음주 회의')).not.toBeVisible();
  });

  test('월간 뷰 필터링으로 일정 조회 (READ with Month Filter)', async ({ page, createEvent }) => {
    // 다른 월의 일정들 생성
    // 11월 일정 (현재 월)
    await createEvent({
      title: '11월 행사',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      description: '11월 이벤트',
      location: '본관',
    });

    // 12월 일정 (다음 월)
    await createEvent({
      title: '12월 행사',
      date: '2025-12-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '12월 이벤트',
      location: '본관',
    });

    await page.reload();

    // 월간 뷰 확인 (기본값)
    await expect(page.getByTestId('month-view')).toBeVisible();

    // 현재 월(11월)의 일정만 캘린더에 표시됨
    const monthView = page.getByTestId('month-view');
    await expect(monthView.getByText('11월 행사', { exact: true })).toBeVisible();

    // 현재 월 일정만 일정 리스트에 표시됨
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('11월 행사', { exact: true })).toBeVisible();

    // 12월 일정은 캘린더와 일정 리스트 모두에서 필터링됨
    await expect(monthView.getByText('12월 행사')).not.toBeVisible();
    await expect(eventList.getByText('12월 행사')).not.toBeVisible();
  });

  test('검색된 일정 수정 후 검색 결과 업데이트 (UPDATE with Search)', async ({
    page,
    createEvent,
  }) => {
    // 기존 일정들 생성
    await createEvent({
      title: '팀 미팅',
      date: '2025-11-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 미팅',
      location: '회의실 A',
    });

    await createEvent({
      title: '개인 약속',
      date: '2025-11-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '병원 방문',
      location: '병원',
    });

    await page.reload();

    // 검색어 입력 - "미팅"으로 필터링
    await page.getByLabel('일정 검색').fill('미팅');

    // 검색 결과 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 미팅', { exact: true })).toBeVisible();
    await expect(eventList.getByText('개인 약속', { exact: true })).not.toBeVisible();

    // 검색된 일정 수정
    await eventList.getByText('팀 미팅', { exact: true }).click();
    await page.getByRole('button', { name: /Edit event/i }).click();

    await page.getByRole('textbox', { name: '제목' }).clear();
    await page.getByRole('textbox', { name: '제목' }).fill('전략 회의');

    await page.getByRole('textbox', { name: '설명' }).clear();
    await page.getByRole('textbox', { name: '설명' }).fill('주간 전략 회의');

    await page.getByRole('textbox', { name: '위치' }).clear();
    await page.getByRole('textbox', { name: '위치' }).fill('본관 2층');

    await page.getByTestId('event-submit-button').click();

    // 수정된 일정이 검색어와 매칭되지 않아 검색 결과에서 사라짐
    await expect(eventList.getByText('팀 미팅', { exact: true })).not.toBeVisible();
    await expect(eventList.getByText('전략 회의', { exact: true })).not.toBeVisible();

    // 검색 결과가 없음 메시지 표시
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();

    // 검색어 변경하면 수정된 일정이 표시됨
    await page.getByLabel('일정 검색').clear();
    await page.getByLabel('일정 검색').fill('회의');

    await expect(eventList.getByText('전략 회의', { exact: true })).toBeVisible();
  });

  test('필터링된 뷰에서 일정 삭제 (DELETE with Filter)', async ({ page, createEvent }) => {
    // 같은 날짜의 일정들 생성
    await createEvent({
      title: '아침 회의',
      date: '2025-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '오전 일정',
      location: '본관 3층',
    });

    await createEvent({
      title: '점심 약속',
      date: '2025-11-10',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 일정',
      location: '식당',
    });

    await createEvent({
      title: '오후 미팅',
      date: '2025-11-10',
      startTime: '15:00',
      endTime: '16:00',
      description: '오후 일정',
      location: '본관 5층',
    });

    await page.reload();

    // 검색어 입력 - "회의"로 필터링
    await page.getByLabel('일정 검색').fill('회의');

    // 검색 결과 확인 - "아침 회의"만 표시
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('아침 회의', { exact: true })).toBeVisible();
    await expect(eventList.getByText('점심 약속', { exact: true })).not.toBeVisible();
    await expect(eventList.getByText('오후 미팅', { exact: true })).not.toBeVisible();

    // 검색된 일정 삭제
    await eventList.getByText('아침 회의', { exact: true }).click();
    await page.getByRole('button', { name: /Delete event/i }).click();

    // 삭제 후 검색 결과 없음
    await expect(eventList.getByText('아침 회의', { exact: true })).not.toBeVisible();
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();

    // 검색어 제거하면 나머지 일정들 표시됨
    await page.getByLabel('일정 검색').clear();

    await expect(eventList.getByText('점심 약속', { exact: true })).toBeVisible();
    await expect(eventList.getByText('오후 미팅', { exact: true })).toBeVisible();
    await expect(eventList.getByText('아침 회의', { exact: true })).not.toBeVisible(); // 삭제됨
  });

  test('검색 결과 없음 처리 (NO_RESULT)', async ({ page, createEvent }) => {
    // 일정 생성
    await createEvent({
      title: '테스트 일정',
      date: '2025-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트용',
      location: '테스트 장소',
    });

    await page.reload();

    // 매칭되지 않는 검색어 입력
    await page.getByLabel('일정 검색').fill('존재하지않는검색어');

    // "검색 결과가 없습니다." 메시지 확인
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();

    // 일정 목록에 아무것도 표시되지 않음
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('테스트 일정', { exact: true })).not.toBeVisible();
  });
});

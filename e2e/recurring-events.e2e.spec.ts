import { test, expect } from './fixtures';

/**
 * 반복 일정 관리 워크플로우 테스트
 *
 * 반복 일정의 핵심 E2E 기능 테스트:
 * - CREATE: 반복 일정 생성
 * - UPDATE (단일): 반복 시리즈 중 하나만 수정
 * - UPDATE (시리즈): 반복 시리즈 전체 수정
 * - DELETE (단일): 반복 시리즈 중 하나만 삭제
 * - DELETE (시리즈): 반복 시리즈 전체 삭제
 *
 * 참고: 반복 일정 설정 검증 테스트는 통합 테스트로 이동됨
 * (__tests__/integration/recurringEventWorkflow.spec.tsx)
 */

test.describe('반복 일정 관리 CRUD', () => {
  test('반복 일정 생성 (CREATE)', async ({ page }) => {
    // 반복 일정 활성화
    await page.getByRole('checkbox', { name: '반복 일정' }).click();

    // 기본 일정 정보 입력
    await page.getByLabel('제목').fill('주간 팀 회의');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('매주 월요일 회의');
    await page.getByLabel('위치').fill('회의실 A');

    // 반복 설정 (MUI Select)
    await page.getByLabel('반복 유형').click();
    await page.getByText('매주').click();

    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2025-12-31');

    // 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 생성 성공 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 반복 일정들이 목록에 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('주간 팀 회의').first()).toBeVisible();
  });

  test('반복 일정 단일 수정 (UPDATE - 단일)', async ({ page, createRecurringEvent }) => {
    // 주간 반복 일정 생성 (API)
    await createRecurringEvent({
      title: '주간 스탠드업',
      date: '2025-11-10',
      startTime: '10:00',
      endTime: '10:30',
      description: '매주 월요일 스탠드업',
      location: '회의실 B',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: '2025-12-31',
    });

    await page.reload();

    // 첫 번째 반복 일정 클릭
    await page.getByTestId('event-list').getByText('주간 스탠드업').first().click();
    await page.getByRole('button', { name: /Edit event/i }).click();

    // RecurringEventDialog에서 "예" (해당 일정만) 선택
    await page.getByRole('button', { name: '예' }).click();

    // 단일 일정만 수정
    await page.getByRole('textbox', { name: '제목' }).clear();
    await page.getByRole('textbox', { name: '제목' }).fill('특별 스탠드업');

    await page.getByTestId('event-submit-button').click();

    // 수정 성공 확인 - 단일 일정만 수정되어 반복 아이콘이 사라짐
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('특별 스탠드업')).toBeVisible();

    // "특별 스탠드업" 일정에 반복 아이콘(Repeat)이 없는지 확인
    // 제목을 포함하는 이벤트 박스를 찾고, 그 안에서 RepeatIcon이 없는지 확인
    const eventBox = eventList.getByText('특별 스탠드업').locator('..');
    await expect(eventBox.getByTestId('RepeatIcon')).not.toBeVisible();
  });

  test('반복 일정 시리즈 전체 수정 (UPDATE - 시리즈)', async ({ page, createRecurringEvent }) => {
    // 주간 반복 일정 생성 (API)
    await createRecurringEvent({
      title: '주간 리뷰',
      date: '2025-11-10',
      startTime: '16:00',
      endTime: '17:00',
      description: '매주 금요일 리뷰',
      location: '회의실 C',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: '2025-12-31',
    });

    await page.reload();

    // 반복 일정 중 하나 클릭
    await page.getByTestId('event-list').getByText('주간 리뷰').first().click();
    await page.getByRole('button', { name: /Edit event/i }).click();

    // RecurringEventDialog에서 "아니오" (시리즈 전체) 선택
    await page.getByRole('button', { name: '아니오' }).click();

    // 시리즈 전체 수정
    await page.getByRole('textbox', { name: '제목' }).clear();
    await page.getByRole('textbox', { name: '제목' }).fill('주간 회고');

    await page.getByTestId('event-submit-button').click();

    // 수정 성공 확인 - 모든 반복 일정이 변경됨
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('주간 회고')).toBeVisible();
    await expect(eventList.getByText('주간 리뷰')).not.toBeVisible();
  });

  test('반복 일정 단일 삭제 (DELETE - 단일)', async ({ page, createRecurringEvent }) => {
    // 주간 반복 일정 생성 (API)
    await createRecurringEvent({
      title: '단일 삭제 테스트',
      date: '2025-11-10',
      startTime: '20:00',
      endTime: '21:00',
      description: '단일 삭제용',
      location: '회의실 E',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: '2025-12-31',
    });

    await page.reload();

    // 반복 일정 중 하나 클릭
    await page.getByTestId('event-list').getByText('단일 삭제 테스트').first().click();
    await page.getByRole('button', { name: /Delete event/i }).click();

    // RecurringEventDialog에서 "예" (해당 일정만) 선택
    await page.getByRole('button', { name: '예' }).click();

    // 단일 삭제 성공 확인 - 하나만 삭제되고 나머지는 유지
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('단일 삭제 테스트')).toBeVisible(); // 나머지는 여전히 존재
  });

  test('반복 일정 시리즈 전체 삭제 (DELETE - 시리즈)', async ({ page, createRecurringEvent }) => {
    // 주간 반복 일정 생성 (API)
    await createRecurringEvent({
      title: '삭제할 반복 일정',
      date: '2025-11-10',
      startTime: '18:00',
      endTime: '19:00',
      description: '삭제 테스트용',
      location: '회의실 D',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: '2025-12-31',
    });

    await page.reload();

    // 반복 일정 중 하나 클릭
    await page.getByTestId('event-list').getByText('삭제할 반복 일정').first().click();
    await page.getByRole('button', { name: /Delete event/i }).click();

    // RecurringEventDialog에서 "아니오" (시리즈 전체) 선택
    await page.getByRole('button', { name: '아니오' }).click();

    // 삭제 성공 확인 - 모든 반복 일정이 삭제됨
    await expect(page.getByTestId('event-list').getByText('삭제할 반복 일정')).not.toBeVisible();
  });
});

test.describe('반복 일정 설정 검증 워크플로우', () => {
  test('격주 반복 일정 생성 → 목록에서 반복 확인', async ({ page }) => {
    // 1. 격주 반복 일정 생성
    await page.getByRole('checkbox', { name: '반복 일정' }).click();

    await page.getByLabel('제목').fill('격주 팀 회의');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('설명').fill('2주마다 진행되는 팀 회의');
    await page.getByLabel('위치').fill('회의실 A');

    // 반복 설정 (2주마다)
    await page.getByLabel('반복 유형').click();
    await page.getByText('매주').click();

    await page.getByLabel('반복 간격').fill('2'); // 핵심: 2주마다
    await page.getByLabel('반복 종료일').fill('2025-12-31');

    await page.getByTestId('event-submit-button').click();

    // 2. 성공 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 3. 목록에서 반복 일정 생성 확인
    const eventList = page.getByTestId('event-list');
    const events = eventList.getByText('격주 팀 회의');
    await expect(events.first()).toBeVisible();

    // 4. 반복 아이콘 확인 (반복 일정임을 시각적으로 확인)
    await expect(eventList.getByTestId('RepeatIcon').first()).toBeVisible();

    // 5. 첫 번째 일정 클릭해서 상세 정보 확인
    await events.first().click();

    // 6. 편집 버튼으로 반복 설정 확인
    await page
      .getByRole('button', { name: /Edit event/i })
      .first()
      .click();

    // 7. 반복 일정 다이얼로그가 나타나는지 확인 (반복 일정임을 재확인)
    await expect(page.getByText('반복 일정 수정')).toBeVisible();
    await expect(page.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();
  });

  test('무한 반복 일정 생성 → 종료일 없음 확인', async ({ page }) => {
    // 1. 무한 반복 일정 생성
    await page.getByRole('checkbox', { name: '반복 일정' }).click();

    await page.getByLabel('제목').fill('매일 아침 회의');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('09:30');
    await page.getByLabel('설명').fill('매일 진행되는 아침 회의');
    await page.getByLabel('위치').fill('회의실 B');

    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily-option' }).click();

    await page.getByLabel('반복 간격').fill('1');
    // 반복 종료일은 입력하지 않음 (무한 반복)

    await page.getByTestId('event-submit-button').click();

    // 2. 성공 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 3. 목록에서 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매일 아침 회의').first()).toBeVisible();

    // 4. 반복 아이콘 확인 (무한 반복 일정 성공적으로 생성됨)
    await expect(eventList.getByTestId('RepeatIcon').first()).toBeVisible();
  });
});

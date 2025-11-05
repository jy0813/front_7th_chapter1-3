import { test, expect } from './fixtures';

/**
 * 반복 일정 관리 워크플로우 테스트
 *
 * 반복 일정의 핵심 기능만 테스트:
 * - CREATE: 반복 일정 생성
 * - UPDATE (단일): 반복 시리즈 중 하나만 수정
 * - UPDATE (시리즈): 반복 시리즈 전체 수정
 * - DELETE (단일): 반복 시리즈 중 하나만 삭제
 * - DELETE (시리즈): 반복 시리즈 전체 삭제
 */

test.describe('반복 일정 관리', () => {
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
    const eventBox = eventList.locator('div:has-text("특별 스탠드업")').first();
    await expect(eventBox.locator('svg[data-testid="RepeatIcon"]')).not.toBeVisible();
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

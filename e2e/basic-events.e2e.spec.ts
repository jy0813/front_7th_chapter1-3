import { test, expect } from './fixtures';

/**
 * 기본 일정 관리 CRUD 테스트
 *
 * CRUD 작업 E2E 테스트:
 * - CREATE: 일정 생성
 * - READ: 일정 조회
 * - UPDATE: 일정 수정
 * - DELETE: 일정 삭제
 *
 */

test.describe('기본 일정 관리 CRUD', () => {
  test('일정 생성 (CREATE)', async ({ page }) => {
    // 일정 정보 입력
    await page.getByLabel('제목').fill('팀 회의');
    await page.getByLabel('날짜').fill('2025-11-15');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('Q4 계획 논의');
    await page.getByLabel('위치').fill('회의실 A');

    // 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 생성 성공 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
    await expect(page.getByTestId('event-list').getByText('팀 회의')).toBeVisible();
  });

  test('일정 조회 (READ)', async ({ page, createEvent }) => {
    // 테스트 일정 미리 생성
    await createEvent({
      title: '조회 테스트 일정',
      date: '2025-11-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 위치',
    });

    await page.reload();

    // 일정 목록에서 조회
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('조회 테스트 일정')).toBeVisible();
    await expect(eventList).toContainText('2025-11-20');
    await expect(eventList).toContainText('10:00 - 11:00');
    await expect(eventList).toContainText('테스트 설명');
    await expect(eventList).toContainText('테스트 위치');
  });

  test('일정 수정 (UPDATE)', async ({ page, createEvent }) => {
    // 테스트 일정 미리 생성
    await createEvent({
      title: '수정 전 제목',
      date: '2025-11-25',
      startTime: '09:00',
      endTime: '10:00',
      description: '수정 전 설명',
      location: '수정 전 위치',
    });

    await page.reload();

    // 일정 클릭 후 수정 모드 진입
    await page.getByTestId('event-list').getByText('수정 전 제목').click();
    await page.getByRole('button', { name: /Edit event/i }).click();

    // 일정 정보 수정 - 역할 기반 셀렉터 사용 (유효성 검증 메시지 간섭 방지)
    await page.getByRole('textbox', { name: '제목' }).clear();
    await page.getByRole('textbox', { name: '제목' }).fill('수정 후 제목');

    await page.getByLabel('날짜').clear();
    await page.getByLabel('날짜').fill('2025-11-28');

    await page.getByRole('textbox', { name: '시작 시간' }).clear();
    await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');

    await page.getByRole('textbox', { name: '종료 시간' }).clear();
    await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');

    await page.getByRole('textbox', { name: '설명' }).clear();
    await page.getByRole('textbox', { name: '설명' }).fill('수정 후 설명');

    await page.getByRole('textbox', { name: '위치' }).clear();
    await page.getByRole('textbox', { name: '위치' }).fill('수정 후 위치');

    // 저장
    await page.getByTestId('event-submit-button').click();

    // 수정 성공 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('수정 후 제목')).toBeVisible();
    await expect(eventList).toContainText('2025-11-28');
    await expect(eventList).toContainText('14:00 - 15:00');
    await expect(eventList).toContainText('수정 후 설명');
    await expect(eventList).toContainText('수정 후 위치');
  });

  test('일정 삭제 (DELETE)', async ({ page, createEvent }) => {
    // 테스트 일정 미리 생성
    await createEvent({
      title: '삭제 테스트 일정',
      date: '2025-11-30',
      startTime: '16:00',
      endTime: '17:00',
      description: '삭제될 일정',
      location: '삭제될 위치',
    });

    await page.reload();

    // 일정 클릭 후 삭제
    await page.getByTestId('event-list').getByText('삭제 테스트 일정').click();
    await page.getByRole('button', { name: /Delete event/i }).click();

    // 삭제 성공 확인
    await expect(page.getByTestId('event-list').getByText('삭제 테스트 일정')).not.toBeVisible();
  });
});

test.describe('폼 검증 워크플로우', () => {
  test('필수 필드 누락 → 에러 확인 → 수정 → 일정 생성 성공', async ({ page }) => {
    // 1. 사용자가 실수로 제목 없이 제출
    await page.getByLabel('날짜').fill('2025-11-15');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('설명 내용');
    await page.getByLabel('위치').fill('회의실 A');
    await page.getByTestId('event-submit-button').click();

    // 2. 에러 메시지 확인 (사용자가 에러를 인지)
    await expect(page.getByText('필수 정보를 모두 입력해주세요.')).toBeVisible();
    await expect(page.getByText('일정이 추가되었습니다')).not.toBeVisible();

    // 3. 사용자가 에러를 보고 제목 입력 (수정)
    await page.getByLabel('제목').fill('팀 회의');
    await page.getByTestId('event-submit-button').click();

    // 4. 성공 확인 및 목록에서 조회 (완전한 워크플로우)
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList).toContainText('2025-11-15');
    await expect(eventList).toContainText('14:00 - 15:00');
    await expect(eventList).toContainText('설명 내용');
    await expect(eventList).toContainText('회의실 A');
  });

  test('잘못된 시간 → 에러 확인 → 수정 → 일정 생성 성공', async ({ page }) => {
    // 1. 사용자가 실수로 종료 시간을 시작 시간보다 빠르게 입력
    await page.getByLabel('제목').fill('중요한 회의');
    await page.getByLabel('날짜').fill('2025-11-15');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('14:00'); // 실수
    await page.getByLabel('설명').fill('긴급 회의');
    await page.getByLabel('위치').fill('회의실 B');
    await page.getByTestId('event-submit-button').click();

    // 2. 시간 에러 확인
    await expect(page.getByText('시간 설정을 확인해주세요.')).toBeVisible();
    await expect(page.getByText('일정이 추가되었습니다')).not.toBeVisible();

    // 3. 사용자가 에러를 보고 시간 수정
    await page.getByRole('textbox', { name: '종료 시간' }).clear();
    await page.getByRole('textbox', { name: '종료 시간' }).fill('16:00'); // 수정
    await page.getByTestId('event-submit-button').click();

    // 4. 성공 및 목록 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('중요한 회의')).toBeVisible();
    await expect(eventList).toContainText('15:00 - 16:00');
    await expect(eventList).toContainText('긴급 회의');
  });
});

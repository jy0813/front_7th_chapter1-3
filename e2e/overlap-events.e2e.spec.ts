import { test, expect } from './fixtures';

/**
 * 일정 겹침 처리 워크플로우 테스트
 *
 * 일정 겹침의 핵심 기능만 테스트:
 * - DETECT: 일정 추가 시 겹침 감지
 * - CANCEL: 겹침 경고에서 취소
 * - PROCEED: 겹침 경고에서 계속 진행
 */

test.describe('일정 겹침 처리', () => {
  test('일정 추가 시 겹침 감지 (DETECT)', async ({ page, createEvent }) => {
    // 기존 일정 생성 (API)
    await createEvent({
      title: '기존 회의',
      date: '2025-11-10',
      startTime: '10:00',
      endTime: '12:00',
      description: '기존 일정',
      location: '회의실 A',
    });

    await page.reload();

    // 겹치는 새 일정 추가 시도
    await page.getByLabel('제목').fill('새 회의');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('11:00'); // 겹침!
    await page.getByLabel('종료 시간').fill('13:00');
    await page.getByLabel('설명').fill('겹치는 일정');
    await page.getByLabel('위치').fill('회의실 B');

    await page.getByTestId('event-submit-button').click();

    // 일정 겹침 경고 다이얼로그 표시 확인
    const dialog = page.getByRole('dialog', { name: '일정 겹침 경고' });
    await expect(dialog.getByRole('heading', { name: '일정 겹침 경고' })).toBeVisible();
    await expect(dialog.getByText('다음 일정과 겹칩니다:')).toBeVisible();
    await expect(dialog.getByText('기존 회의 (2025-11-10 10:00-12:00)')).toBeVisible();
    await expect(dialog.getByText('계속 진행하시겠습니까?')).toBeVisible();
  });

  test('겹침 경고에서 취소 선택 (CANCEL)', async ({ page, createEvent }) => {
    // 기존 일정 생성 (API)
    await createEvent({
      title: '점심 약속',
      date: '2025-11-10',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 식사',
      location: '식당',
    });

    await page.reload();

    // 겹치는 새 일정 추가 시도
    await page.getByLabel('제목').fill('긴급 미팅');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('12:30'); // 겹침!
    await page.getByLabel('종료 시간').fill('14:00');

    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 다이얼로그에서 "취소" 선택
    await expect(page.getByRole('heading', { name: '일정 겹침 경고' })).toBeVisible();
    await page.getByRole('button', { name: '취소' }).click();

    // 다이얼로그 닫힘 확인
    await expect(page.getByRole('heading', { name: '일정 겹침 경고' })).not.toBeVisible();

    // 새 일정이 추가되지 않았는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('긴급 미팅')).not.toBeVisible();
    await expect(eventList.getByText('점심 약속')).toBeVisible(); // 기존 일정만 존재
  });

  test('겹침 경고에서 계속 진행 선택 (PROCEED)', async ({ page, createEvent }) => {
    // 기존 일정 생성 (API)
    await createEvent({
      title: '오후 세미나',
      date: '2025-11-10',
      startTime: '14:00',
      endTime: '16:00',
      description: '기술 세미나',
      location: '대강당',
    });

    await page.reload();

    // 겹치는 새 일정 추가 시도
    await page.getByLabel('제목').fill('개인 상담');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('15:00'); // 겹침!
    await page.getByLabel('종료 시간').fill('17:00');
    await page.getByLabel('설명').fill('개인 일정');
    await page.getByLabel('위치').fill('상담실');

    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 다이얼로그에서 빨간색 "계속 진행" 버튼 클릭
    await expect(page.getByRole('heading', { name: '일정 겹침 경고' })).toBeVisible();

    // 빨간색 버튼 (color="error")을 찾아서 클릭
    // MUI Button with color="error"는 두 번째 버튼 (취소 다음)
    await page.locator('button:has-text("계속 진행")').click();

    // 일정 추가 성공 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 일정 모두 존재하는지 확인 (겹치지만 둘 다 추가됨)
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('오후 세미나')).toBeVisible();
    await expect(eventList.getByText('개인 상담')).toBeVisible();
  });
});

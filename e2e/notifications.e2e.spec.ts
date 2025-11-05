import { test, expect } from './fixtures';

/**
 * 알림 시스템 워크플로우 테스트
 *
 * 알림 설정의 핵심 기능만 테스트:
 * - SETUP: 알림 시간 설정 및 표시 확인
 * - OPTIONS: 다양한 알림 시간 옵션 테스트
 *
 * 참고: 실제 시간 경과 후 알림 배너 표시는 Integration 테스트에서 검증
 */

test.describe('알림 시스템', () => {
  test('알림 시간 설정 및 표시 확인 (SETUP)', async ({ page }) => {
    // 일정 생성 시 알림 시간 설정
    await page.getByLabel('제목').fill('팀 미팅');
    await page.getByLabel('날짜').fill('2025-11-15');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('주간 팀 미팅');
    await page.getByLabel('위치').fill('회의실 A');

    // 알림 시간 선택 (10분 전) - 기본값이므로 선택 불필요
    // Select는 이미 '10분 전'이 기본값으로 설정되어 있음

    await page.getByTestId('event-submit-button').click();

    // 일정 생성 성공 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정 리스트에서 알림 시간 표시 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 미팅', { exact: true })).toBeVisible();
    await expect(eventList.getByText('알림: 10분 전')).toBeVisible();
  });

  test('다양한 알림 시간 옵션 테스트 (OPTIONS)', async ({ page }) => {
    // 1분 전 알림
    await page.getByLabel('제목').fill('긴급 회의');
    await page.getByLabel('날짜').fill('2025-11-16');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('설명').fill('긴급 이슈 논의');
    await page.getByLabel('위치').fill('회의실 B');

    // 알림 설정 변경 (1분 전)
    await page.getByTestId('notification-select').click();
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.getByTestId('event-submit-button').click();
    await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible();

    // 1시간 전 알림
    await page.getByLabel('제목').fill('중요 프레젠테이션');
    await page.getByLabel('날짜').fill('2025-11-17');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('설명').fill('분기 실적 발표');
    await page.getByLabel('위치').fill('대회의실');

    await page.getByTestId('notification-select').click();
    await page.getByRole('option', { name: '1시간 전' }).click();

    await page.getByTestId('event-submit-button').click();
    await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible();

    // 1일 전 알림
    await page.getByLabel('제목').fill('연간 행사');
    await page.getByLabel('날짜').fill('2025-11-20');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('18:00');
    await page.getByLabel('설명').fill('전사 워크샵');
    await page.getByLabel('위치').fill('본사 대강당');

    await page.getByTestId('notification-select').click();
    await page.getByRole('option', { name: '1일 전' }).click();

    await page.getByTestId('event-submit-button').click();
    await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible();

    // 모든 일정의 알림 시간이 올바르게 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('알림: 1분 전')).toBeVisible();
    await expect(eventList.getByText('알림: 1시간 전')).toBeVisible();
    await expect(eventList.getByText('알림: 1일 전')).toBeVisible();
  });
});

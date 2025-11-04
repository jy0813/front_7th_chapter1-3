import { test, expect } from './fixtures';

/**
 * 기본 E2E 테스트 예제
 * e2e.json을 사용하여 깨끗한 상태에서 시작
 * fixtures.ts에서 자동으로 DB 초기화 + 페이지 이동 처리
 */

test.describe('캘린더 애플리케이션 기본 기능', () => {
  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/일정관리 앱/);

    // 주요 요소들이 표시되는지 확인 (Role 기반 셀렉터 사용)
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '일정 보기' })).toBeVisible();
  });

  test('일정을 추가할 수 있다', async ({ page }) => {
    // 제목 입력
    await page.getByLabel('제목').fill('테스트 일정');

    // 날짜 선택
    await page.getByLabel('날짜').fill('2025-11-11');

    // 시작 시간 선택
    await page.getByLabel('시작 시간').fill('10:00');

    // 종료 시간 선택
    await page.getByLabel('종료 시간').fill('11:00');

    // 설명 입력
    await page.getByLabel('설명').fill('테스트용 일정입니다');

    // 위치 입력
    await page.getByLabel('위치').fill('회의실 A');

    // 일정 추가 버튼 클릭
    await page.getByTestId('event-submit-button').click();

    // 성공 스낵바 메시지 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정 목록에 추가된 일정 확인 (event-list 내부에서 찾기)
    await expect(page.getByTestId('event-list').getByText('테스트 일정')).toBeVisible();
  });

  test('반복 일정을 생성할 수 있다', async ({ page }) => {
    // 제목 입력
    await page.getByLabel('제목').fill('반복 회의');

    // 날짜 선택
    await page.getByLabel('날짜').fill('2025-10-20');

    // 시작/종료 시간
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');

    // 반복 일정 체크
    await page.getByText('반복 일정').click();

    // 반복 유형 선택 (매주)
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('weekly-option').click();

    // 반복 간격
    await page.getByLabel('반복 간격').fill('1');

    // 반복 종료일
    await page.getByLabel('반복 종료일').fill('2025-11-20');

    // 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 성공 메시지 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 반복 정보 텍스트 확인 (3개 반복 일정 중 첫 번째 확인)
    await expect(
      page
        .getByTestId('event-list')
        .getByText(/반복: 1주마다/)
        .first()
    ).toBeVisible();
  });

  test('월간 뷰와 주간 뷰를 전환할 수 있다', async ({ page }) => {
    // 월간 뷰 확인
    await expect(page.getByTestId('month-view')).toBeVisible();

    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByLabel('week-option').click();

    // 주간 뷰 확인
    await expect(page.getByTestId('week-view')).toBeVisible();
  });
});

test.describe('드래그 앤 드롭 기능', () => {
  test.beforeEach(async ({ page }) => {
    // fixtures에서 이미 DB 초기화 + page.goto('/') 완료

    // 테스트용 일정 추가
    await page.getByLabel('제목').fill('이동할 일정');
    await page.getByLabel('날짜').fill('2025-10-15');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    // 일정 추가 완료 대기
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
  });
});

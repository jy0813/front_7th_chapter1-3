import { test as base, expect as baseExpect, Page, APIRequestContext } from '@playwright/test';

/**
 * E2E 테스트용 커스텀 fixture
 *
 * 모든 테스트에서 자동으로:
 * 1. DB 초기화
 * 2. 홈페이지 이동
 *
 * 사용법:
 * import { test, expect } from './fixtures';
 * test('테스트', async ({ page }) => { ... });
 */

type TestFixtures = {
  page: Page;
};

/**
 * DB를 초기화하고 페이지를 로드하는 헬퍼 함수
 */
async function setupTest(page: Page, request: APIRequestContext): Promise<void> {
  await request.post('http://localhost:3000/api/reset');
  await page.goto('/');
}

export const test = base.extend<TestFixtures>({
  page: async ({ page, request }, runTest) => {
    // 각 테스트 전에 자동 실행
    await setupTest(page, request);

    // 테스트 실행
    await runTest(page);
  },
});

export const expect = baseExpect;

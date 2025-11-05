import { test as base, expect as baseExpect, Page, APIRequestContext } from '@playwright/test';

/**
 * E2E 테스트용 커스텀 fixture
 *
 * 모든 테스트에서 자동으로:
 * 1. DB 초기화
 * 2. 홈페이지 이동
 * 3. createEvent 헬퍼 함수 제공 (선택적 사용)
 *
 * 사용법:
 * import { test, expect } from './fixtures';
 *
 * // page만 사용
 * test('테스트', async ({ page }) => { ... });
 *
 * // createEvent도 사용
 * test('테스트', async ({ page, createEvent }) => {
 *   await createEvent({ title: '...', date: '...', startTime: '...', endTime: '...' });
 * });
 */

type EventData = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  category?: string;
};

type TestFixtures = {
  page: Page;
  createEvent: (_eventData: EventData) => Promise<void>;
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

  createEvent: async ({ page }, use) => {
    const createEvent = async (eventData: EventData) => {
      const defaultData = {
        description: eventData.description || '',
        location: eventData.location || '',
        category: eventData.category || '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      await page.request.post('http://localhost:3000/api/events', {
        data: {
          title: eventData.title,
          date: eventData.date,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          ...defaultData,
        },
      });
    };

    // Playwright API에서 정의된 필수 파라미터명에 충돌 방지
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(createEvent);
  },
});

export const expect = baseExpect;

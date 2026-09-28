import { expect, test } from '@playwright/test';
import { withRouteDeadline } from './routeDriver.js';

test('route deadline uses public TestInfo and restores its timeout', async ({
  browserName,
}, testInfo) => {
  const originalTimeout = testInfo.timeout;
  expect(browserName).toBe('chromium');

  const activeTimeout = await withRouteDeadline(
    testInfo,
    Promise.resolve().then(() => testInfo.timeout),
    'Route deadline probe',
    25,
  );

  expect(activeTimeout).toBe(originalTimeout + 5025);
  expect(testInfo.timeout).toBe(originalTimeout);
});

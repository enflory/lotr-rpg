import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  deadlineWithinTest,
  driveRoute,
  ROUTE_DEADLINE_MS,
  withDeadline,
} from '../e2e/routeDriver.js';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('route driver liveness', () => {
  it('caps the route deadline for long tests', () => {
    expect(deadlineWithinTest({ startTime: new Date(1000), timeout: 600000 }, 11000)).toBe(
      ROUTE_DEADLINE_MS,
    );
  });

  it('leaves five seconds for Playwright to report a route failure', () => {
    expect(deadlineWithinTest({ startTime: new Date(1000), timeout: 60000 }, 11000)).toBe(45000);
  });

  it('rejects from the test process when the browser evaluator never settles', async () => {
    vi.useFakeTimers();
    const stalled = withDeadline(new Promise(() => {}), undefined, 'Route movement in downs');
    const rejection = expect(stalled).rejects.toThrow(
      `Route movement in downs exceeded ${ROUTE_DEADLINE_MS}ms`,
    );

    await vi.advanceTimersByTimeAsync(ROUTE_DEADLINE_MS);

    await rejection;
  });

  it('rejects when the browser stops delivering animation frames', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', { dispatchEvent() {} });
    vi.stubGlobal('requestAnimationFrame', () => 1);
    const stalled = driveRoute({
      stops: [[1, 1]],
      zone: 'downs',
      frameTimeoutMs: 25,
    });
    const rejection = expect(stalled).rejects.toThrow(
      'Route animation frame stalled in downs for 25ms',
    );

    await vi.advanceTimersByTimeAsync(25);

    await rejection;
  });

  it('rejects instead of stranding the promise when a frame callback throws', async () => {
    vi.stubGlobal('window', {
      dispatchEvent() {},
      __game: {
        scene: {
          getScene() {
            throw new Error('scene unavailable');
          },
        },
      },
    });
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      queueMicrotask(callback);
      return 1;
    });

    await expect(
      driveRoute({ stops: [[1, 1]], zone: 'downs', frameTimeoutMs: 25 }),
    ).rejects.toThrow('scene unavailable');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  driveRoute,
  ROUTE_DEADLINE_MS,
  withDeadline,
  withRouteDeadline,
} from '../e2e/routeDriver.js';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('route driver liveness', () => {
  it.each([1.2, 3.6, 6])(
    'finishes a corner route at %s pixels per frame without oscillating',
    async (step) => {
      vi.useFakeTimers();
      const frames = [],
        keys = new Set();
      const player = { x: 2, y: 0 };
      let vx = 0,
        vy = 0,
        result;
      vi.stubGlobal(
        'KeyboardEvent',
        class {
          constructor(type, options) {
            this.type = type;
            Object.assign(this, options);
          }
        },
      );
      vi.stubGlobal('window', {
        dispatchEvent(event) {
          if (event.type === 'keydown') keys.add(event.key);
          else keys.delete(event.key);
        },
        __game: { scene: { getScene: () => ({ zoneKey: 'downs', player }) } },
      });
      vi.stubGlobal('requestAnimationFrame', (callback) => frames.push(callback));
      const route = driveRoute({
        stops: [
          [1, 0],
          [1, 2],
        ],
        zone: 'downs',
        frameTimeoutMs: 25,
      }).then(
        (value) => {
          result = value;
        },
        () => {},
      );
      for (let frame = 0; frame < 60 && frames.length; frame++) {
        // Arcade advances the body before WorldScene reads keys. A key release
        // after the rendered frame therefore has one more physics step to coast.
        player.x += vx;
        player.y += vy;
        vx = keys.has('ArrowRight') ? step : keys.has('ArrowLeft') ? -step : 0;
        vy = keys.has('ArrowDown') ? step : keys.has('ArrowUp') ? -step : 0;
        frames.shift()();
        await Promise.resolve();
      }
      const completed = result;
      await vi.runAllTimersAsync();
      await route;
      expect(completed).toBe('done');
      expect(Math.abs(player.x - 24)).toBeLessThan(8);
      expect(Math.abs(player.y - 32)).toBeLessThan(8);
      expect(keys.size).toBe(0);
    },
  );

  it('temporarily extends and then restores the Playwright test budget', async () => {
    const setTimeout = vi.fn();
    const testInfo = { timeout: 60000, setTimeout };

    await expect(
      withRouteDeadline(testInfo, Promise.resolve('done'), 'Route movement', 25),
    ).resolves.toBe('done');

    expect(setTimeout.mock.calls).toEqual([[65025], [60000]]);
  });

  it('keeps the extended budget when the route deadline fails', async () => {
    vi.useFakeTimers();
    const setTimeout = vi.fn();
    const testInfo = { timeout: 60000, setTimeout };
    const stalled = withRouteDeadline(testInfo, new Promise(() => {}), 'Route movement', 25);
    const rejection = expect(stalled).rejects.toThrow('Route movement exceeded 25ms');

    await vi.advanceTimersByTimeAsync(25);
    await rejection;

    expect(setTimeout.mock.calls).toEqual([[65025]]);
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

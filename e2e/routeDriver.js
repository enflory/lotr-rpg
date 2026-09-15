// Browser-side route driving is intentionally kept in a standalone function:
// Playwright serializes it into the page, while unit tests can exercise its
// failure paths without booting the game.
export const ROUTE_DEADLINE_MS = 120000;
const TEST_TIMEOUT_RESERVE_MS = 5000;

// Keep the route-specific failure ahead of Playwright's generic test timeout.
// Long journey tests still get the full route ceiling, while short tests use
// only the budget they actually have left.
export function deadlineWithinTest(testInfo, now = Date.now()) {
  if (!testInfo.timeout) return ROUTE_DEADLINE_MS;
  const startedAt = testInfo.startTime.getTime();
  const elapsed = Math.max(0, now - startedAt);
  const remaining = testInfo.timeout - elapsed - TEST_TIMEOUT_RESERVE_MS;
  return Math.max(1, Math.min(ROUTE_DEADLINE_MS, remaining));
}

export function driveRoute({ stops, zone, frameTimeoutMs = 5000, noMovementTimeoutMs = 4000 }) {
  return new Promise((resolve, reject) => {
    const codes = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 };
    let held = null,
      index = 0,
      lastMovement = performance.now(),
      last = null,
      frameTimer = null,
      finished = false;

    function key(next) {
      if (next === held) return;
      if (held)
        window.dispatchEvent(
          new KeyboardEvent('keyup', {
            key: held,
            code: held,
            keyCode: codes[held],
            which: codes[held],
            bubbles: true,
          }),
        );
      held = next;
      if (held)
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: held,
            code: held,
            keyCode: codes[held],
            which: codes[held],
            bubbles: true,
          }),
        );
    }

    function finish(callback, value) {
      if (finished) return;
      finished = true;
      clearTimeout(frameTimer);
      key(null);
      callback(value);
    }

    function fail(error) {
      finish(reject, error instanceof Error ? error : new Error(String(error)));
    }

    function armFrameWatchdog() {
      clearTimeout(frameTimer);
      frameTimer = setTimeout(
        () => fail(new Error(`Route animation frame stalled in ${zone} for ${frameTimeoutMs}ms`)),
        frameTimeoutMs,
      );
    }

    function tick() {
      if (finished) return;
      armFrameWatchdog();
      try {
        const s = window.__game.scene.getScene('WorldScene');
        if (s.zoneKey !== zone) {
          finish(resolve, 'zone');
          return;
        }
        if (s.dialogActive) {
          finish(resolve, 'dialog');
          return;
        }
        if (index >= stops.length) {
          finish(resolve, 'done');
          return;
        }
        const [x, y] = stops[index],
          dx = x * 16 + 8 - s.player.x,
          dy = y * 16 - s.player.y;
        if (last && Math.hypot(s.player.x - last.x, s.player.y - last.y) > 0.1)
          lastMovement = performance.now();
        last = { x: s.player.x, y: s.player.y };
        if (performance.now() - lastMovement > noMovementTimeoutMs) {
          fail(new Error(`Blocked in ${zone} at ${s.player.x},${s.player.y}, aiming at ${x},${y}`));
          return;
        }
        // Centre the perpendicular axis before a long straight passage. This
        // prevents clipping a corner merely because the previous frame overshot.
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
          key(null);
          index++;
        } else if (Math.abs(dx) > 2 && Math.abs(dy) > 2) {
          const horizontal = index === 0 || stops[index - 1][1] === y;
          key(
            horizontal ? (dy > 0 ? 'ArrowDown' : 'ArrowUp') : dx > 0 ? 'ArrowRight' : 'ArrowLeft',
          );
        } else if (Math.abs(dx) >= 2) key(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
        else key(dy > 0 ? 'ArrowDown' : 'ArrowUp');
        requestAnimationFrame(tick);
      } catch (error) {
        fail(error);
      }
    }

    armFrameWatchdog();
    try {
      requestAnimationFrame(tick);
    } catch (error) {
      fail(error);
    }
  });
}

// This timer runs in Playwright's process, independent of Chromium. It remains
// able to end a test even when the page's main thread is completely wedged.
export function withDeadline(operation, timeoutMs = ROUTE_DEADLINE_MS, label = 'Route movement') {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} exceeded ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([operation, deadline]).finally(() => clearTimeout(timer));
}

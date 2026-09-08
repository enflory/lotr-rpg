// Shared machinery for the chapter 2–3 route specs.
//
// The route used to be one seven-minute test that walked Crickhollow to the
// East Road in a single pass. That made it the longest thing in CI by a wide
// margin and, being one test, it could not be split across runners. It is now
// three segment specs — routeForest, routeWillow, routeDowns — each starting
// from a checkpoint save at the previous segment's boundary.
//
// The seam that a single pass used to prove for free is now proved by
// BOUNDARY below: every segment asserts it reaches the flag state the next
// segment boots from, so the three cannot drift apart silently.

import { expect } from '@playwright/test';

// Chapter 1 is complete and the party is across the Brandywine. Every segment
// starts from at least this much.
export const AFTER_FERRY = {
  prologueDone: true,
  timeskipShown: true,
  metGandalf: true,
  samJoined: true,
  pippinJoined: true,
  rodeWaggon: true,
  merryMet: true,
  crossedFerry: true,
};

// Where one segment hands over to the next. `zone`/`entry` is where the next
// segment boots; `flags` is the state the previous segment must have reached.
export const BOUNDARY = {
  // routeForest ends caught by the Willow; routeWillow boots into captivity.
  willow: {
    zone: 'withywindle',
    entry: 'willow',
    flags: {
      chapter2: true,
      merryJoined: true,
      hedgeEntered: true,
      bonfireSeen: true,
      hillSeen: true,
      northTried: true,
      hollowSeen: true,
      willowTrapped: true,
    },
  },
  // routeWillow ends outside Tom's house with the song; routeDowns boots there.
  clearing: {
    zone: 'tomclearing',
    entry: 'house',
    flags: {
      chapter2: true,
      merryJoined: true,
      hedgeEntered: true,
      bonfireSeen: true,
      hillSeen: true,
      northTried: true,
      hollowSeen: true,
      willowTrapped: true,
      willowFireFailed: true,
      tomArrived: true,
      willowFreed: true,
      houseWelcomed: true,
      houseSupper: true,
      houseNightOne: true,
      houseStories: true,
      houseRing: true,
      houseRested: true,
      chapter2Complete: true,
      learnedSong: true,
      chapter3: true,
    },
  },
};

export async function press(page, key = 'Space') {
  await page.keyboard.down(key);
  await page.waitForTimeout(45);
  await page.keyboard.up(key);
}

export async function dialogue(page) {
  for (let n = 0; n < 30; n++) {
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
      null,
      { timeout: 45000 },
    );
    if (!(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)))
      return;
    await press(page);
  }
  throw new Error('Dialogue did not close');
}

export async function zone(page, key) {
  await page.waitForFunction(
    (key) => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.zoneKey === key && !s.transitioning;
    },
    key,
    { timeout: 6000 },
  );
}

export async function checkpoint(page, zoneKey = 'crickhollow', entry = 'default', flags = {}) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(
    ({ zoneKey, entry, flags, base }) => {
      localStorage.setItem(
        'lotr-rpg.save.v1',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          zone: zoneKey,
          entry,
          flags: { ...base, ...flags },
          follower: 'sam',
          objective: 'Follow Merry east to Crickhollow',
          items: {},
          collected: {},
        }),
      );
    },
    { zoneKey, entry, flags, base: AFTER_FERRY },
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await zone(page, zoneKey);
}

// Boot straight into a segment boundary.
export const bootAt = (page, name) =>
  checkpoint(page, BOUNDARY[name].zone, BOUNDARY[name].entry, BOUNDARY[name].flags);

// The seam guard: the segment just played must have produced everything the
// next segment's checkpoint assumes. Without this the three specs could drift
// out of step and all keep passing.
export async function reachedBoundary(page, name) {
  const expected = Object.keys(BOUNDARY[name].flags);
  const missing = await page.evaluate(
    (keys) => keys.filter((k) => !window.__state.flags[k]),
    expected,
  );
  expect(missing, `flags the ${name} checkpoint assumes but this segment never set`).toEqual([]);
}

// BFS chooses walkable tiles only; the actual trip uses held keyboard input and
// Arcade physics. Automatic story triggers are read and closed as encountered.
export async function walk(page, x, y) {
  const data = await page.evaluate(
    async ({ x, y }) => {
      const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
      const s = window.__game.scene.getScene('WorldScene'),
        map = s.zone.map;
      const sx = Math.floor(s.player.x / 16),
        sy = Math.floor((s.player.y + 8) / 16);
      const queue = [[sx, sy]],
        prev = new Map([[`${sx},${sy}`, null]]);
      for (let i = 0; i < queue.length; i++) {
        const [cx, cy] = queue[i];
        if (cx === x && cy === y) break;
        for (const [nx, ny] of [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ]) {
          const k = `${nx},${ny}`;
          if (map[ny]?.[nx] === undefined || COLLISION_TILES.includes(map[ny][nx]) || prev.has(k))
            continue;
          prev.set(k, [cx, cy]);
          queue.push([nx, ny]);
        }
      }
      if (!prev.has(`${x},${y}`)) throw new Error(`No walkable path in ${s.zoneKey} to ${x},${y}`);
      let p = [x, y];
      const path = [];
      while (p) {
        path.unshift(p);
        p = prev.get(p.join(','));
      }
      const stops = [];
      for (let i = 0; i < path.length; i++) {
        if (
          i === 0 ||
          i === path.length - 1 ||
          path[i + 1][0] - path[i][0] !== path[i][0] - path[i - 1][0] ||
          path[i + 1][1] - path[i][1] !== path[i][1] - path[i - 1][1]
        )
          stops.push(path[i]);
      }
      return { stops, zone: s.zoneKey };
    },
    { x, y },
  );
  const outcome = await page.evaluate(
    ({ stops, zone }) =>
      new Promise((resolve, reject) => {
        const codes = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 };
        let held = null,
          index = 0,
          lastMovement = performance.now(),
          last = null;
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
        function tick() {
          const s = window.__game.scene.getScene('WorldScene');
          if (s.zoneKey !== zone) {
            key(null);
            resolve('zone');
            return;
          }
          if (s.dialogActive) {
            key(null);
            resolve('dialog');
            return;
          }
          if (index >= stops.length) {
            key(null);
            resolve('done');
            return;
          }
          const [x, y] = stops[index],
            dx = x * 16 + 8 - s.player.x,
            dy = y * 16 - s.player.y;
          if (last && Math.hypot(s.player.x - last.x, s.player.y - last.y) > 0.1)
            lastMovement = performance.now();
          last = { x: s.player.x, y: s.player.y };
          if (performance.now() - lastMovement > 4000) {
            key(null);
            reject(
              new Error(`Blocked in ${zone} at ${s.player.x},${s.player.y}, aiming at ${x},${y}`),
            );
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
        }
        requestAnimationFrame(tick);
      }),
    data,
  );
  if (outcome === 'dialog') {
    await dialogue(page);
    await walk(page, x, y);
  }
}

export async function act(page, key) {
  console.log(`Interaction: ${key}`);
  const p = await page.evaluate(
    (key) =>
      window.__game.scene.getScene('WorldScene').zone.interactions.find((p) => p.dialogue === key),
    key,
  );
  expect(p, `interaction ${key}`).toBeTruthy();
  await walk(page, p.x, p.y);
  await press(page);
  await expect
    .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive))
    .toBe(true);
  await dialogue(page);
}

export async function flag(page, key) {
  await expect.poll(() => page.evaluate((key) => !!window.__state.flags[key], key)).toBe(true);
}

export async function reload(page, key) {
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await zone(page, key);
}

export const visibleFollowers = (page) =>
  page.evaluate(
    () => window.__game.scene.getScene('WorldScene').followers.filter((p) => p.visible).length,
  );

// Collect uncaught page errors for the length of a segment.
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

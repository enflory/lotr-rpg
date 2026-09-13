import { test, expect } from '@playwright/test';

async function press(page, key) {
  await page.keyboard.down(key);
  await page.waitForTimeout(60);
  await page.keyboard.up(key);
}

async function boot(page, joined = false) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate((joined) => {
    Object.assign(window.__state.flags, {
      prologueDone: true,
      timeskipShown: true,
      metGandalf: true,
      walkingSong: true,
    });
    if (joined) {
      window.__state.flags.samJoined = true;
      window.__state.follower = 'sam';
    }
  }, joined);
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
}

async function forest(page) {
  await page.evaluate(() =>
    window.__game.scene.getScene('WorldScene').goToZone('woodyend', 'west'),
  );
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').zoneKey === 'woodyend',
  );
  await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').transitioning);
}

// Stage west of the trigger, then walk through it using normal keyboard input.
async function approachRider(page) {
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    scene.player.setPosition(10 * 16 + 8, 15 * 16);
    scene.lastDir = 'right';
    scene.snapFollower();
  });
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').player.x >= 12 * 16 + 8,
  );
  await page.keyboard.up('ArrowRight');
}

for (const direction of ['north', 'south']) {
  test(`all three hobbits can walk into the ${direction} ferns and escape the Rider`, async ({
    page,
  }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await boot(page, true);
    await forest(page);
    await approachRider(page);
    const key = direction === 'north' ? 'ArrowUp' : 'ArrowDown';
    await page.keyboard.down(key);
    await page.waitForFunction((north) => {
      const y = window.__game.scene.getScene('WorldScene').player.y;
      return north ? y <= 12 * 16 : y >= 19 * 16;
    }, direction === 'north');
    await page.keyboard.up(key);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const s = window.__game.scene.getScene('WorldScene');
          return [s.playerFernOverlay, ...s.followers.map((f) => f.getData('fernOverlay'))].filter(
            (o) => o.visible,
          ).length;
        }),
      )
      .toBe(3);
    const spots = await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return [s.player, ...s.followers].map(
        (p) => `${Math.floor(p.x / 16)},${Math.floor((p.y + 8) / 16)}`,
      );
    });
    expect(new Set(spots).size).toBe(3);
    await page.waitForFunction(() => window.__state.flags.escapedRider, null, { timeout: 10000 });
    expect(
      await page.evaluate(() =>
        window.__game.scene.getScene('WorldScene').npcs.some((n) => n.getData('key') === 'gildor'),
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('Sam recruits Pippin from off screen; both follow, change zones and survive Continue', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await boot(page);
  await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const s = window.__game.scene.getScene('WorldScene');
    // Stand on Sam wherever the Bag End garden puts him.
    const sam = s.npcs.find((n) => n.getData('key') === 'sam');
    s.player.setPosition(sam.x, sam.y + 10);
    window.entrance = null;
    window.entranceTravel = { distance: 0, maxStep: 0, solid: false, last: null };
    s.events.on('postupdate', () => {
      if (!s.pippinArrival) return;
      const p = s.pippinArrival.sprite,
        v = s.cameras.main.worldView;
      const travel = window.entranceTravel;
      if (travel.last) {
        const step = Math.hypot(p.x - travel.last.x, p.y - travel.last.y);
        travel.distance += step;
        travel.maxStep = Math.max(travel.maxStep, step);
      }
      travel.last = { x: p.x, y: p.y };
      travel.solid ||= COLLISION_TILES.includes(
        s.zone.map[Math.floor((p.y + 8) / 16)]?.[Math.floor(p.x / 16)],
      );
      if (window.entrance) return;
      window.entrance = {
        outside: p.x < v.left - 8 || p.x > v.right + 8 || p.y < v.top - 12 || p.y > v.bottom + 12,
        x: p.x,
        y: p.y,
      };
    });
  });
  await page.waitForTimeout(500); // camera settles before Sam's conversation
  await press(page, ' ');
  await expect
    .poll(
      async () => {
        const joined = await page.evaluate(() => !!window.__state.flags.samJoined);
        if (!joined) await press(page, ' ');
        return joined;
      },
      { timeout: 15000, intervals: [100] },
    )
    .toBe(true);
  await page.waitForFunction(() => window.__state.flags.pippinJoined, null, { timeout: 10000 });
  expect(await page.evaluate(() => window.entrance?.outside)).toBe(true);
  const travel = await page.evaluate(() => window.entranceTravel);
  expect(travel.distance).toBeGreaterThan(100);
  expect(travel.maxStep).toBeLessThan(20); // walks in; no on-screen teleport
  expect(travel.solid).toBe(false);
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return {
        keys: s.followers.map((p) => p.getData('key')),
        locked: s.inputLocked,
        npcSam: s.npcs.some((p) => p.getData('key') === 'sam'),
      };
    }),
  ).toEqual({ keys: ['sam', 'pippin'], locked: false, npcSam: false });

  await forest(page);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').player.x >= 80);
  await page.keyboard.up('ArrowRight');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').player.body.velocity.x === 0,
  );
  // Arcade physics synchronizes sprite positions after Scene.update. Wait
  // for the next settled frame rather than sampling between those phases.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const s = window.__game.scene.getScene('WorldScene');
        return s.player.x - s.followers[0].x;
      }),
    )
    .toBeCloseTo(18, 0);
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.followers[0].x - s.followers[1].x;
    }),
  ).toBeCloseTo(18, 0);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return {
        zone: s.zoneKey,
        followers: s.followers.map((p) => p.getData('key')),
        arriving: !!s.pippinArrival,
      };
    }),
  ).toEqual({ zone: 'woodyend', followers: ['sam', 'pippin'], arriving: false });
  expect(errors).toEqual([]);
});

test('getting caught resets both followers and allows a retry', async ({ page }) => {
  await boot(page, true);
  await forest(page);
  await approachRider(page);
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').riderEvent?.phase === 'caught',
  );
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return s.riderEvent?.phase === 'armed' && !s.inputLocked;
  });
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.followers.every((p) => Math.hypot(p.x - s.player.x, p.y - s.player.y) <= 40);
    }),
  ).toBe(true);
  await approachRider(page);
  await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').player.y <= 12 * 16);
  await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => window.__state.flags.escapedRider, null, { timeout: 10000 });
});

import { test, expect } from '@playwright/test';
import { act, checkpoint, dialogue, settled, walk, watchErrors } from './journeyRoute.js';

const party = { chapter2: true, merryJoined: true, learnedSong: true };

test('Continue after courage in an older save keeps the chamber visible', async ({ page }) => {
  // This also walks to the song and plays the entire rescue. Identical code
  // took 45s in CI, then exceeded the default 60s on another runner. Keep
  // the helper's per-step stall limits, but allow headroom for the full scene.
  test.setTimeout(120000);
  await checkpoint(page, 'barrow', 'default', {
    ...party,
    barrowTaken: true,
    barrowCourage: true,
  });
  const state = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return {
      dark: s.journey.downs.dark.alpha,
      angle: s.player.angle,
      dialogue: s.dialogActive,
      physics: s.player.body.enable,
    };
  });
  expect(state).toEqual({ dark: 0, angle: 0, dialogue: false, physics: true });
  await act(page, 'barrow_call');
  await settled(page);
  expect(await page.evaluate(() => window.__state.flags.barrowRescued)).toBe(true);
});

test('the morning hill updates collected blades and recovered ponies immediately', async ({
  page,
}) => {
  const errors = watchErrors(page);
  await checkpoint(page, 'barrowhill', 'default', {
    ...party,
    barrowRescued: true,
    hillRisen: true,
  });
  const props = () =>
    page.evaluate(() => {
      const b = window.__game.scene.getScene('WorldScene').journey.downs;
      return { blades: b.blades.visible, ponies: b.ponies.length };
    });
  expect(await props()).toEqual({ blades: true, ponies: 0 });
  await act(page, 'barrow_treasure');
  expect(await props()).toEqual({ blades: false, ponies: 0 });
  await act(page, 'barrow_ponies');
  expect(await props()).toEqual({ blades: false, ponies: 6 });
  await page.waitForTimeout(500);
  expect(await props()).toEqual({ blades: false, ponies: 6 });
  expect(errors).toEqual([]);
});

test('older hill saves with blades do not replay the companions waking', async ({ page }) => {
  await checkpoint(page, 'barrowhill', 'default', {
    ...party,
    barrowRescued: true,
    barrowBlades: true,
  });
  const state = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return {
      rising: s.journey.downs.rising,
      busy: !!s.storyBeat,
      angles: s.followers.map((p) => p.angle),
    };
  });
  expect(state).toEqual({ rising: false, busy: false, angles: [0, 0, 0] });
});

test('the companions stay behind the gate without crossing stone or hillside', async ({ page }) => {
  test.setTimeout(90000);
  const errors = watchErrors(page);
  await checkpoint(page, 'downs', 'gate', { ...party, downsFog: true });
  await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const s = window.__game.scene.getScene('WorldScene');
    window.__gateSamples = { count: 0, blocked: [] };
    const sample = () => {
      if (s.zoneKey !== 'downs' || window.__state.flags.downsSeparated) return;
      if (s.dialogKey === 'downs_gate' && s.dialogIndex === 1 && s.storyBeat?.busy) {
        for (const p of s.followers) {
          if (!p.visible || p.alpha < 0.05) continue;
          const x = Math.floor(p.x / 16),
            y = Math.floor((p.y + 8) / 16);
          window.__gateSamples.count++;
          if (COLLISION_TILES.includes(s.zone.map[y]?.[x]))
            window.__gateSamples.blocked.push({ key: p.getData('key'), x, y });
        }
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await dialogue(page);
  await settled(page);
  expect(await page.evaluate(() => window.__state.flags.downsSeparated)).toBe(true);
  const samples = await page.evaluate(() => window.__gateSamples);
  expect(samples.count).toBeGreaterThan(50);
  expect(samples.blocked).toEqual([]);
  expect(errors).toEqual([]);
});

// A daylight circuit is optional: wandering must not trigger the sleep or fog.
test('explore the southern downs and return to the track in daylight', async ({ page }) => {
  test.setTimeout(180000);
  const errors = watchErrors(page);
  await checkpoint(page, 'downs', 'west', { ...party, chapter3: true });
  await act(page, 'downs_mounds');
  await act(page, 'downs_heather');
  await act(page, 'downs_weathered');
  await walk(page, 28, 23);
  expect(await page.evaluate(() => !!window.__state.flags.downsFog)).toBe(false);
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').zoneKey)).toBe(
    'downs',
  );
  expect(errors).toEqual([]);
});

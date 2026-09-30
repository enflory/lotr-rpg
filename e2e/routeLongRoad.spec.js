// Chapter 5 walked end to end with real keyboard input, in two segments that
// each boot from a checkpoint. `AFTER_BREE` is the seam: the first segment's
// Bree-era flags are exactly what the chapter-4 route finishes with, and the
// second asserts it reached the flags this chapter's midpoint assumes.
import { test, expect } from '@playwright/test';
import {
  checkpoint,
  walk,
  zone,
  act,
  flag,
  reload,
  watchErrors,
  reachedAll,
} from './journeyRoute.js';
import { AFTER_BREE, through } from './longRoadRoute.js';

test('walks from the road out of Bree through Midgewater and up Weathertop to the wound', async ({
  page,
}, info) => {
  info.setTimeout(process.env.CI ? 480000 : 300000);
  const errors = watchErrors(page);
  await checkpoint(page, 'breeroad', 'east', AFTER_BREE);
  await walk(page, 39, 11);
  await zone(page, 'midgewater');
  await act(page, 'road_marsh');
  await act(page, 'road_bill');
  await act(page, 'road_midges');
  await flag(page, 'midgesEndured');
  await reload(page, 'midgewater');
  await walk(page, 49, 12);
  await zone(page, 'weathertop');
  await act(page, 'road_hill');
  await act(page, 'road_rune');
  await act(page, 'road_fire');
  await flag(page, 'fireTale');
  // The night camp is where Continue brings the party back.
  await reload(page, 'weathertop');
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').entryKey)).toBe(
    'dell',
  );
  await act(page, 'road_attack');
  // The wound follows the stabbing by itself; the route's dialogue loop reads it.
  await flag(page, 'wraithsCame');
  await flag(page, 'frodoWounded');
  await reload(page, 'weathertop');
  await reachedAll(page, { ...AFTER_BREE, ...through('road_athelas') });
  expect(errors).toEqual([]);
});

test('walks from the wounded camp through the Trollshaws to the Ford of Bruinen', async ({
  page,
}, info) => {
  info.setTimeout(process.env.CI ? 480000 : 300000);
  const errors = watchErrors(page);
  await checkpoint(page, 'weathertop', 'dell', { ...AFTER_BREE, ...through('road_athelas') });
  await walk(page, 51, 30);
  await zone(page, 'trollshaws');
  await act(page, 'road_athelas');
  await act(page, 'road_trolls');
  await reload(page, 'trollshaws');
  await act(page, 'road_glorfindel');
  await flag(page, 'glorfindelMet');
  await walk(page, 59, 15);
  await zone(page, 'bruinen');
  await act(page, 'road_ford');
  await flag(page, 'chapter5Complete');
  const end = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return {
      x: s.player.x,
      alpha: s.player.alpha,
      entry: s.entryKey,
      riders: s.road.riders.length,
      followers: s.followers.filter((p) => p.visible).length,
    };
  });
  expect(end.x).toBeGreaterThan(34 * 16);
  expect(end).toMatchObject({ alpha: 1, entry: 'east', riders: 9, followers: 0 });
  await reload(page, 'bruinen');
  const after = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return {
      x: s.player.x,
      riders: s.road.riders.length,
      visible: s.followers.some((p) => p.visible),
    };
  });
  expect(after.x).toBeGreaterThan(34 * 16);
  expect(after).toMatchObject({ riders: 9, visible: false });
  // The Nine are behind the water; nothing on the far bank leads back across.
  await walk(page, 34, 11);
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(1200);
  await page.keyboard.up('ArrowLeft');
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.x),
  ).toBeGreaterThan(33 * 16);
  expect(errors).toEqual([]);
});

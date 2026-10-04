// Shared by the chapter 6 specs: the flags at the end of chapter five, and the
// flags a player holds just before any given beat of Rivendell.
import { expect } from '@playwright/test';
import { AFTER_BREE } from './longRoadRoute.js';
import { dialogue } from './journeyRoute.js';
import { LONG_ROAD_BEATS } from '../src/state/longRoadProgress.js';
import { RIVENDELL_BEATS } from '../src/state/rivendellProgress.js';

export const AFTER_ROAD = {
  ...AFTER_BREE,
  ...Object.fromEntries(LONG_ROAD_BEATS.map((b) => [b.flag, true])),
};

/** Every flag a player has set by the time `key` is the next beat. */
export const through = (key) => ({
  ...AFTER_ROAD,
  ...Object.fromEntries(
    RIVENDELL_BEATS.slice(
      0,
      RIVENDELL_BEATS.findIndex((b) => b.key === key),
    ).map((b) => [b.flag, true]),
  ),
});

/** A scene that starts by itself: wait for its dialogue to open, then read it through. */
export async function autoStory(page, key) {
  await page.waitForFunction(
    (key) => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.dialogActive && s.dialogKey === key;
    },
    key,
    { timeout: 30000 },
  );
  await dialogue(page);
}

export const here = (page) =>
  page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return { zone: s.zoneKey, entry: s.entryKey, x: s.player.x, y: s.player.y };
  });

export async function expectItems(page, keys) {
  const items = await page.evaluate(() => window.__state.items);
  for (const k of keys) expect(items[k], k).toBeGreaterThan(0);
}

// Chapter 6 walked end to end with real keyboard input, in two segments that
// each boot from a checkpoint. `through('rv_council1')` is the seam: the first
// segment must finish with exactly the flags the second assumes.
import { test, expect } from '@playwright/test';
import {
  checkpoint,
  walk,
  zone,
  act,
  flag,
  reload,
  press,
  watchErrors,
  reachedAll,
} from './journeyRoute.js';
import { AFTER_ROAD, through, autoStory, here, expectItems } from './rivendellRoute.js';

test('walks the flood, the waking, the feast and the Hall of Fire', async ({ page }, info) => {
  info.setTimeout(process.env.CI ? 480000 : 300000);
  const errors = watchErrors(page);
  await checkpoint(page, 'bruinen', 'east', AFTER_ROAD);
  await act(page, 'rv_flood');
  await flag(page, 'fordFlooded');
  // The flood ends in darkness and then in a bed in the house of Elrond.
  await zone(page, 'rivendellroom');
  await autoStory(page, 'rv_wake');
  await flag(page, 'rivendellWoke');
  await reload(page, 'rivendellroom');
  expect((await here(page)).entry).toBe('fromHall');
  await walk(page, 12, 0);
  await zone(page, 'rivendellhall');
  await act(page, 'rv_feast');
  await flag(page, 'feastHeld');
  await reload(page, 'rivendellhall');
  expect((await here(page)).entry).toBe('hearth');
  await act(page, 'rv_song');
  await flag(page, 'hallOfFire');
  await reload(page, 'rivendellhall');
  await reachedAll(page, through('rv_council1'));
  expect(errors).toEqual([]);
});

test('walks the Council, the long weeks, the gifts and the Company at the gate', async ({ page }, info) => {
  info.setTimeout(process.env.CI ? 480000 : 300000);
  const errors = watchErrors(page);
  await checkpoint(page, 'rivendell', 'porch', through('rv_council1'));
  await act(page, 'rv_council1');
  await flag(page, 'councilOpened');
  await reload(page, 'rivendell');
  await act(page, 'rv_council2');
  await act(page, 'rv_council3');
  await flag(page, 'ringBearerChosen');
  await reload(page, 'rivendell');
  await act(page, 'rv_weeks');
  await flag(page, 'weeksPassed');
  // Into the house by the round door, to Bilbo.
  await walk(page, 26, 18);
  await press(page);
  await zone(page, 'rivendellroom');
  await act(page, 'rv_gifts');
  await flag(page, 'giftsGiven');
  await expectItems(page, ['sting', 'mithril_coat']);
  await reload(page, 'rivendellroom');
  await walk(page, 12, 13);
  await zone(page, 'rivendell');
  await act(page, 'rv_company');
  await flag(page, 'chapter6Complete');
  const end = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return {
      entry: s.entryKey,
      alpha: s.player.alpha,
      walkers: s.npcs.map((n) => n.getData('key')).sort(),
      hobbits: Object.values(s.rv.walk).filter((p) => p.visible).length,
    };
  });
  expect(end.entry).toBe('gate');
  expect(end.alpha).toBe(1);
  expect(end.hobbits).toBe(3);
  for (const k of ['gandalfrv', 'dunadan', 'legolas', 'gimli', 'boromir'])
    expect(end.walkers, k).toContain(k);
  await reload(page, 'rivendell');
  const after = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return { y: s.player.y, hobbits: Object.values(s.rv.walk).filter((p) => p.visible).length };
  });
  expect(after.hobbits).toBe(3);
  expect(after.y).toBeGreaterThan(38 * 16);
  await act(page, 'rv_roadsouth');
  expect(errors).toEqual([]);
});

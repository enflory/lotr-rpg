// Route segment 3 of 3: the Barrow-downs, the barrow itself, and Tom's
// farewell on the East Road.
//
// Boots from the `clearing` boundary routeWillow.spec.js asserts it reaches.
// See e2e/journeyRoute.js.

import { test, expect } from '@playwright/test';
import {
  act,
  bootAt,
  dialogue,
  flag,
  reload,
  settled,
  visibleFollowers,
  walk,
  watchErrors,
  zone,
} from './journeyRoute.js';

test('the downs, the barrow and the road east with Continue at each turn', async ({ page }) => {
  // Shortest segment (~2 minutes locally), but subject to the runner spread.
  test.setTimeout(600000);
  const errors = watchErrors(page);
  await bootAt(page, 'clearing');

  // Out of the clearing and onto the downs: the way is open only because Tom
  // has given them the verse.
  await walk(page, 43, 16);
  await zone(page, 'downs');
  await act(page, 'downs_farewell');
  await act(page, 'downs_view');
  await act(page, 'downs_stone');
  await flag(page, 'downsFog');
  // The mist checkpoint is the great stone, not the doorway they came in by.
  await reload(page, 'downs');
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').entryKey)).toBe(
    'stone',
  );

  // The two stones are the only gap in the scarp, so reaching them is what
  // separates the party. Nobody is left visible afterwards.
  await walk(page, 53, 14);
  await flag(page, 'downsSeparated');
  await settled(page);
  expect(await visibleFollowers(page)).toBe(0);

  // Taken by the wight in the hollow beyond.
  await walk(page, 61, 9);
  await zone(page, 'barrow');
  // Frodo wakes into the barrow on his own; the scene starts itself.
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').dialogActive, null, {
    timeout: 15000,
  });
  await dialogue(page);
  await flag(page, 'barrowWoke');
  await reload(page, 'barrow');
  await act(page, 'barrow_courage');
  await flag(page, 'barrowCourage');
  await act(page, 'barrow_hoard');
  await reload(page, 'barrow');
  await act(page, 'barrow_call');
  await zone(page, 'barrowhill');

  // The three of them get up out of the grass before control comes back.
  await settled(page);
  expect(await visibleFollowers(page)).toBe(3);
  await act(page, 'barrow_broken');

  // The blades are given once, however often the treasure is searched.
  await act(page, 'barrow_treasure');
  await act(page, 'barrow_treasure');
  expect(await page.evaluate(() => window.__state.items.barrow_blades)).toBe(1);
  await act(page, 'barrow_ponies');

  // Tom's farewell closes chapter 3, and it survives Continue.
  await walk(page, 41, 21);
  await zone(page, 'eastroad');
  await act(page, 'road_farewell');
  await flag(page, 'chapter3Complete');
  await reload(page, 'eastroad');
  await flag(page, 'chapter3Complete');
  expect(await visibleFollowers(page)).toBe(3);
  expect(errors).toEqual([]);
});

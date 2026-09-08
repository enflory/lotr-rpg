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
  visibleFollowers,
  walk,
  watchErrors,
  zone,
} from './journeyRoute.js';

test('the downs, the barrow and the road east with Continue at each turn', async ({ page }) => {
  test.setTimeout(300000);
  const errors = watchErrors(page);
  await bootAt(page, 'clearing');

  // Out of the clearing and into the fog.
  await walk(page, 43, 16);
  await zone(page, 'downs');
  await act(page, 'downs_farewell');
  await act(page, 'downs_stone');
  await flag(page, 'downsFog');
  await reload(page, 'downs');

  // Taken by the wight.
  await walk(page, 60, 9);
  await dialogue(page);
  await zone(page, 'barrow');
  await reload(page, 'barrow');
  await act(page, 'barrow_courage');
  await flag(page, 'barrowCourage');
  await reload(page, 'barrow');
  await act(page, 'barrow_call');
  await zone(page, 'barrowhill');

  // The blades are given once, however often the mound is searched.
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

// Route segment 2 of 3: the rescue from Old Man Willow, and the two nights
// under Tom Bombadil's roof, ending back out in the clearing with the song.
//
// Boots from the `willow` boundary routeForest.spec.js asserts it reaches, and
// continues in routeDowns.spec.js. See e2e/journeyRoute.js.

import { test, expect } from '@playwright/test';
import {
  act,
  bootAt,
  flag,
  press,
  reachedBoundary,
  reload,
  visibleFollowers,
  walk,
  watchErrors,
  zone,
} from './journeyRoute.js';

test('Tom frees the party from the Willow and keeps them two nights', async ({ page }) => {
  test.setTimeout(420000);
  const errors = watchErrors(page);
  await bootAt(page, 'willow');

  // Fire fails, the call is answered, Tom sings the Willow open.
  await act(page, 'willow_trunk');
  await flag(page, 'willowFireFailed');
  await act(page, 'willow_help');
  await flag(page, 'tomArrived');
  await act(page, 'willow_tom');
  await flag(page, 'willowFreed');
  expect(await visibleFollowers(page)).toBe(3);

  // Up the river path and into the house.
  await walk(page, 79, 16);
  await zone(page, 'tomclearing');
  await walk(page, 28, 13);
  await press(page);
  await zone(page, 'tomhouse');
  expect(await page.evaluate(() => !!window.__state.flags.learnedSong)).toBe(false);

  // First night, then Continue, then the tales, the Ring and the second night.
  await act(page, 'house_welcome');
  await act(page, 'house_supper');
  await act(page, 'house_bed');
  await flag(page, 'houseNightOne');
  await reload(page, 'tomhouse');
  await act(page, 'house_stories');
  await act(page, 'house_ring');
  await act(page, 'house_bed');
  await flag(page, 'houseRested');
  await act(page, 'house_farewell');
  await flag(page, 'learnedSong');
  expect(
    await page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').journey.markers.some((m) => m.dot.visible),
    ),
  ).toBe(false);
  expect(await page.evaluate(() => window.__state.items.tom_song)).toBe(1);

  // Out through the doorway — the state routeDowns boots from.
  await walk(page, 18, 21);
  await zone(page, 'tomclearing');
  await reachedBoundary(page, 'clearing');
  expect(errors).toEqual([]);
});

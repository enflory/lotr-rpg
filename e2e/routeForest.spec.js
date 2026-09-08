// Route segment 1 of 3: Crickhollow, the hedge tunnel and the Old Forest,
// as far as Old Man Willow closing on the party.
//
// Continues in routeWillow.spec.js, which boots from the `willow` boundary
// this spec asserts it reaches. See e2e/journeyRoute.js.

import { test, expect } from '@playwright/test';
import {
  act,
  checkpoint,
  dialogue,
  flag,
  press,
  reachedBoundary,
  reload,
  walk,
  watchErrors,
  zone,
} from './journeyRoute.js';

test('supper at Crickhollow, then the hedge and the forest as far as the Willow', async ({
  page,
}) => {
  // Observed 155s / 228s / 393s across three CI runs on identical code —
  // GitHub runners vary up to 2.5x. 393s against the old 420s budget left a 7%
  // margin, so a slower runner would have gone red for no reason. Timeout
  // headroom is free on a passing run; a spurious failure is not.
  test.setTimeout(900000);
  const errors = watchErrors(page);
  await checkpoint(page, 'crickhollow');

  // Evening meal, the overnight cutscene, and Merry joining at dawn.
  await act(page, 'crickhollow_departure');
  await walk(page, 13, 10);
  await press(page);
  await zone(page, 'crickhollowhouse');
  await act(page, 'crickhollow_supper');
  await page.waitForFunction(() => window.__state.flags.crickhollowReady, null, { timeout: 35000 });
  await zone(page, 'crickhollow');
  await act(page, 'crickhollow_departure');
  await flag(page, 'merryJoined');
  expect(
    await page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').followers.map((p) => p.getData('key')),
    ),
  ).toEqual(['sam', 'pippin', 'merry']);

  // Through the High Hay into the forest.
  await walk(page, 39, 20);
  await zone(page, 'hedgetunnel');
  await act(page, 'hedge_gate');
  await walk(page, 35, 9);
  await zone(page, 'forestgate');
  await act(page, 'forest_glade');
  await act(page, 'forest_oaks');
  await walk(page, 63, 21);
  await zone(page, 'forestheart');
  await act(page, 'forest_hill');
  await act(page, 'forest_north');
  await act(page, 'forest_hollow');

  // Down to the Withywindle, where the Willow takes everyone but Sam.
  await walk(page, 71, 43);
  await zone(page, 'withywindle');
  await walk(page, 44, 22);
  await dialogue(page);
  await flag(page, 'willowTrapped');
  expect(
    await page.evaluate(() =>
      window.__game.scene
        .getScene('WorldScene')
        .followers.filter((p) => p.visible && !p.getData('held'))
        .map((p) => p.getData('key')),
    ),
  ).toEqual(['sam']);

  // Captivity survives Continue, and the state routeWillow boots from is real.
  await reload(page, 'withywindle');
  await reachedBoundary(page, 'willow');
  expect(errors).toEqual([]);
});

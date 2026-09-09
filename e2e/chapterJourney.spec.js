// The cheap seams of the chapter 2–3 route: the ferry handover into
// Crickhollow, and the gates Willow captivity puts on leaving the river.
//
// The route walk itself lives in routeForest / routeWillow / routeDowns.

import { test, expect } from '@playwright/test';
import { BOUNDARY, bootAt, checkpoint, press, reload, walk, zone } from './journeyRoute.js';

test('the Buckland checkpoint continues naturally into Crickhollow', async ({ page }) => {
  await checkpoint(page, 'marish', 'buckland');
  await walk(page, 55, 15);
  await zone(page, 'crickhollow');
  expect(await page.evaluate(() => window.__state.flags.crossedFerry)).toBe(true);
});

test('Willow captivity blocks both departures and survives Continue', async ({ page }) => {
  await bootAt(page, 'willow');
  for (const [x, y] of [
    [0, 14],
    [79, 16],
  ]) {
    await page.evaluate(
      ({ x, y }) => {
        const s = window.__game.scene.getScene('WorldScene');
        s.player.setPosition(x * 16 + 8, y * 16 + 2);
        s.checkExits();
      },
      { x, y },
    );
    expect(
      await page.evaluate(() => window.__game.scene.getScene('WorldScene').transitioning),
    ).toBe(false);
  }
  await reload(page, 'withywindle');
  expect(
    await page.evaluate(() =>
      window.__game.scene
        .getScene('WorldScene')
        .followers.filter((p) => p.visible && !p.getData('held'))
        .map((p) => p.getData('key')),
    ),
  ).toEqual(['sam']);
});

// The boundary checkpoints are only trustworthy if the zones and entries they
// name actually exist; a rename would otherwise strand a segment at the title.
test('every route boundary names a real zone entry', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  for (const [name, { zone: key, entry }] of Object.entries(BOUNDARY)) {
    const spawns = await page.evaluate(async (key) => {
      const { ZONES } = await import('/src/data/zones/index.js');
      return ZONES[key] ? Object.keys(ZONES[key].spawns) : null;
    }, key);
    expect(spawns, `boundary ${name} names zone ${key}`).not.toBeNull();
    expect(spawns, `boundary ${name} entry ${entry}`).toContain(entry);
  }
  await press(page, 'Enter');
});

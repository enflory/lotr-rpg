// Chapter 6 on a phone: the thumb pad and the A button must be enough to walk
// the hall, read the feast, answer the Council's one prompt and see the Company
// to the gate, in portrait and in landscape. Chromium emulating an iPhone 13,
// not real Safari.
import { test, expect } from '@playwright/test';
import { through } from './rivendellRoute.js';
import {
  PHONE,
  LANDSCAPE,
  continueAt,
  scene,
  holdPad,
  tapThrough,
  controlsCover,
} from './phone.js';

for (const [label, device] of [
  ['portrait', PHONE],
  ['landscape', LANDSCAPE],
]) {
  test.describe(`on a phone, ${label}`, () => {
    test.use(device);

    test(`the pad walks the hall and A reads the feast (${label})`, async ({ page }) => {
      await continueAt(page, 'rivendellhall', 'fromRooms', through('rv_feast'));
      await expect(page.locator('#touch-pad')).toBeVisible();
      const y0 = await scene(page, (s) => s.player.y);
      await holdPad(page, 0, -45, 500);
      expect(await scene(page, (s) => s.player.y)).toBeLessThan(y0 - 8);
      await scene(page, (s) => s.player.setPosition(15 * 16 + 8, 8 * 16 + 8));
      await page.waitForTimeout(150);
      await page.getByLabel('action').tap();
      await expect.poll(() => scene(page, (s) => s.dialogActive)).toBe(true);
      await tapThrough(page, (s) => s.dialogIndex === 3 && !s.typing);
      expect(await controlsCover(page)).toEqual([]);
      await page.screenshot({ path: test.info().outputPath(`feast-${label}.png`) });
      await tapThrough(page, (_s) => !!window.__state.flags.feastHeld);
      expect(await scene(page, (s) => s.actionVerb())).toBe('TAP A');
    });

    test(`A answers the Council: Rise and speak (${label})`, async ({ page }) => {
      await continueAt(page, 'rivendell', 'porch', through('rv_council3'));
      await scene(page, (s) => s.player.setPosition(48 * 16 + 8, 21 * 16 + 8));
      await page.waitForTimeout(150);
      await page.getByLabel('action').tap();
      await expect.poll(() => scene(page, (s) => s.dialogActive)).toBe(true);
      await tapThrough(page, (s, p) => s.storyBeat?.prompt === p && !s.typing, 'Rise and speak');
      expect(await scene(page, (s) => s.actionHint.text)).toContain('TAP A · Rise and speak');
      expect(await controlsCover(page)).toEqual([]);
      await page.screenshot({ path: test.info().outputPath(`council-${label}.png`) });
      await tapThrough(page, (_s) => !!window.__state.flags.ringBearerChosen);
    });

    test(`A sees the Company to the gate (${label})`, async ({ page }) => {
      await continueAt(page, 'rivendell', 'door', through('rv_company'));
      await scene(page, (s) => s.player.setPosition(30 * 16 + 8, 39 * 16 + 8));
      await page.waitForTimeout(150);
      await page.getByLabel('action').tap();
      await expect.poll(() => scene(page, (s) => s.dialogActive)).toBe(true);
      await tapThrough(page, (s) => s.dialogIndex >= 2 && !s.typing);
      expect(await controlsCover(page)).toEqual([]);
      await tapThrough(page, (_s) => !!window.__state.flags.chapter6Complete);
      await page.waitForFunction(
        () => window.__game.scene.getScene('WorldScene').rv.temp.length === 0,
      );
      await page.screenshot({ path: test.info().outputPath(`gate-${label}.png`) });
      expect(await scene(page, (s) => s.entryKey)).toBe('gate');
    });
  });
}

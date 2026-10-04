// Chapter 5 on a phone: the thumb pad and the A button must be enough to walk
// the marsh, read a cue, answer the two prompts on Weathertop and mount Asfaloth,
// in portrait and in landscape. Chromium emulating an iPhone 13, not real Safari.
import { test, expect } from '@playwright/test';
import { AFTER_BREE, through } from './longRoadRoute.js';
import { PHONE, LANDSCAPE, continueAt, scene, holdPad, tapThrough, controlsCover } from './phone.js';

for (const [label, device] of [
  ['portrait', PHONE],
  ['landscape', LANDSCAPE],
]) {
  test.describe(`on a phone, ${label}`, () => {
    test.use(device);

    test(`the pad walks Midgewater and A reads the road (${label})`, async ({ page }) => {
      await continueAt(page, 'midgewater', 'west', AFTER_BREE);
      await expect(page.locator('#touch-pad')).toBeVisible();
      const x0 = await scene(page, (s) => s.player.x);
      await holdPad(page, 45, 0, 500);
      expect(await scene(page, (s) => s.player.x)).toBeGreaterThan(x0 + 8);
      // Stand on the cue and tap A: the prompt names the button, not a key.
      await scene(page, (s) => s.player.setPosition(4 * 16 + 8, 13 * 16 + 8));
      await page.waitForTimeout(150);
      await page.getByLabel('action').tap();
      await expect.poll(() => scene(page, (s) => s.dialogActive)).toBe(true);
      await tapThrough(page, (s) => s.dialogIndex === 3 && !s.typing);
      expect(await controlsCover(page)).toEqual([]);
      await tapThrough(page, (_s) => !!window.__state.flags.marshEntered);
      expect(await scene(page, (s) => s.actionVerb())).toBe('TAP A');
      await page.screenshot({ path: test.info().outputPath(`midgewater-${label}.png`) });
    });

    test(`A answers both Weathertop prompts and the wound follows (${label})`, async ({ page }) => {
      await continueAt(page, 'weathertop', 'dell', { ...AFTER_BREE, ...through('road_attack') });
      await scene(page, (s) => s.player.setPosition(39 * 16 + 8, 29 * 16 + 8));
      await page.waitForTimeout(150);
      await page.getByLabel('action').tap();
      await expect.poll(() => scene(page, (s) => s.dialogActive)).toBe(true);
      for (const prompt of ['Slip on the Ring', 'Strike and cry out']) {
        await tapThrough(page, (s, p) => s.storyBeat?.prompt === p && !s.typing, prompt);
        expect(await scene(page, (s) => s.actionHint.text)).toContain(`TAP A · ${prompt}`);
        expect(await controlsCover(page)).toEqual([]);
      }
      await tapThrough(page, (_s) => !!window.__state.flags.frodoWounded);
      expect(await scene(page, (s) => s.player.angle)).toBe(0);
    });

    test(`A mounts Asfaloth and the Ford ride completes (${label})`, async ({ page }) => {
      await continueAt(page, 'bruinen', 'west', { ...AFTER_BREE, ...through('road_ford') });
      await scene(page, (s) => s.player.setPosition(5 * 16 + 8, 11 * 16 + 8));
      await page.waitForTimeout(150);
      await page.getByLabel('action').tap();
      await expect.poll(() => scene(page, (s) => s.dialogActive)).toBe(true);
      await tapThrough(page, (s) => s.storyBeat?.prompt === 'Mount Asfaloth' && !s.typing);
      const cover = await controlsCover(page);
      expect(cover).toEqual([]);
      await page.screenshot({ path: test.info().outputPath(`mount-${label}.png`) });
      await tapThrough(page, (_s) => !!window.__state.flags.chapter5Complete);
      expect(await scene(page, (s) => s.player.x)).toBeGreaterThan(34 * 16);
      await page.screenshot({ path: test.info().outputPath(`ford-${label}.png`) });
    });
  });
}

// Chapter 5 on a phone: the thumb pad and the A button must be enough to walk
// the marsh, read a cue, answer the two prompts on Weathertop and mount Asfaloth,
// in portrait and in landscape. Chromium emulating an iPhone 13, not real Safari.
import { test, expect, devices } from '@playwright/test';
import { AFTER_BREE, through } from './longRoadRoute.js';

const PHONE = { ...devices['iPhone 13'] };
const LANDSCAPE = { ...devices['iPhone 13 landscape'] };
delete PHONE.defaultBrowserType;
delete LANDSCAPE.defaultBrowserType;

async function continueAt(page, zone, entry, flags) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(
    ({ zone, entry, flags }) =>
      localStorage.setItem(
        'lotr-rpg.save.v1',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          zone,
          entry,
          flags: {
            prologueDone: true,
            timeskipShown: true,
            metGandalf: true,
            samJoined: true,
            pippinJoined: true,
            merryJoined: true,
            ...flags,
          },
          follower: 'sam',
          objective: 'x',
          items: {},
          collected: {},
        }),
      ),
    { zone, entry, flags },
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.waitForTimeout(250);
  const vp = page.viewportSize();
  // A tap anywhere but the NEW GAME target continues.
  await page.touchscreen.tap(vp.width / 2, vp.height - 12);
  await page.waitForFunction((z) => {
    const s = window.__game.scene.getScene('WorldScene');
    return s.zoneKey === z && !s.transitioning;
  }, zone);
  await page.waitForTimeout(700);
}

const scene = (page, fn, arg) =>
  page.evaluate(
    ([src, arg]) =>
      new Function('s', 'arg', `return (${src})(s, arg)`)(
        window.__game.scene.getScene('WorldScene'),
        arg,
      ),
    [fn.toString(), arg],
  );

async function holdPad(page, dx, dy, ms) {
  const box = await page.locator('#touch-pad').boundingBox();
  const cx = box.x + box.width / 2,
    cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps: 4 });
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

// Tap A until the page shows a story prompt, or the dialogue closes.
async function tapThrough(page, until, arg) {
  for (let n = 0; n < 40; n++) {
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
      null,
      {
        timeout: 40000,
      },
    );
    if (await scene(page, until, arg)) return;
    await page.getByLabel('action').tap();
    await page.waitForTimeout(120);
  }
  throw new Error('Taps never reached the target');
}

// Does any visible touch control sit over the dialogue box or the action prompt?
async function controlsCover(page) {
  const canvas = await page.locator('canvas').boundingBox();
  const k = canvas.width / 960;
  const game = await scene(page, (s) => {
    const r = (o) => (o.visible ? o.getBounds() : null);
    return { dialog: r(s.dialogBg), hint: r(s.actionHint) };
  });
  const covered = [];
  for (const [sel, control] of [
    ['#touch-pad', page.locator('#touch-pad')],
    ['A button', page.getByLabel('action')],
  ]) {
    const b = await control.boundingBox();
    if (!b) continue;
    for (const [name, g] of Object.entries(game)) {
      if (!g) continue;
      const box = { x: canvas.x + g.x * k, y: canvas.y + g.y * k, w: g.width * k, h: g.height * k };
      if (
        b.x < box.x + box.w &&
        b.x + b.width > box.x &&
        b.y < box.y + box.h &&
        b.y + b.height > box.y
      )
        covered.push(`${sel} over ${name}`);
    }
  }
  return covered;
}

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

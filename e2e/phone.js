// Shared by the phone specs (chapters 5 and 6): Continue from a tap, the thumb
// pad, tapping A through a dialogue, and a check that no control covers the
// dialogue box. Chromium emulating an iPhone 13, not real Safari.
import { devices } from '@playwright/test';

export const PHONE = { ...devices['iPhone 13'] };
export const LANDSCAPE = { ...devices['iPhone 13 landscape'] };
delete PHONE.defaultBrowserType;
delete LANDSCAPE.defaultBrowserType;

export async function continueAt(page, zone, entry, flags) {
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

export const scene = (page, fn, arg) =>
  page.evaluate(
    ([src, arg]) =>
      new Function('s', 'arg', `return (${src})(s, arg)`)(
        window.__game.scene.getScene('WorldScene'),
        arg,
      ),
    [fn.toString(), arg],
  );

export async function holdPad(page, dx, dy, ms) {
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
export async function tapThrough(page, until, arg) {
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
export async function controlsCover(page) {
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


// Mobile-browser play: the DOM touch layer must start the game, move the
// player, talk, and open the overlays without a keyboard.
//
// Playwright's phone emulation reports a coarse pointer, which is what
// src/input/touchControls.js keys off, so the overlay builds itself.

import { test, expect, devices } from '@playwright/test';

// Chromium runs the rest of the suite (and is the only engine CI installs),
// so borrow the phone's metrics but drop its default WebKit engine, letting
// the config's default browser stand.
const PHONE = { ...devices['iPhone 13'] };
delete PHONE.defaultBrowserType;

/** Press the thumb onto the pad and drag it to (dx, dy) from centre, holding. */
async function holdPad(page, dx, dy) {
  const box = await page.locator('#touch-pad').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps: 4 });
}

async function bootToWorld(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(() => {
    window.__state.flags.prologueDone = true;
    window.__state.flags.timeskipShown = true;
  });
  // Portrait letterboxes the canvas, so a tap well below it must still start
  // the game — that is where a thumb naturally lands.
  const vp = page.viewportSize();
  await page.touchscreen.tap(vp.width / 2, vp.height - 40);
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
  await page.waitForTimeout(700); // camera fade-in
}

test.describe('on a phone', () => {
  test.use(PHONE);

  test('a phone gets on-screen controls, hidden behind the title menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));

    await expect(page.locator('#touch-controls')).toHaveCount(1);
    await expect(page.locator('#touch-pad')).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/has-touch-controls/);

    await bootToWorld(page);

    await expect(page.locator('#touch-pad')).toBeVisible();
    await expect(page.getByLabel('action')).toBeVisible();
    for (const name of ['inventory', 'objective', 'mute']) {
      await expect(page.getByLabel(name)).toBeVisible();
    }
    // Top-aligned canvas, so the pad owns the lower letterbox band
    await expect(page.locator('body')).toHaveClass(/has-touch-controls/);
  });

  test('the pad walks the player, and releasing it stops them', async ({ page }) => {
    await bootToWorld(page);
    const start = await page.evaluate(() => ({
      x: window.__game.scene.getScene('WorldScene').player.x,
      y: window.__game.scene.getScene('WorldScene').player.y,
    }));

    await holdPad(page, 45, 0); // due right
    await page.waitForTimeout(500);
    const moving = await page.evaluate(() => ({
      x: window.__game.scene.getScene('WorldScene').player.x,
      y: window.__game.scene.getScene('WorldScene').player.y,
      anim: window.__game.scene.getScene('WorldScene').player.anims.currentAnim.key,
    }));
    expect(moving.x).toBeGreaterThan(start.x + 8);
    expect(Math.abs(moving.y - start.y)).toBeLessThan(2);
    expect(moving.anim).toBe('frodo-walk-right');

    await page.mouse.up();
    await page.waitForTimeout(200);
    const stopped = await page.evaluate(() => ({
      x: window.__game.scene.getScene('WorldScene').player.x,
      anim: window.__game.scene.getScene('WorldScene').player.anims.currentAnim.key,
    }));
    await page.waitForTimeout(300);
    const still = await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.x);
    expect(still).toBeCloseTo(stopped.x, 1);
    expect(stopped.anim).toBe('frodo-idle-right');
  });

  test('a diagonal pull moves on both axes', async ({ page }) => {
    await bootToWorld(page);
    const start = await page.evaluate(() => ({
      x: window.__game.scene.getScene('WorldScene').player.x,
      y: window.__game.scene.getScene('WorldScene').player.y,
    }));

    await holdPad(page, 40, 40); // down-right
    await page.waitForTimeout(500);
    const moved = await page.evaluate(() => ({
      x: window.__game.scene.getScene('WorldScene').player.x,
      y: window.__game.scene.getScene('WorldScene').player.y,
    }));
    await page.mouse.up();

    expect(moved.x).toBeGreaterThan(start.x + 4);
    expect(moved.y).toBeGreaterThan(start.y + 4);
  });

  test('the action button talks to an NPC and advances the dialogue', async ({ page }) => {
    await bootToWorld(page);
    // Stand beside Gandalf (19,8), who waits by the gate after the time skip
    await page.evaluate(() => {
      window.__game.scene.getScene('WorldScene').player.setPosition(19 * 16 + 8, 7 * 16 + 8);
    });
    await page.waitForTimeout(120);

    await page.getByLabel('action').tap();
    await expect
      .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive))
      .toBe(true);

    // Tapping through the lines eventually closes the box and sets the flag
    await expect
      .poll(
        async () => {
          const done = await page.evaluate(() => !!window.__state.flags.metGandalf);
          if (!done) await page.getByLabel('action').tap();
          return done;
        },
        { timeout: 20_000 },
      )
      .toBe(true);
    // Prompts name the on-screen button, not a key nobody has
    expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').actionVerb())).toBe(
      'TAP A',
    );
  });

  test('the corner buttons open the inventory, recall the objective, and mute', async ({
    page,
  }) => {
    await bootToWorld(page);

    await page.getByLabel('inventory').tap();
    await expect
      .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').overlayVisible))
      .toBe(true);
    await page.getByLabel('inventory').tap();
    await expect
      .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').overlayVisible))
      .toBe(false);

    await page.getByLabel('objective').tap();
    await expect
      .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').banner.text))
      .toMatch(/Gandalf/);

    await page.getByLabel('mute').tap();
    await expect
      .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').banner.text))
      .toBe('Sound off');
    await page.getByLabel('mute').tap();
    await expect
      .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').banner.text))
      .toBe('Sound on');
  });

  test('the pad survives a zone change', async ({ page }) => {
    await bootToWorld(page);
    await page.evaluate(() => {
      window.__game.scene.getScene('WorldScene').goToZone('bagend', 'default');
    });
    await page.waitForFunction(
      () => window.__game.scene.getScene('WorldScene').zone?.key === 'bagend',
    );
    await page.waitForTimeout(700);

    await expect(page.locator('#touch-pad')).toBeVisible();
    // Bag End's interior walls may block a step, so assert the input
    // reached the scene rather than a particular displacement.
    await holdPad(page, -45, 0);
    await page.waitForTimeout(300);
    const walking = await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return { anim: s.player.anims.currentAnim.key, dir: s.lastDir };
    });
    await page.mouse.up();
    expect(walking.dir).toBe('left');
    expect(walking.anim).toBe('frodo-walk-left');
  });
});

test.describe('on a desktop browser', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('no touch UI is injected', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
    await page.waitForTimeout(300);
    await expect(page.locator('#touch-pad')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveClass(/has-touch-controls/);
  });
});

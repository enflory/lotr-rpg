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

/** Plant a checkpoint so the title screen offers CONTINUE / NEW GAME. */
async function seedSave(page) {
  await page.evaluate(() =>
    localStorage.setItem(
      'lotr-rpg.save.v1',
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        zone: 'marish',
        entry: 'west',
        flags: { prologueDone: true, timeskipShown: true, metGandalf: true, samJoined: true },
        follower: 'sam',
        objective: 'Reach the Ferry',
        items: {},
        collected: {},
      }),
    ),
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.waitForTimeout(250);
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

    // Tapping through the lines eventually closes the box and sets the flag.
    // Gandalf's is the longest conversation in the game — the Ring, the errand
    // and his farewell are deliberately one scene — so this polls on a fixed
    // interval rather than letting it escalate to a second between taps.
    await expect
      .poll(
        async () => {
          const done = await page.evaluate(() => !!window.__state.flags.metGandalf);
          if (!done) await page.getByLabel('action').tap();
          return done;
        },
        { timeout: 30_000, intervals: [100] },
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

  test('canvas pointer mapping is correct immediately after a layout shift', async ({ page }) => {
    // Showing/hiding the pad re-aligns the canvas with CSS, which fires neither
    // resize nor scroll. Phaser's ScaleManager re-polls its bounds only every
    // ~500ms, so without an explicit nudge every tap in that window maps to the
    // wrong world position — long enough to swallow a real tap. Assert with no
    // settling time, which is the state a user actually taps into.
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
    const m = await page.evaluate(() => {
      const c = document.querySelector('canvas').getBoundingClientRect();
      const b = window.__game.scale.canvasBounds;
      return {
        real: [Math.round(c.x), Math.round(c.y), Math.round(c.width), Math.round(c.height)],
        cached: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
      };
    });
    expect(m.cached).toEqual(m.real);
  });

  test('the NEW GAME target hugs its label and clears the save', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
    await seedSave(page);

    // The zone WIPES THE SAVE, so it must not reach any neighbouring line —
    // a stray tap has to land on "continue", never on "discard".
    const layout = await page.evaluate(() => {
      const s = window.__game.scene.getScene('TitleScene');
      const zone = s.newGameArea;
      const others = s.children.list
        .filter((o) => o.type === 'Text')
        .map((o) => {
          const b = o.getBounds();
          return { text: o.text.split('\n')[0], top: b.top, bottom: b.bottom };
        });
      return { zone: { top: zone.y, bottom: zone.y + zone.height }, others };
    });
    const label = layout.others.find((o) => o.text.includes('NEW GAME'));
    expect(label).toBeTruthy();
    for (const o of layout.others) {
      if (o === label) continue;
      const overlaps = o.bottom > layout.zone.top && o.top < layout.zone.bottom;
      expect(overlaps, `"${o.text}" must not fall inside the NEW GAME target`).toBe(false);
    }

    // The label itself still starts a fresh game (canvas text, so tap by
    // coordinate — the DOM knows nothing about it).
    const box = await page.locator('canvas').boundingBox();
    const scale = box.width / 960;
    await page.touchscreen.tap(
      box.x + box.width / 2,
      box.y + ((label.top + label.bottom) / 2) * scale,
    );
    await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
    const after = await page.evaluate(() => localStorage.getItem('lotr-rpg.save.v1'));
    expect(after ?? '').not.toContain('"zone":"marish"');
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

  test('clicking the CONTINUE prompt continues — it never wipes the save', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
    await seedSave(page);

    // Click the very bottom edge of "ENTER ~ CONTINUE" — the pixels closest to
    // the NEW GAME label, and the ones a too-generous hit target would steal.
    const box = await page.locator('canvas').boundingBox();
    const scale = box.width / 960;
    const y = await page.evaluate(() => {
      const s = window.__game.scene.getScene('TitleScene');
      const t = s.children.list.find((o) => o.type === 'Text' && o.text.includes('CONTINUE'));
      return t.getBounds().bottom - 2;
    });
    await page.mouse.click(box.x + box.width / 2, box.y + y * scale);

    await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
    // Continued into the saved zone, and the save is intact
    expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').zoneKey)).toBe(
      'marish',
    );
    expect(await page.evaluate(() => localStorage.getItem('lotr-rpg.save.v1'))).toContain(
      '"zone":"marish"',
    );
  });

  test('the desktop title screen shows no touch wording', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
    const labels = await page.evaluate(() =>
      window.__game.scene
        .getScene('TitleScene')
        .children.list.filter((o) => o.type === 'Text')
        .map((o) => o.text),
    );
    expect(labels).toContain('PRESS ENTER');
    expect(labels).toContain('ARROWS move   SPACE talk   Q objective   M sound');
    expect(labels.join(' ')).not.toMatch(/TAP|PAD move/);
  });
});

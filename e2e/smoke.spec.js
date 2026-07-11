// Boot-to-gameplay smoke test, driven through the QA hooks exposed on
// window (__game = Phaser game, __state = GameState).
//
// Key presses are held ≥40ms: a keydown+keyup pair shorter than one
// frame is invisible to Phaser's per-frame keyboard polling.

import { test, expect } from '@playwright/test';

async function press(page, key, hold = 60) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function startGame(page, { skipPrologue = true } = {}) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  if (skipPrologue) {
    // Jump straight to the main story (TitleScene checks this flag)
    await page.evaluate(() => {
      window.__state.flags.prologueDone = true;
      window.__state.flags.timeskipShown = true;
    });
  }
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
}

test('boots through the title screen into the Shire', async ({ page }) => {
  await startGame(page);

  const world = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    return {
      zone: scene.zone.key,
      playerExists: !!scene.player,
      objective: window.__state.objective,
    };
  });
  expect(world.zone).toBe('shire');
  expect(world.playerExists).toBe(true);
  expect(world.objective).toMatch(/Gandalf/);
});

test("prologue: Bilbo's farewell party opens the game", async ({ page }) => {
  await startGame(page, { skipPrologue: false });

  const opening = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    return {
      objective: window.__state.objective,
      tileX: Math.floor(scene.player.x / 16),
    };
  });
  expect(opening.objective).toMatch(/Bilbo/);
  expect(opening.tileX).toBeLessThan(10); // spawned in the Party Field, not Bag End

  // Stand just below Bilbo (4,25) and talk through the speech
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    scene.player.setPosition(4 * 16 + 8, 26 * 16 + 8);
  });
  await press(page, ' ');
  await expect
    .poll(
      async () => {
        const done = await page.evaluate(() => !!window.__state.flags.bilboFarewell);
        if (!done) await press(page, ' ');
        return done;
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  // Flash → vanish → time skip → zone restart at the default spawn
  await page.waitForFunction(() => window.__state.flags.prologueDone, null, { timeout: 15_000 });
  await expect
    .poll(() => page.evaluate(() => window.__state.objective), { timeout: 10_000 })
    .toMatch(/Gandalf/);
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const scene = window.__game.scene.getScene('WorldScene');
          return Math.floor(scene.player.x / 16);
        }),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(15); // back at Bag End's default spawn (20,7)
});

test('talking to Gandalf reveals the Ring and sets the story flag', async ({ page }) => {
  await startGame(page);

  // Teleport next to Gandalf (tile 19,8 in the Shire)
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    scene.player.setPosition(19 * 16 + 8, 9 * 16 + 8);
  });

  // SPACE opens the dialogue, then completes/advances each typewritten
  // line; keep pressing until the stage closes and the flag lands.
  await press(page, ' ');
  await expect
    .poll(
      async () => {
        const done = await page.evaluate(() => {
          const scene = window.__game.scene.getScene('WorldScene');
          return !scene.dialogActive && !!window.__state.flags.metGandalf;
        });
        if (!done) await press(page, ' ', 60);
        return done;
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  const state = await page.evaluate(() => ({
    flags: window.__state.flags,
    objective: window.__state.objective,
  }));
  expect(state.flags.metGandalf).toBe(true);
  expect(state.objective).toMatch(/Sam/);
});

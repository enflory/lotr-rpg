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

  // Stand on Bilbo and talk through the speech. His spot in the Party Field
  // is read from the scene rather than written down here, so dressing the
  // field differently never silently breaks the prologue test.
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    const bilbo = scene.npcs.find((n) => n.getData('key') === 'bilbo');
    scene.player.setPosition(bilbo.x, bilbo.y + 10);
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

test('the marish: maggot, the waggon ride, and the ferry crossing', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  // An older Sam-only checkpoint should now restore both Sam and Pippin.
  await page.evaluate(() => {
    Object.assign(window.__state.flags, {
      prologueDone: true,
      timeskipShown: true,
      metGandalf: true,
      samJoined: true,
      escapedRider: true,
      metGildor: true,
    });
    window.__state.follower = 'sam';
  });
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
  await page.evaluate(() => {
    window.__game.scene.getScene('WorldScene').goToZone('marish', 'west');
  });
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').zone?.key === 'marish',
  );

  // Talk to Maggot at his gate → waggon offer (sets maggotRide)
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    scene.player.setPosition(24 * 16 + 8, 15 * 16 + 8); // in the gateway above him (Maggot now at (24,16))
  });
  await press(page, ' ');
  await expect
    .poll(
      async () => {
        const done = await page.evaluate(() => !!window.__state.flags.maggotRide);
        if (!done) await press(page, ' ');
        return done;
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  // Maggot drives them down through the night fog, halts on the road, and
  // sets them down at the lamplit landing where Merry is waiting.
  await page.waitForFunction(() => window.__state.flags.rodeWaggon, null, { timeout: 45_000 });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene = window.__game.scene.getScene('WorldScene');
        return Math.floor(scene.player.x / 16);
      }),
    )
    .toBe(42); // PIER_X-4

  // Talk to Merry (44,14) → raft ready (sets merryMet)
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    scene.player.setPosition(44 * 16 + 8, 15 * 16 + 8); // Merry at (44,14)
  });
  await press(page, ' ');
  await expect
    .poll(
      async () => {
        const done = await page.evaluate(() => !!window.__state.flags.merryMet);
        if (!done) await press(page, ' ');
        return done;
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  // Walk east onto the pier — the crossing runs itself from there
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(
    () => {
      const scene = window.__game.scene.getScene('WorldScene');
      return Math.floor(scene.player.x / 16) >= 46 || scene.inputLocked; // PIER_X
    },
    null,
    { timeout: 10_000 },
  );
  await page.keyboard.up('ArrowRight');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').ferryEvent?.phase === 'crossing',
  );
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.ferryEvent.crew.map(({ sprite }) =>
        sprite === s.player ? 'frodo' : sprite.getData('key'),
      );
    }),
  ).toEqual(['frodo', 'sam', 'pippin', 'merry']);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const s = window.__game.scene.getScene('WorldScene');
        return s.followers.every((p) => p.anims.currentAnim.key.includes('-idle-'));
      }),
    )
    .toBe(true);
  await page.waitForFunction(() => window.__state.flags.crossedFerry, null, { timeout: 15_000 });

  const end = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    return {
      objective: window.__state.objective,
      tileX: Math.floor(scene.player.x / 16),
      bodyEnabled: scene.player.body.enable,
    };
  });
  expect(end.objective).toMatch(/Crickhollow/);
  expect(end.tileX).toBeGreaterThanOrEqual(52); // the Buckland shore BANK_LAND_X
  expect(end.bodyEnabled).toBe(true);
  // A conversation after landing must preserve the eastern checkpoint.
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    s.startDialogue('merry');
    s.closeDialogue();
  });
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('lotr-rpg.save.v1')).entry),
  ).toBe('buckland');
  expect(
    await page.evaluate(async () => {
      const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
      const s = window.__game.scene.getScene('WorldScene');
      return s.followers.map((p) => ({
        key: p.getData('key'),
        onLand:
          p.x >= 52 * 16 &&
          !COLLISION_TILES.includes(s.zone.map[Math.floor((p.y + 8) / 16)]?.[Math.floor(p.x / 16)]),
      }));
    }),
  ).toEqual([
    { key: 'sam', onLand: true },
    { key: 'pippin', onLand: true },
  ]);
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

test('exploration: pickups collect and the overlay tallies them', async ({ page }) => {
  await startGame(page);
  // Walk onto the mathom hidden in the cornfield (shire_mathom_3 at tile 37,4)
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    scene.player.setPosition(37 * 16 + 8, 4 * 16 + 8);
  });
  await page.waitForFunction(() => (window.__state.items.mathom || 0) >= 1, null, {
    timeout: 5_000,
  });
  await press(page, 'i');
  const overlay = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    return { visible: scene.overlayVisible, text: scene.overlayText.text };
  });
  expect(overlay.visible).toBe(true);
  expect(overlay.text).toMatch(/Mathom/);
  expect(overlay.text).toMatch(/Mathoms 1\/6/);
});

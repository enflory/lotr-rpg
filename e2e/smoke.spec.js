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
      { timeout: 30_000, intervals: [100] },
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

  // Watch the actual Merry sprite across its entrance and NPC handoff. The
  // walking actor and static NPC must share a continuous, walkable route.
  await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const scene = window.__game.scene.getScene('WorldScene');
    window.__merryMotion = { samples: 0, blocked: false, jumped: false, handedOff: false };
    let previous = null;
    const tick = (now) => {
      if (scene.zoneKey !== 'marish') return;
      const merry = scene.children.list.find((p) => p.texture?.key === 'merry' && p.alpha > 0);
      if (merry) {
        const motion = window.__merryMotion;
        motion.samples++;
        const tile = scene.zone.map[Math.floor((merry.y + 8) / 16)]?.[Math.floor(merry.x / 16)];
        motion.blocked ||= tile == null || COLLISION_TILES.includes(tile);
        if (previous) {
          const distance = Math.hypot(merry.x - previous.x, merry.y - previous.y);
          motion.jumped ||= distance > 2 + ((now - previous.time) * 80) / 1000;
        }
        previous = { x: merry.x, y: merry.y, time: now };
        if (scene.npcs.includes(merry)) {
          motion.handedOff = true;
          return;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

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
      { timeout: 30_000, intervals: [100] },
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

  await page.waitForFunction(() => window.__merryMotion.handedOff);
  const merryMotion = await page.evaluate(() => window.__merryMotion);
  expect(merryMotion.samples).toBeGreaterThan(10);
  expect.soft(merryMotion.blocked, 'Merry must stay on walkable ground').toBe(false);
  expect.soft(merryMotion.jumped, 'Merry must not jump at the NPC handoff').toBe(false);

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
      { timeout: 30_000, intervals: [100] },
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
      { timeout: 30_000, intervals: [100] },
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

test('the fox crosses a roomy hollow without touching the resting party', async ({ page }) => {
  await startGame(page);
  await page.evaluate(() => {
    Object.assign(window.__state.flags, {
      metGandalf: true,
      samJoined: true,
      pippinJoined: true,
      escapedRider: true,
      walkingSong: true,
    });
    window.__state.follower = 'sam';
    window.__game.scene.getScene('WorldScene').goToZone('woodyend', 'west');
  });
  await page.waitForFunction(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    return scene.zoneKey === 'woodyend' && !scene.transitioning;
  });
  await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const { FOX_REST } = await import('/src/data/zones/woodyend.js');
    const scene = window.__game.scene.getScene('WorldScene');
    // Walk in from the north entrance with the actual trailing companions.
    scene.player.setPosition(FOX_REST.x * 16 + 8, (FOX_REST.y - 2) * 16);
    scene.lastDir = 'down';
    scene.snapFollower();
    window.__foxMotion = {
      samples: 0,
      overlap: false,
      blocked: false,
      jumped: false,
      movedParty: false,
    };
    let previous = null;
    let resting = null;
    const tick = (now) => {
      const ev = scene.foxEvent;
      if (ev?.phase === 'done') return;
      if (ev) {
        const fox = ev.fox;
        const motion = window.__foxMotion;
        const party = [scene.player, ...scene.followers];
        motion.samples++;
        motion.overlap ||= party.some(
          (hobbit) => Math.abs(hobbit.x - fox.x) < 16 && Math.abs(hobbit.y - fox.y) < 24,
        );
        const tile = scene.zone.map[Math.floor((fox.y + 8) / 16)]?.[Math.floor(fox.x / 16)];
        motion.blocked ||= tile == null || COLLISION_TILES.includes(tile);
        if (previous) {
          motion.jumped ||=
            Math.hypot(fox.x - previous.x, fox.y - previous.y) >
            2 + ((now - previous.time) * 60) / 1000;
        }
        if (resting) {
          motion.movedParty ||= party.some(
            (hobbit, i) => Math.hypot(hobbit.x - resting[i].x, hobbit.y - resting[i].y) > 2,
          );
        }
        resting ??= party.map(({ x, y }) => ({ x, y }));
        previous = { x: fox.x, y: fox.y, time: now };
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  // Keep Down held across the approach and dialogue: it must not walk Frodo
  // into the crossing while the fox is moving.
  await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').dialogActive);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').followers.length),
  ).toBe(2);
  expect(
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldScene');
      const camera = scene.cameras.main;
      const fox = scene.foxEvent.fox;
      const bottom = camera.matrix.transformPoint(
        fox.x - camera.scrollX,
        fox.y + fox.displayHeight / 2 - camera.scrollY,
      ).y;
      const panelTop = camera.matrix.transformPoint(
        scene.dialogBg.x,
        scene.dialogBg.y - scene.dialogBg.height / 2,
      ).y;
      return panelTop - bottom;
    }),
  ).toBeGreaterThan(0);
  await expect
    .poll(
      async () => {
        const scene = await page.evaluate(() => {
          const s = window.__game.scene.getScene('WorldScene');
          return { phase: s.foxEvent?.phase, dialogue: s.dialogActive };
        });
        if (scene.dialogue) await press(page, ' ');
        return scene.phase;
      },
      { timeout: 15_000, intervals: [100] },
    )
    .toBe('done');
  await page.keyboard.up('ArrowDown');
  const result = await page.evaluate(() => ({
    ...window.__foxMotion,
    locked: window.__game.scene.getScene('WorldScene').inputLocked,
  }));
  expect(result.samples).toBeGreaterThan(10);
  expect(result).toMatchObject({
    overlap: false,
    blocked: false,
    jumped: false,
    movedParty: false,
    locked: false,
  });
  const before = await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.x);
  await press(page, 'ArrowRight', 250);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.x),
  ).toBeGreaterThan(before + 5);
});

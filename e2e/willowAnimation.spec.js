import { test, expect } from '@playwright/test';

async function press(page) {
  await page.keyboard.down('Space');
  await page.waitForTimeout(55);
  await page.keyboard.up('Space');
}
async function boot(page, flags = {}) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate((flags) => {
    localStorage.setItem(
      'lotr-rpg.save.v1',
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        zone: 'withywindle',
        entry: 'willow',
        follower: 'sam',
        objective: 'Explore the river',
        items: {},
        collected: {},
        flags: {
          prologueDone: true,
          samJoined: true,
          pippinJoined: true,
          merryJoined: true,
          chapter2: true,
          ...flags,
        },
      }),
    );
  }, flags);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Enter', { delay: 60 });
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
}
async function settle(page) {
  await page.waitForFunction(
    () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
    null,
    { timeout: 45000 },
  );
}
async function finish(page) {
  for (let n = 0; n < 35; n++) {
    await settle(page);
    if (!(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)))
      return;
    await press(page);
  }
  throw new Error('The Willow scene did not finish');
}
async function interact(page, key, x, y) {
  await page.evaluate(
    ({ x, y }) => window.__game.scene.getScene('WorldScene').player.setPosition(x * 16 + 8, y * 16),
    { x, y },
  );
  await press(page);
  await page.waitForFunction(
    (key) => window.__game.scene.getScene('WorldScene').dialogKey === key,
    key,
  );
}
// Observe actual sprites once per rendered frame. Use elapsed time: the software
// renderer can skip frames, but a teleport still produces an impossible speed.
async function observe(page) {
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    window.__willowMotion = { maxSpeed: 0, maxGap: 0, moved: {}, samples: 0 };
    const sprites = [s.player, ...s.followers];
    let previous = null,
      lastTime = 0;
    const sample = () => {
      if (!window.__willowMotion) return;
      const now = performance.now(),
        dt = now - lastTime;
      const next = sprites.map((p) => ({ x: p.x, y: p.y }));
      if (previous && dt > 0) {
        window.__willowMotion.maxGap = Math.max(window.__willowMotion.maxGap, dt);
        next.forEach((p, i) => {
          const d = Math.hypot(p.x - previous[i].x, p.y - previous[i].y);
          const speed = (d * 1000) / dt,
            key = sprites[i].getData('key') || 'frodo';
          if (speed > window.__willowMotion.maxSpeed) {
            window.__willowMotion.maxSpeed = speed;
            window.__willowMotion.fastest = {
              key,
              from: previous[i],
              to: p,
              dt,
              phase: s.dialogIndex,
            };
          }
          window.__willowMotion.moved[key] = (window.__willowMotion.moved[key] || 0) + d;
        });
      }
      window.__willowMotion.samples++;
      previous = next;
      lastTime = now;
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

test('capture moves the actual hobbits and waits for the player to help Sam', async ({ page }) => {
  await boot(page);
  await observe(page);
  await settle(page);
  await press(page);
  await press(page);
  await page.waitForFunction(() =>
    window.__game.scene.getScene('WorldScene').storyBeat?.prompt?.includes('Pull'),
  );
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.actionHint.visible && s.actionHint.depth > s.dialogBg.depth;
    }),
  ).toBe(true);
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => !!window.__state.flags.willowTrapped)).toBe(false);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.y),
  ).toBeGreaterThan(27 * 16);
  await finish(page);
  expect(await page.evaluate(() => window.__state.flags.willowTrapped)).toBe(true);
  const motion = await page.evaluate(() => window.__willowMotion);
  expect(motion.maxSpeed, JSON.stringify(motion.fastest)).toBeLessThan(160);
  expect(motion.moved.frodo).toBeGreaterThan(40);
  expect(motion.moved.merry).toBeGreaterThan(30);
  expect(motion.moved.pippin).toBeGreaterThan(30);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.body.enable),
  ).toBe(true);
});

test('fire, Tom arrival and rescue animate continuously and release normal movement', async ({
  page,
}) => {
  test.setTimeout(150000);
  await boot(page, { willowTrapped: true });
  await interact(page, 'willow_trunk', 48, 21);
  await finish(page);
  expect(await page.evaluate(() => window.__state.flags.willowFireFailed)).toBe(true);
  await interact(page, 'willow_help', 29, 20);
  await finish(page);
  expect(await page.evaluate(() => window.__state.flags.tomArrived)).toBe(true);
  await interact(page, 'willow_tom', 46, 21);
  await observe(page);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene'),
      tom = s.journey.willow.tom;
    window.__tomBounce = 0;
    window.__stallApplied = false;
    // A delayed frame must not be mistaken for a character teleport.
    const pauseDuringGather = () => {
      if (s.dialogIndex === 2 && s.storyBeat?.busy) {
        setTimeout(() => {
          window.__stallApplied = true;
          const until = performance.now() + 350;
          while (performance.now() < until) {
            /* Simulate a busy rendering thread. */
          }
        }, 1200);
        return;
      }
      requestAnimationFrame(pauseDuringGather);
    };
    requestAnimationFrame(pauseDuringGather);
    const sample = () => {
      if (!tom.active) return;
      window.__tomBounce = Math.max(window.__tomBounce, Math.abs(tom.angle));
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await finish(page);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__state.flags.willowFreed)).toBe(true);
  const motion = await page.evaluate(() => window.__willowMotion);
  expect(motion.maxSpeed, JSON.stringify(motion.fastest)).toBeLessThan(160);
  expect(motion.moved.merry).toBeGreaterThan(30);
  expect(motion.moved.pippin).toBeGreaterThan(30);
  expect(
    await page.evaluate(() =>
      window.__game.scene
        .getScene('WorldScene')
        .followers.every((p) => p.visible && !p.getData('held') && p.angle === 0 && !p.isCropped),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => window.__tomBounce)).toBeGreaterThan(1);
  expect(await page.evaluate(() => window.__stallApplied)).toBe(true);
  expect(motion.maxGap).toBeGreaterThan(300);
  await page.waitForFunction(
    () => !window.__game.scene.getScene('WorldScene').journey.willow.tom.visible,
    null,
    { timeout: 20000 },
  );
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').journey.willow.tom.x),
  ).toBeGreaterThan(78 * 16);
  const before = await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.x);
  await page.keyboard.press('ArrowRight', { delay: 500 });
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.x),
  ).toBeGreaterThan(before + 10);
});

test('Continue during capture safely retries the encounter without a stuck input lock', async ({
  page,
}) => {
  await boot(page);
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').storyBeat?.busy);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Enter', { delay: 60 });
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
  await finish(page);
  expect(await page.evaluate(() => window.__state.flags.willowTrapped)).toBe(true);
  expect(await page.evaluate(() => !!window.__game.scene.getScene('WorldScene').storyBeat)).toBe(
    false,
  );
});

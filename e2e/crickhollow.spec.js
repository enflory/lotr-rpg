import { test, expect } from '@playwright/test';
async function press(page, key = 'Space') {
  await page.keyboard.press(key, { delay: 60 });
}
async function boot(page, zone = 'crickhollowhouse', flags = {}) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(
    ({ zone, flags }) => {
      localStorage.setItem(
        'lotr-rpg.save.v1',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          zone,
          entry: 'default',
          follower: 'sam',
          objective: 'Supper at Crickhollow',
          items: {},
          collected: {},
          flags: { prologueDone: true, samJoined: true, pippinJoined: true, ...flags },
        }),
      );
    },
    { zone, flags },
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
}
async function finish(page) {
  for (let i = 0; i < 30; i++) {
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
      null,
      { timeout: 30000 },
    );
    if (!(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)))
      return;
    await press(page);
  }
  throw new Error('Supper did not finish');
}
async function ready(page) {
  await page.waitForFunction(
    () => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.zoneKey === 'crickhollow' && window.__state.flags.crickhollowReady && !s.storyBeat;
    },
    null,
    { timeout: 35000 },
  );
}
test('all five hobbits share supper before a continuous night-to-morning departure', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page);
  await page.evaluate(() =>
    window.__game.scene.getScene('WorldScene').player.setPosition(12 * 16 + 8, 12 * 16),
  );
  await press(page);
  await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy);
  const seated = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene'),
      h = s.journey.home;
    return [s.player, ...s.followers, h.merry, h.fatty].map((p) => ({
      key: p.getData('key') || 'frodo',
      visible: p.visible,
      x: p.x,
      y: p.y,
    }));
  });
  expect(seated.map((p) => p.key).sort()).toEqual(['fatty', 'frodo', 'merry', 'pippin', 'sam']);
  expect(
    seated.every(
      (p) => p.visible && p.x >= 10 * 16 && p.x <= 17 * 16 && p.y >= 8 * 16 && p.y <= 12 * 16,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => !!window.__state.flags.chapter2)).toBe(false);
  await page.evaluate(() => {
    window.__departureOpacity = 1;
    const sample = () => {
      const s = window.__game.scene.getScene('WorldScene');
      if (s.zoneKey !== 'crickhollowhouse') return;
      if (!s.dialogActive)
        window.__departureOpacity = Math.min(window.__departureOpacity, s.player.alpha);
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await finish(page);
  await ready(page);
  expect(await page.evaluate(() => window.__departureOpacity)).toBeLessThan(0.3);
  expect(await page.evaluate(() => window.__state.flags.crickhollowSupper)).toBe(true);
  expect(
    await page.evaluate(() =>
      window.__game.scene
        .getScene('WorldScene')
        .followers.every((p) => p.visible && !p.getData('held') && p.alpha === 1),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.body.enable),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test('Continue during the overnight cutscene reaches the morning gathering safely', async ({
  page,
}) => {
  await boot(page, 'crickhollowhouse', { crickhollowSupper: true });
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').storyBeat?.busy);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await ready(page);
  await press(page, 'ArrowDown');
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.body.enable),
  ).toBe(true);
});
test('existing chapter-two saves do not replay dinner or duplicate Merry', async ({ page }) => {
  await boot(page, 'crickhollowhouse', { chapter2: true, merryJoined: true });
  expect(await page.evaluate(() => !!window.__game.scene.getScene('WorldScene').storyBeat)).toBe(
    false,
  );
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.children.list.filter((p) => p.texture?.key === 'merry' && p.visible).length;
    }),
  ).toBe(1);
});

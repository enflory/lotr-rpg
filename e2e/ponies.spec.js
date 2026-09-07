import { test, expect } from '@playwright/test';
test('five ponies leave the garden, follow around a bend, and continue through the hedge tunnel', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(() =>
    localStorage.setItem(
      'lotr-rpg.save.v1',
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        zone: 'crickhollow',
        entry: 'morning',
        follower: 'sam',
        objective: 'Leave for the forest',
        items: {},
        collected: {},
        flags: {
          prologueDone: true,
          samJoined: true,
          pippinJoined: true,
          merryJoined: true,
          chapter2: true,
          crickhollowReady: true,
          crickhollowMorning: true,
        },
      }),
    ),
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.keyboard.press('Enter', { delay: 60 });
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
  await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const s = window.__game.scene.getScene('WorldScene'),
      ps = s.journey.ponies;
    window.__ponyMotion = { maxStep: 0, moved: ps.map(() => 0), blocked: false };
    let prev = ps.map((p) => ({ x: p.x, y: p.y }));
    const tick = () => {
      if (!ps[0].active) return;
      ps.forEach((p, i) => {
        const d = Math.hypot(p.x - prev[i].x, p.y - prev[i].y);
        window.__ponyMotion.maxStep = Math.max(window.__ponyMotion.maxStep, d);
        window.__ponyMotion.moved[i] += d;
        if (
          COLLISION_TILES.includes(s.zone.map[Math.floor((p.y + 8) / 16)]?.[Math.floor(p.x / 16)])
        )
          window.__ponyMotion.blocked = true;
        prev[i] = { x: p.x, y: p.y };
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.keyboard.press('ArrowDown', { delay: 2100 });
  await page.keyboard.press('ArrowRight', { delay: 2400 });
  await page.waitForTimeout(4500);
  const motion = await page.evaluate(() => window.__ponyMotion);
  expect(motion.blocked).toBe(false);
  expect(motion.maxStep).toBeLessThan(8);
  expect(motion.moved.every((d) => d > 35)).toBe(true);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').journey.ponies.length),
  ).toBe(5);
  await page.evaluate(() =>
    window.__game.scene.getScene('WorldScene').player.setPosition(38 * 16, 20 * 16),
  );
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').zoneKey === 'hedgetunnel',
  );
  await page.keyboard.up('ArrowRight');
  await page.keyboard.press('ArrowRight', { delay: 2200 });
  await page.waitForTimeout(3000);
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return (
        s.journey.ponies.every((p) => p.visible && p.x < s.player.x) &&
        s.journey.ponies.some((p) => p.x > 0)
      );
    }),
  ).toBe(true);
});

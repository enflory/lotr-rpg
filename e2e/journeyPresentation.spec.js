import { test, expect } from '@playwright/test';

async function press(page, key = 'Space') {
  await page.keyboard.down(key);
  await page.waitForTimeout(60);
  await page.keyboard.up(key);
}
async function seed(page, zone, entry, extra = {}) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(
    ({ zone, entry, extra }) =>
      localStorage.setItem(
        'lotr-rpg.save.v1',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          zone,
          entry,
          follower: 'sam',
          objective: 'Journey onwards',
          items: {},
          collected: {},
          flags: {
            prologueDone: true,
            samJoined: true,
            pippinJoined: true,
            merryJoined: true,
            chapter2: true,
            ...extra,
          },
        }),
      ),
    { zone, entry, extra },
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
}
async function close(page) {
  for (let i = 0; i < 20; i++) {
    if (!(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)))
      return;
    await press(page);
  }
}
test('Frodo remains transparent during the Ring page and returns to normal afterwards', async ({
  page,
}) => {
  await seed(page, 'tomhouse', 'default', {
    houseWelcomed: true,
    houseSupper: true,
    houseNightOne: true,
    houseStories: true,
  });
  await page.evaluate(() =>
    window.__game.scene.getScene('WorldScene').player.setPosition(14 * 16 + 8, 6 * 16),
  );
  await press(page);
  await press(page);
  await press(page);
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').dialogIndex === 1);
  await page.waitForTimeout(250);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.alpha),
  ).toBeLessThan(0.5);
  await close(page);
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.alpha)).toBe(
    1,
  );
});
test('the closed iron gate blocks walking until Merry opens it', async ({ page }) => {
  await seed(page, 'hedgetunnel', 'west');
  await page.evaluate(() =>
    window.__game.scene.getScene('WorldScene').player.setPosition(27 * 16 + 8, 9 * 16),
  );
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.x),
  ).toBeLessThan(28 * 16);
  await press(page);
  await close(page);
  expect(await page.evaluate(() => window.__state.flags.hedgeEntered)).toBe(true);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').zoneKey === 'forestgate',
    null,
    { timeout: 6000 },
  );
  await page.keyboard.up('ArrowRight');
});

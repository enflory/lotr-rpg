import { test, expect } from '@playwright/test';
const press = (page, key = 'Space') => page.keyboard.press(key, { delay: 60 });
async function boot(page, flags = {}) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(
    (flags) =>
      localStorage.setItem(
        'lotr-rpg.save.v1',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          zone: 'tomhouse',
          entry: 'default',
          follower: 'sam',
          objective: 'Show Tom the Ring by the hearth',
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
      ),
    flags,
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
}
const settle = (page) =>
  page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy, null, {
    timeout: 45000,
  });
async function finish(page) {
  for (let n = 0; n < 24; n++) {
    await settle(page);
    if (!(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)))
      return;
    await press(page);
  }
  throw Error('House scene did not complete');
}
async function cues(page) {
  return page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return s.zone.interactions
      .filter((p) => !p.when || p.when(window.__state.flags))
      .map((p) => p.dialogue);
  });
}
async function act(page, key) {
  expect(await cues(page)).toEqual([key]);
  await page.evaluate((key) => {
    const s = window.__game.scene.getScene('WorldScene'),
      p = s.zone.interactions.find((p) => p.dialogue === key);
    s.player.setPosition(p.x * 16 + 8, p.y * 16);
  }, key);
  await press(page);
  await settle(page);
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)).toBe(
    true,
  );
}
test('one visible cue guides supper, beds, dreams, tales and the Ring to a working exit', async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page);
  for (const key of [
    'house_welcome',
    'house_supper',
    'house_bed',
    'house_stories',
    'house_ring',
    'house_bed',
    'house_farewell',
  ]) {
    expect(
      await page.evaluate(
        () =>
          window.__game.scene.getScene('WorldScene').journey.markers.filter((m) => m.dot.visible)
            .length,
      ),
    ).toBe(1);
    await act(page, key);
    if (key === 'house_supper') {
      const seats = await page.evaluate(() => {
        const s = window.__game.scene.getScene('WorldScene'),
          h = s.journey.house;
        return [s.player, ...s.followers, h.tom, h.goldberry].map((p) => ({
          x: p.x,
          y: p.y,
          cropped: p.isCropped,
        }));
      });
      expect(seats).toHaveLength(6);
      expect(
        seats.every((p) => p.cropped && p.x >= 160 && p.x <= 272 && p.y >= 112 && p.y <= 176),
      ).toBe(true);
    }
    if (key === 'house_bed') {
      expect(
        await page.evaluate(() => {
          const s = window.__game.scene.getScene('WorldScene'),
            h = s.journey.house;
          return (
            h.night.alpha * h.night.fillAlpha > 0.6 &&
            h.dream.alpha === 1 &&
            h.blankets.every((b) => b.alpha * b.fillAlpha === 1) &&
            [s.player, ...s.followers].every((p) => p.isCropped && p.y > 240)
          );
        }),
      ).toBe(true);
    }
    await finish(page);
    expect(
      await page.evaluate(() => window.__game.scene.getScene('WorldScene').journey.ring.visible),
    ).toBe(false);
    expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.alpha)).toBe(
      1,
    );
  }
  expect(await cues(page)).toEqual([]);
  expect(await page.evaluate(() => window.__state.items.tom_song)).toBe(1);
  // Walk through the actual doorway and then the now-open east exit.
  await page.evaluate(() =>
    window.__game.scene.getScene('WorldScene').player.setPosition(18 * 16 + 8, 17 * 16),
  );
  await page.keyboard.down('ArrowDown');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').zoneKey === 'tomclearing',
  );
  await page.keyboard.up('ArrowDown');
  await page.evaluate(() =>
    window.__game.scene.getScene('WorldScene').player.setPosition(42 * 16, 16 * 16),
  );
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').zoneKey === 'downs');
  await page.keyboard.up('ArrowRight');
  expect(errors).toEqual([]);
});
test('Continue after the old Ring encounter repairs guidance and never reveals a loose Ring', async ({
  page,
}) => {
  test.setTimeout(90000);
  await boot(page, {
    houseWelcomed: true,
    houseSupper: true,
    houseNightOne: true,
    houseStories: true,
    houseRing: true,
  });
  expect(await cues(page)).toEqual(['house_bed']);
  expect(await page.evaluate(() => window.__state.objective)).toContain('second night');
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').journey.ring.visible),
  ).toBe(false);
  await act(page, 'house_bed');
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));
  expect(await cues(page)).toEqual(['house_bed']);
  await act(page, 'house_bed');
  await finish(page);
  await act(page, 'house_farewell');
  await finish(page);
  expect(await page.evaluate(() => window.__state.flags.learnedSong)).toBe(true);
});

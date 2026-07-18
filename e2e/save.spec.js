// e2e/save.spec.js
// Autosave/continue across a real page reload. Playwright gives each test a
// fresh browser context, so localStorage starts empty and tests can't leak
// saves into each other (or into smoke.spec.js).

import { test, expect } from '@playwright/test';

async function press(page, key, hold = 60) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function bootToTitle(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
}

test('autosave at zone entry survives a reload and Continue restores it', async ({ page }) => {
  await bootToTitle(page);
  await page.evaluate(() => {
    window.__state.flags.prologueDone = true;
    window.__state.flags.timeskipShown = true;
  });
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  // Advance the story and change zones — the woodyend entry autosaves
  await page.evaluate(() => {
    Object.assign(window.__state.flags, { metGandalf: true, samJoined: true });
    window.__state.follower = 'sam';
    window.__game.scene.getScene('WorldScene').goToZone('woodyend', 'west');
  });
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').zone?.key === 'woodyend',
  );
  const objectiveBefore = await page.evaluate(() => window.__state.objective);

  // Reload: module state is wiped, localStorage survives
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter'); // Continue
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  const state = await page.evaluate(() => ({
    zone: window.__game.scene.getScene('WorldScene').zone.key,
    samJoined: !!window.__state.flags.samJoined,
    follower: window.__state.follower,
    objective: window.__state.objective,
  }));
  expect(state.zone).toBe('woodyend');
  expect(state.samJoined).toBe(true);
  expect(state.follower).toBe('sam');
  expect(state.objective).toBe(objectiveBefore);
});

test('N starts a new game, discarding the save', async ({ page }) => {
  await bootToTitle(page);
  await page.evaluate(() => {
    window.__state.flags.prologueDone = true;
    window.__state.flags.timeskipShown = true;
  });
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'n'); // New Game
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  const state = await page.evaluate(() => ({
    objective: window.__state.objective,
    prologueDone: !!window.__state.flags.prologueDone,
  }));
  // Fresh start: back at Bilbo's party, saved flags gone
  expect(state.prologueDone).toBe(false);
  expect(state.objective).toMatch(/Bilbo/);

  // The old save was genuinely replaced by the fresh-prologue checkpoint
  const checkpoint = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('lotr-rpg.save.v1')),
  );
  expect(checkpoint.entry).toBe('party');
  expect(!!checkpoint.flags.prologueDone).toBe(false);
});

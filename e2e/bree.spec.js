import { test, expect } from '@playwright/test';
import {
  checkpoint,
  walk,
  zone,
  act,
  flag,
  reload,
  press,
  dialogue,
  watchErrors,
  BOUNDARY,
} from './journeyRoute.js';
import { BREE_BEATS } from '../src/state/breeProgress.js';

const afterDowns = {
  ...BOUNDARY.clearing.flags,
  barrowTaken: true,
  barrowCourage: true,
  barrowRescued: true,
  barrowBlades: true,
  poniesRecovered: true,
  chapter3Complete: true,
};
const before = (key) =>
  Object.fromEntries(
    BREE_BEATS.slice(
      0,
      BREE_BEATS.findIndex((b) => b.key === key),
    ).map((b) => [b.flag, true]),
  );

test('walks the complete Bree chapter, preserving Continue and the departure party', async ({
  page,
}, info) => {
  info.setTimeout(300000);
  const errors = watchErrors(page);
  await checkpoint(page, 'eastroad', 'bree', afterDowns);
  const missingArt = await page.evaluate(async () => {
    const { CHAR_NAMES } = await import('/src/art/characters.js');
    return CHAR_NAMES.filter(
      (name) =>
        !window.__game.textures.exists(name) || !window.__game.anims.exists(`${name}-walk-down`),
    );
  });
  expect(missingArt).toEqual([]);
  await walk(page, 47, 12);
  await zone(page, 'breegate');
  await act(page, 'bree_gate');
  await walk(page, 27, 14);
  await zone(page, 'bree');
  await act(page, 'bree_sign');
  await walk(page, 24, 11);
  await zone(page, 'ponycommon');
  await act(page, 'bree_welcome');
  await act(page, 'bree_locals');
  await act(page, 'bree_song');
  await flag(page, 'breeRingSlip');
  await reload(page, 'ponycommon');
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.alpha)).toBe(
    1,
  );
  await walk(page, 29, 18);
  await zone(page, 'ponyparlour');
  await act(page, 'bree_strider');
  await act(page, 'bree_letter');
  await reload(page, 'ponyparlour');
  await act(page, 'bree_trust');
  await act(page, 'bree_merry');
  expect(
    await page.evaluate(
      () => window.__game.scene.getScene('WorldScene').followers.filter((p) => p.visible).length,
    ),
  ).toBe(3);
  await walk(page, 23, 16);
  await zone(page, 'ponyrooms');
  await act(page, 'bree_decoys');
  await reload(page, 'ponyrooms');
  await walk(page, 0, 13);
  await zone(page, 'ponyparlour');
  await act(page, 'bree_watch');
  await flag(page, 'breeMorning');
  await reload(page, 'ponyparlour');
  await walk(page, 23, 16);
  await zone(page, 'ponyrooms');
  await act(page, 'bree_damage');
  await walk(page, 0, 13);
  await zone(page, 'ponyparlour');
  await walk(page, 0, 16);
  await zone(page, 'ponycommon');
  await walk(page, 15, 22);
  await zone(page, 'bree');
  await act(page, 'bree_bill');
  await flag(page, 'striderJoined');
  await walk(page, 47, 17);
  await zone(page, 'breeroad');
  await act(page, 'bree_depart');
  await flag(page, 'chapter4Complete');
  await reload(page, 'breeroad');
  expect(
    await page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').followers.map((p) => p.getData('key')),
    ),
  ).toEqual(['sam', 'pippin', 'merry', 'strider']);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').journey.ponies.length),
  ).toBe(1);
  await walk(page, 35, 11);
  const blocked = await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const s = window.__game.scene.getScene('WorldScene');
    return [...s.followers, ...s.journey.ponies].filter((p) =>
      COLLISION_TILES.includes(s.zone.map[Math.floor((p.y + 8) / 16)]?.[Math.floor(p.x / 16)]),
    ).length;
  });
  expect(blocked).toBe(0);
  expect(errors).toEqual([]);
});

test('Ring disappearance blocks movement and replays safely after an interrupted save', async ({
  page,
}) => {
  await checkpoint(page, 'ponycommon', 'door', { ...afterDowns, ...before('bree_song') });
  await walk(page, 14, 10);
  await press(page);
  for (let i = 0; i < 6; i++) {
    await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy);
    await press(page);
  }
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').player.alpha === 0);
  expect(await page.evaluate(() => !!window.__state.flags.breeRingSlip)).toBe(false);
  const position = await page.evaluate(() => {
    const p = window.__game.scene.getScene('WorldScene').player;
    return { x: p.x, y: p.y };
  });
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(200);
  await page.keyboard.up('ArrowRight');
  expect(
    await page.evaluate(() => {
      const p = window.__game.scene.getScene('WorldScene').player;
      return { x: p.x, y: p.y };
    }),
  ).toEqual(position);
  await reload(page, 'ponycommon');
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.alpha)).toBe(
    1,
  );
  await act(page, 'bree_song');
  await flag(page, 'breeRingSlip');
});

test('touch action advances the gate conversation and inventory still works', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'matchMedia', {
      value: (query) => ({
        matches: query.includes('coarse'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }),
    }),
  );
  await checkpoint(page, 'breegate', 'west', afterDowns);
  await walk(page, 17, 14);
  const button = page.getByRole('button', { name: 'Action', exact: true });
  // The normal touch controls call the same event handler as keyboard input.
  await expect(button).toBeVisible();
  await button.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch' });
  await button.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch' });
  await expect
    .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive))
    .toBe(true);
  await dialogue(page);
  await flag(page, 'breeAdmitted');
  await press(page, 'KeyI');
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').overlayVisible)).toBe(
    true,
  );
});

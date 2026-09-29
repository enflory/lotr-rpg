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

// Sample the real cast each rendered frame, stopping at the map boundary.
// Elapsed-time bounds catch teleports without mistaking a slow frame for one.
async function observeInn(page, key) {
  await page.evaluate((key) => {
    const s = window.__game.scene.getScene('WorldScene'),
      zone = s.zoneKey;
    const sprites = [s.player, ...s.followers, s.bree.actors.butterbur];
    const motion = (window.__innMotion = { maxSpeed: 0, moved: {}, hidden: [], samples: 0 });
    let previous, lastTime;
    const sample = () => {
      if (s.zoneKey !== zone || !s.sys.isActive()) return;
      const now = performance.now();
      if (s.dialogActive && s.dialogKey === key) {
        const next = sprites.map((p) => ({ x: p.x, y: p.y }));
        sprites.forEach((p, i) => {
          const name = p.getData('key') || 'frodo';
          if (i < 4 && !p.visible && !motion.hidden.includes(name)) motion.hidden.push(name);
          if (previous && now > lastTime) {
            const distance = Math.hypot(p.x - previous[i].x, p.y - previous[i].y);
            motion.maxSpeed = Math.max(motion.maxSpeed, (distance * 1000) / (now - lastTime));
            motion.moved[name] = (motion.moved[name] || 0) + distance;
          }
        });
        previous = next;
        lastTime = now;
        motion.samples++;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }, key);
}

async function expectInnMovement(page) {
  const motion = await page.evaluate(() => window.__innMotion);
  expect(motion.hidden).toEqual([]);
  expect(motion.maxSpeed).toBeLessThan(220);
  for (const name of ['frodo', 'sam', 'pippin', 'merry', 'butterbur'])
    expect(motion.moved[name], `${name} should visibly walk through the scene`).toBeGreaterThan(
      100,
    );
}

test('walks from the East Road through supper, the common-room company and the Ring accident', async ({
  page,
}, info) => {
  // Two walks cover the chapter, with an asserted flag boundary between them.
  // Keep journeyRoute's per-step liveness checks for each real keyboard route.
  info.setTimeout(process.env.CI ? 480000 : 300000);
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
  await zone(page, 'ponyparlour');
  await act(page, 'bree_supper');
  await zone(page, 'ponycommon');
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').dialogActive);
  await dialogue(page);
  await flag(page, 'breeCompany');
  await act(page, 'bree_locals');
  await act(page, 'bree_song');
  await flag(page, 'breeRingSlip');
  await reload(page, 'ponycommon');
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.alpha)).toBe(
    1,
  );
  // The next route must start with exactly the progress this one achieved.
  const boundary = { ...afterDowns, ...before('bree_strider') };
  expect(
    await page.evaluate(
      (keys) => keys.filter((key) => !window.__state.flags[key]),
      Object.keys(boundary),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test('walks from the Ring checkpoint through the night and departure with Strider and Bill', async ({
  page,
}, info) => {
  info.setTimeout(process.env.CI ? 360000 : 240000);
  const errors = watchErrors(page);
  await checkpoint(page, 'ponycommon', 'parlour', { ...afterDowns, ...before('bree_strider') });
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
  // Revisiting Bree restores Bill beside the travelling formation, rather
  // than teleporting him back to Ferny's sale location across town.
  await walk(page, 0, 14);
  await zone(page, 'bree');
  await reload(page, 'bree');
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      const bill = s.journey.ponies[0],
        last = s.followers.at(-1);
      return Math.hypot(bill.x - last.x, bill.y - last.y);
    }),
  ).toBeLessThan(40);
  expect(errors).toEqual([]);
});

test('Ring disappearance blocks movement and replays safely after an interrupted save', async ({
  page,
}) => {
  test.setTimeout(150000);
  await checkpoint(page, 'ponycommon', 'door', { ...afterDowns, ...before('bree_song') });
  await walk(page, 14, 10);
  await press(page);
  for (let i = 0; i < 12; i++) {
    await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy);
    if (
      await page.evaluate(() => {
        const s = window.__game.scene.getScene('WorldScene');
        return s.storyBeat?.prompt === 'Interrupt Pippin' && !s.typing;
      })
    )
      break;
    await press(page);
  }
  const waiting = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return {
      x: s.player.x,
      y: s.player.y,
      prompt: s.storyBeat?.prompt,
      visible: s.actionHint.visible,
      aboveDialogue: s.actionHint.getBounds().bottom < s.dialogBg.getBounds().top,
    };
  });
  expect(waiting.prompt).toBe('Interrupt Pippin');
  expect(waiting.visible).toBe(true);
  expect(waiting.aboveDialogue).toBe(true);
  await page.keyboard.press('ArrowRight', { delay: 300 });
  expect(
    await page.evaluate(() => {
      const p = window.__game.scene.getScene('WorldScene').player;
      return { x: p.x, y: p.y };
    }),
  ).toEqual({ x: waiting.x, y: waiting.y });
  for (let i = 0; i < 30; i++) {
    if (await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.alpha === 0))
      break;
    await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy);
    await press(page);
  }
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').player.alpha === 0);
  await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy);
  expect(
    await page.evaluate(() => {
      const a = window.__game.scene.getScene('WorldScene').bree.actors;
      return ['ferny', 'southerner', 'harry'].filter((key) => a[key].visible);
    }),
  ).toEqual([]);
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

test('the welcome and supper stage every hobbit, then Pippin stays with his audience across Continue', async ({
  page,
}) => {
  test.setTimeout(180000);
  await checkpoint(page, 'ponycommon', 'door', { ...afterDowns, breeAdmitted: true });
  const companions = () =>
    page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').followers.map((p) => ({
        key: p.getData('key'),
        visible: p.visible,
        held: !!p.getData('held'),
        x: p.x,
        y: p.y,
      })),
    );
  expect((await companions()).filter((p) => p.visible).map((p) => p.key)).toEqual([
    'sam',
    'pippin',
    'merry',
  ]);
  await observeInn(page, 'bree_welcome');
  await act(page, 'bree_welcome');
  await zone(page, 'ponyparlour');
  await expectInnMovement(page);
  expect((await companions()).every((p) => p.visible)).toBe(true);
  await observeInn(page, 'bree_supper');
  await act(page, 'bree_supper');
  await zone(page, 'ponycommon');
  await expectInnMovement(page);
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').dialogActive);
  await dialogue(page);
  await flag(page, 'breeCompany');
  const gathered = await companions();
  expect(gathered.find((p) => p.key === 'merry').visible).toBe(false);
  const pippin = gathered.find((p) => p.key === 'pippin');
  expect(pippin.visible && pippin.held).toBe(true);
  await walk(page, 10, 11);
  expect((await companions()).find((p) => p.key === 'pippin')).toEqual(pippin);
  await reload(page, 'ponycommon');
  expect((await companions()).find((p) => p.key === 'pippin')).toEqual(pippin);
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)).toBe(
    false,
  );
});

test('Continue during Butterbur’s escort replays the unfinished welcome with all four hobbits', async ({
  page,
}) => {
  test.setTimeout(90000);
  await checkpoint(page, 'ponycommon', 'door', { ...afterDowns, breeAdmitted: true });
  await walk(page, 6, 5);
  await press(page);
  await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy);
  await press(page);
  await press(page);
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return s.dialogIndex === 1 && s.storyBeat?.busy && s.player.x > 130;
  });
  expect(await page.evaluate(() => !!window.__state.flags.ponyWelcomed)).toBe(false);
  await reload(page, 'ponycommon');
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return {
        followers: s.followers.filter((p) => p.visible).length,
        free: s.player.body.enable && !s.storyBeat,
      };
    }),
  ).toEqual({ followers: 3, free: true });
  await act(page, 'bree_welcome');
  await zone(page, 'ponyparlour');
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

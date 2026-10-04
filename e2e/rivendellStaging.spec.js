// Chapter 6 choreography and recovery: the sword prompt at the Ford, the flood
// swept frame by frame, the waking, the Council's one prompt, the weeks, the
// Company at the gate, sequence breaks, older saves and reloads that land in
// the middle of a scene.
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
} from './journeyRoute.js';
import { AFTER_ROAD, through, autoStory } from './rivendellRoute.js';
import { PAGE } from '../src/data/rivendellDialogues.js';

const S = '(window.__game.scene.getScene("WorldScene"))';
const ev = (page, expr) => page.evaluate(`(() => { const s = ${S}; return ${expr}; })()`);
const idle = (page) =>
  page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy, null, {
    timeout: 40000,
  });

// Press through a dialogue until the next story prompt is showing.
async function untilPrompt(page, prompt) {
  for (let n = 0; n < 60; n++) {
    await idle(page);
    if (await ev(page, `s.storyBeat?.prompt === ${JSON.stringify(prompt)} && !s.typing`)) return;
    await press(page);
  }
  throw new Error(`prompt "${prompt}" never appeared`);
}
// Press through a dialogue until a named page is showing and its choreography is done.
async function untilPage(page, key, id) {
  const at = PAGE[key][id];
  for (let n = 0; n < 80; n++) {
    await idle(page);
    if (
      await ev(
        page,
        `s.dialogKey === ${JSON.stringify(key)} && s.dialogIndex >= ${at} && !s.typing`,
      )
    )
      return;
    await press(page);
  }
  throw new Error(`page ${key}.${id} never appeared`);
}
// Boot from a save without insisting that the zone is still there a moment later.
async function bootSaved(page, zoneKey, entry, flags) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(
    ({ zoneKey, entry, flags }) =>
      localStorage.setItem(
        'lotr-rpg.save.v1',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          zone: zoneKey,
          entry,
          flags: { prologueDone: true, samJoined: true, pippinJoined: true, ...flags },
          follower: 'sam',
          objective: 'x',
          items: {},
          collected: {},
        }),
      ),
    { zoneKey, entry, flags },
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
}
const shot = (page, name) =>
  page.locator('canvas').screenshot({ path: test.info().outputPath(`${name}.png`) });

test('the sword prompt waits; the flood sweeps the Nine; Continue after it lands in the house', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors = watchErrors(page);
  await checkpoint(page, 'bruinen', 'east', AFTER_ROAD);
  await walk(page, 36, 11);
  await press(page);
  await expect.poll(() => ev(page, 's.dialogActive')).toBe(true);
  await untilPrompt(page, 'Draw your sword');
  const waiting = await ev(
    page,
    `({ x: s.player.x, y: s.player.y, shown: s.actionHint.visible, above: s.actionHint.getBounds().bottom < s.dialogBg.getBounds().top, key: s.dialogKey })`,
  );
  expect(waiting).toMatchObject({ shown: true, above: true, key: 'rv_flood' });
  // Three Riders are already in the water; nothing the player does moves Frodo.
  expect(await ev(page, 's.road.riders.filter((r) => r.x > 28 * 16).length')).toBe(3);
  await page.keyboard.press('ArrowRight', { delay: 300 });
  expect(await ev(page, '({ x: s.player.x, y: s.player.y })')).toEqual({
    x: waiting.x,
    y: waiting.y,
  });
  await shot(page, 'flood-sword');
  await press(page);
  await untilPage(page, 'rv_flood', 'roar');
  expect(await ev(page, 's.rv.rise.alpha')).toBeGreaterThan(0.3);
  await shot(page, 'flood-rising');
  // Sample the white horses while they run: they only ever go down the channel.
  await press(page);
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').dialogIndex >= 7);
  await page.waitForTimeout(700);
  await shot(page, 'flood-horses');
  await untilPage(page, 'rv_flood', 'dark');
  expect(await ev(page, 's.road.riders.every((r) => r.alpha === 0)')).toBe(true);
  // The ending is dark, and the next thing is the house, with nothing left running.
  await shot(page, 'flood-dark');
  await dialogue(page);
  await flag(page, 'fordFlooded');
  await zone(page, 'rivendellroom');
  await autoStory(page, 'rv_wake');
  await flag(page, 'rivendellWoke');
  expect(errors).toEqual([]);
});

test('a reload in the gap after the flood still wakes in the house of Elrond', async ({ page }) => {
  test.setTimeout(120000);
  const errors = watchErrors(page);
  // Continue from the Ford with the flood already flagged: the scene hands straight on to the house.
  await bootSaved(page, 'bruinen', 'east', { ...AFTER_ROAD, fordFlooded: true });
  await zone(page, 'rivendellroom');
  await autoStory(page, 'rv_wake');
  await flag(page, 'rivendellWoke');
  // Mid-wake reload: nothing was saved but the flood, so the waking replays.
  await bootSaved(page, 'rivendellroom', 'bed', { ...AFTER_ROAD, fordFlooded: true });
  await zone(page, 'rivendellroom');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').dialogKey === 'rv_wake',
  );
  await idle(page);
  expect(await ev(page, '({ angle: s.player.angle, gandalf: !!s.rv.gandalf?.visible })')).toEqual({
    angle: 90,
    gandalf: true,
  });
  await shot(page, 'wake');
  await untilPage(page, 'rv_wake', 'sam');
  expect(await ev(page, 's.rv.sam.alpha')).toBe(1);
  await shot(page, 'wake-sam');
  await dialogue(page);
  await flag(page, 'rivendellWoke');
  expect(await ev(page, 's.player.angle')).toBe(0);
  expect(errors).toEqual([]);
});

test('the evening is for the hall: the way out is shut until the Hall of Fire, and the guests move', async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors = watchErrors(page);
  await checkpoint(page, 'rivendellhall', 'fromRooms', through('rv_feast'));
  expect(await ev(page, 's.npcs.map((n) => n.getData("key")).sort().join()')).toBe(
    'arwen,bilboelder,dunadan,elrond,gandalfrv,gloin',
  );
  // Out of sequence: the east door stays shut.
  await walk(page, 30, 9);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(900);
  await page.keyboard.up('ArrowRight');
  expect(await ev(page, 's.zoneKey')).toBe('rivendellhall');
  await act(page, 'rv_feast');
  await shot(page, 'feast-done');
  // After the feast Bilbo is at the hearth and the high table is empty.
  expect(await ev(page, 's.npcs.map((n) => n.getData("key")).sort().join()')).toBe(
    'bilboelder,lindir',
  );
  await act(page, 'rv_song');
  await flag(page, 'hallOfFire');
  expect(await ev(page, 's.entryKey')).toBe('hearth');
  expect(await ev(page, 's.npcs.map((n) => n.getData("key")).join()')).toBe('lindir');
  expect(errors).toEqual([]);
});

test('Rise and speak waits for the player; the Ring lies on the stone for one page; the seats empty', async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors = watchErrors(page);
  await checkpoint(page, 'rivendell', 'porch', through('rv_council2'));
  expect(await ev(page, 's.rv.shards.visible')).toBe(false);
  expect(await ev(page, 's.npcs.length')).toBe(10);
  await shot(page, 'council-seats');
  await act(page, 'rv_council2');
  expect(await ev(page, 's.rv.shards.visible')).toBe(true);
  // The Ring is never left on the stone, and a reload cannot bring it back.
  expect(await ev(page, '!!s.rv.ring')).toBe(false);
  await reload(page, 'rivendell');
  expect(await ev(page, '!!s.rv.ring')).toBe(false);
  expect(await ev(page, 's.rv.shards.visible')).toBe(true);
  await walk(page, 48, 21);
  await press(page);
  await expect.poll(() => ev(page, 's.dialogActive')).toBe(true);
  await untilPrompt(page, 'Rise and speak');
  const waiting = await ev(
    page,
    `({ x: s.player.x, shown: s.actionHint.visible, above: s.actionHint.getBounds().bottom < s.dialogBg.getBounds().top })`,
  );
  expect(waiting).toMatchObject({ shown: true, above: true });
  await page.keyboard.press('ArrowLeft', { delay: 300 });
  expect(await ev(page, 's.player.x')).toBe(waiting.x);
  await shot(page, 'council-speak');
  await press(page);
  await untilPage(page, 'rv_council3', 'sam');
  expect(await ev(page, 's.rv.sam.visible')).toBe(true);
  await shot(page, 'council-sam');
  await dialogue(page);
  await flag(page, 'ringBearerChosen');
  // The porch empties into the valley; nobody is in two places.
  const keys = await ev(page, 's.npcs.map((n) => n.getData("key"))');
  expect(new Set(keys).size).toBe(keys.length);
  expect(keys).toContain('legolas');
  expect(await ev(page, 's.rv.shards.visible')).toBe(false);
  expect(errors).toEqual([]);
});

test('the weeks turn the valley to winter and Merry and Pippin come up the path', async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors = watchErrors(page);
  await checkpoint(page, 'rivendell', 'porch', through('rv_weeks'));
  const autumn = await ev(
    page,
    '({ a: s.rv.sky.alpha, c: s.rv.sky.fillColor, n: s.rv.fx.fall.length })',
  );
  await walk(page, 36, 33);
  await press(page);
  await expect.poll(() => ev(page, 's.dialogActive')).toBe(true);
  await untilPage(page, 'rv_weeks', 'hobbits');
  expect(await ev(page, 's.rv.temp.map((t) => t.texture.key).sort().join()')).toBe('merry,pippin');
  await shot(page, 'weeks-hobbits');
  await dialogue(page);
  await flag(page, 'weeksPassed');
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').rv.temp.length === 0);
  const winter = await ev(page, '({ a: s.rv.sky.alpha, c: s.rv.sky.fillColor })');
  expect(winter.c).not.toBe(autumn.c);
  await reload(page, 'rivendell');
  expect(await ev(page, 's.rv.fx.fall.length')).toBeGreaterThan(autumn.n);
  await shot(page, 'winter');
  expect(errors).toEqual([]);
});

test('the Company stands at the gate; nobody is on blocked ground; mashing changes nothing', async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors = watchErrors(page);
  await checkpoint(page, 'rivendell', 'door', through('rv_company'));
  await walk(page, 30, 39);
  await press(page);
  await expect.poll(() => ev(page, 's.dialogActive')).toBe(true);
  await untilPage(page, 'rv_company', 'names');
  await shot(page, 'gate-names');
  // Mash: the page never skips a scene that is still moving.
  for (let n = 0; n < 12; n++) await press(page, 'Space');
  await dialogue(page);
  await flag(page, 'chapter6Complete');
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').rv.temp.length === 0);
  await shot(page, 'gate-company');
  const blocked = await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const s = window.__game.scene.getScene('WorldScene');
    const sprites = [...s.npcs, ...Object.values(s.rv.walk), s.player].filter((p) => p.visible);
    return {
      count: sprites.length,
      onSolid: sprites
        .filter((p) =>
          COLLISION_TILES.includes(
            s.zone.map[Math.floor((p.y + (p === s.player ? 8 : 0) + 4) / 16)][Math.floor(p.x / 16)],
          ),
        )
        .map((p) => p.getData('key') ?? 'frodo'),
    };
  });
  expect(blocked.onSolid).toEqual([]);
  // Frodo, Sam, Merry, Pippin, Gandalf, Aragorn, Legolas, Gimli, Boromir, and the five who see them off.
  expect(blocked.count).toBe(9 + 5);
  const objective = await page.evaluate(() => window.__state.objective);
  expect(objective).toMatch(/Chapter six complete/);
  expect(errors).toEqual([]);
});

test('a reload in the middle of the feast replays it from the hall', async ({ page }) => {
  test.setTimeout(120000);
  const errors = watchErrors(page);
  await checkpoint(page, 'rivendellhall', 'fromRooms', through('rv_feast'));
  await walk(page, 15, 8);
  await press(page);
  await expect.poll(() => ev(page, 's.dialogActive')).toBe(true);
  await untilPage(page, 'rv_feast', 'gloin');
  await reload(page, 'rivendellhall');
  expect(await ev(page, 'window.__state.flags.feastHeld')).toBeFalsy();
  expect(await ev(page, 's.npcs.length')).toBe(6);
  await act(page, 'rv_feast');
  await flag(page, 'feastHeld');
  expect(errors).toEqual([]);
});

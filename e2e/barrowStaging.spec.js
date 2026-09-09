import { expect, test } from '@playwright/test';
import { act, checkpoint, dialogue, reload, settled, walk, watchErrors } from './journeyRoute.js';

const party = { chapter2: true, merryJoined: true, learnedSong: true };

test('the party and ponies wake together beside the great stone, including Continue', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = watchErrors(page);
  await checkpoint(page, 'downs', 'stone', party);
  await act(page, 'downs_stone');
  const company = () =>
    page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return {
        fog: !!window.__state.flags.downsFog,
        separated: !!window.__state.flags.downsSeparated,
        followers: s.followers.filter((p) => p.visible && p.alpha > 0.9).length,
        ponies: s.journey.ponies.filter((p) => p.visible && p.alpha > 0.9).length,
      };
    });
  expect(await company()).toEqual({ fog: true, separated: false, followers: 3, ponies: 5 });
  await reload(page, 'downs');
  expect(await company()).toEqual({ fog: true, separated: false, followers: 3, ponies: 5 });
  expect(errors).toEqual([]);
});

test('Frodo leads through the gate and loses the company behind him', async ({ page }) => {
  test.setTimeout(90000);
  const errors = watchErrors(page);
  await checkpoint(page, 'downs', 'gate', { ...party, downsFog: true });
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    window.__gateStaging = { frames: 0, fades: [], wrongOrder: [], earlyPonies: [] };
    let crossed = false;
    const sample = () => {
      if (s.zoneKey !== 'downs' || window.__state.flags.downsSeparated) return;
      if ((s.player.y + 8) / 16 < 12) crossed = true;
      window.__gateStaging.frames++;
      for (const p of s.followers) {
        if (!p.visible) continue;
        const feetY = (p.y + 8) / 16;
        if (feetY < 12 && !crossed) window.__gateStaging.wrongOrder.push(p.getData('key'));
        if (p.alpha < 0.95 && p.alpha > 0.05)
          window.__gateStaging.fades.push({ key: p.getData('key'), feetY, crossed });
      }
      if (!crossed && s.journey.ponies.some((p) => p.alpha < 0.9))
        window.__gateStaging.earlyPonies.push(true);
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await dialogue(page);
  await settled(page);
  const staging = await page.evaluate(() => window.__gateStaging);
  expect(staging.frames).toBeGreaterThan(30);
  expect(staging.wrongOrder).toEqual([]);
  expect(staging.earlyPonies).toEqual([]);
  expect(new Set(staging.fades.map((p) => p.key))).toEqual(new Set(['sam', 'pippin', 'merry']));
  expect(staging.fades.every((p) => p.crossed && p.feetY >= 13)).toBe(true);
  expect(await page.evaluate(() => window.__state.flags.downsSeparated)).toBe(true);
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return (
      s.followers.every((p) => !p.visible) &&
      s.journey.ponies.every((p) => !p.visible || p.alpha < 0.05)
    );
  });
  expect(errors).toEqual([]);
});

test('the wight capture fades the whole view without a local black block', async ({ page }) => {
  test.setTimeout(90000);
  const errors = watchErrors(page);
  await checkpoint(page, 'downs', 'gate', { ...party, downsFog: true, downsSeparated: true });
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    window.__captureStaging = { black: false, fullView: false, localBlocks: false };
    const sample = () => {
      if (s.zoneKey !== 'downs') return;
      if (s.dialogKey === 'downs_voices' && s.dialogActive) {
        const d = s.journey.downs,
          camera = s.cameras.main,
          log = window.__captureStaging;
        log.black ||= d.night.alpha > 0.98 && d.night.fillColor === 0;
        log.fullView ||=
          d.night.width >= camera.width / camera.zoom &&
          d.night.height >= camera.height / camera.zoom &&
          d.night.scrollFactorX === 0 &&
          d.night.scrollFactorY === 0;
        log.localBlocks ||= s.children.list.some(
          (obj) =>
            obj.type === 'Rectangle' && obj.depth >= 880 && obj.scrollFactorX !== 0 && obj.visible,
        );
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await walk(page, 61, 9);
  expect(await page.evaluate(() => window.__captureStaging)).toEqual({
    black: true,
    fullView: true,
    localBlocks: false,
  });
  expect(errors).toEqual([]);
});

test('courage reveals the nearby song cue and Tom enters through the broken wall', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = watchErrors(page);
  await checkpoint(page, 'barrow', 'default', { ...party, barrowTaken: true, barrowWoke: true });
  await act(page, 'barrow_courage');
  const cue = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene'),
      b = s.journey.downs;
    return {
      cue: b.songCue.visible && b.songCue.alpha > 0,
      label: b.songLabel.visible && b.songLabel.alpha > 0,
      labelText: b.songLabel.text,
      distance: Math.hypot(s.player.x - (15 * 16 + 8), s.player.y - 13 * 16),
    };
  });
  expect(cue.cue).toBe(true);
  expect(cue.label).toBe(true);
  expect(cue.labelText.toLowerCase()).toContain('sing');
  expect(cue.distance).toBeLessThan(20);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    window.__rescueStaging = {
      tom: [],
      breach: false,
      flashing: false,
      oldProps: false,
      cueDuringSong: false,
    };
    const sample = () => {
      if (s.zoneKey !== 'barrow' || window.__state.flags.barrowRescued) return;
      const b = s.journey.downs;
      if (s.dialogKey === 'barrow_call' && s.dialogActive) {
        const log = window.__rescueStaging;
        log.breach ||= b.breach?.type === 'Graphics' && b.breach.visible && b.breach.alpha > 0;
        log.flashing ||= !!s.cameras.main.flashEffect?.isRunning;
        log.oldProps ||= !!(b.gap || b.crackLight);
        log.cueDuringSong ||= b.songCue.visible || b.songLabel.visible;
        if (b.rescueTom?.visible && b.rescueTom.alpha > 0.1)
          log.tom.push({ x: b.rescueTom.x, y: b.rescueTom.y });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await act(page, 'barrow_call');
  await settled(page);
  const rescue = await page.evaluate(() => window.__rescueStaging);
  expect(rescue.breach).toBe(true);
  expect(rescue.flashing).toBe(false);
  expect(rescue.oldProps).toBe(false);
  expect(rescue.cueDuringSong).toBe(false);
  expect(rescue.tom.length).toBeGreaterThan(15);
  expect(Math.abs(rescue.tom[0].x - (18 * 16 + 8))).toBeLessThan(24);
  expect(rescue.tom[0].y).toBeLessThan(8 * 16);
  expect(rescue.tom.at(-1).y - rescue.tom[0].y).toBeGreaterThan(24);
  expect(await page.evaluate(() => window.__state.flags.barrowRescued)).toBe(true);
  expect(errors).toEqual([]);
});

test('Tom leads toward the East Road while Frodo can walk and Continue keeps him ahead', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = watchErrors(page);
  await checkpoint(page, 'barrowhill', 'default', {
    ...party,
    barrowRescued: true,
    barrowBlades: true,
    hillRisen: true,
  });
  await act(page, 'barrow_ponies');
  const start = await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    return {
      tomX: s.journey.downs.tom.x,
      playerY: s.player.y,
      locked: !!s.storyBeat || !s.player.body.enable,
    };
  });
  expect(start.locked).toBe(false);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(250);
  await page.keyboard.up('ArrowDown');
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').player.y),
  ).toBeGreaterThan(start.playerY + 5);
  await page.waitForFunction(
    (x) => window.__game.scene.getScene('WorldScene').journey.downs.tom.x > x + 8,
    start.tomX,
  );
  await page.waitForFunction(
    () => !window.__game.scene.getScene('WorldScene').journey.downs.tom.visible,
    null,
    { timeout: 20000 },
  );
  await reload(page, 'barrowhill');
  expect(
    await page.evaluate(() => {
      const tom = window.__game.scene.getScene('WorldScene').journey.downs.tom;
      return !tom.visible || tom.x >= 40 * 16;
    }),
  ).toBe(true);
  expect(errors).toEqual([]);
});

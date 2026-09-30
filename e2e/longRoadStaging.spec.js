// Chapter 5 choreography and recovery: the two Weathertop prompts, the wound that
// follows them, the ride to the Ford sampled frame by frame, sequence breaks,
// older saves and reloads that land in the middle of a scene.
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
import { AFTER_BREE, through } from './longRoadRoute.js';

const S = '(window.__game.scene.getScene("WorldScene"))';
const ev = (page, expr) => page.evaluate(`(() => { const s = ${S}; return ${expr}; })()`);

// Press through a dialogue until the next story prompt is showing.
async function untilPrompt(page, prompt) {
  for (let n = 0; n < 30; n++) {
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
      null,
      {
        timeout: 40000,
      },
    );
    if (await ev(page, `s.storyBeat?.prompt === ${JSON.stringify(prompt)} && !s.typing`)) return;
    await press(page);
  }
  throw new Error(`prompt "${prompt}" never appeared`);
}

test('the Riders wait for both prompts; the wound follows; Continue mid-wound replays it', async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors = watchErrors(page);
  await checkpoint(page, 'weathertop', 'dell', { ...AFTER_BREE, ...through('road_attack') });
  await walk(page, 39, 29);
  await press(page);
  await expect.poll(() => ev(page, 's.dialogActive')).toBe(true);
  for (const prompt of ['Slip on the Ring', 'Strike and cry out']) {
    await untilPrompt(page, prompt);
    const waiting = await ev(
      page,
      `({ x: s.player.x, y: s.player.y, shown: s.actionHint.visible, above: s.actionHint.getBounds().bottom < s.dialogBg.getBounds().top, key: s.dialogKey })`,
    );
    expect(waiting).toMatchObject({ shown: true, above: true, key: 'road_attack' });
    // Nothing the player does moves Frodo, and the page does not skip itself.
    await page.keyboard.press('ArrowRight', { delay: 300 });
    expect(await ev(page, '({ x: s.player.x, y: s.player.y })')).toEqual({
      x: waiting.x,
      y: waiting.y,
    });
    if (prompt === 'Slip on the Ring') {
      await press(page);
      // Through the Ring the nine are pale and Frodo is half-seen.
      await page.waitForFunction(
        () => window.__game.scene.getScene('WorldScene').road.sight.alpha > 0.3,
      );
      expect(await ev(page, 's.player.alpha')).toBeLessThan(1);
      expect(await ev(page, 's.road.wraiths.length')).toBe(5);
    }
  }
  await press(page);
  // Read the rest of the stabbing; the wound takes over the moment it ends.
  for (let n = 0; n < 12; n++) {
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
      null,
      { timeout: 40000 },
    );
    if (await ev(page, "s.dialogKey === 'road_wound'")) break;
    await press(page);
  }
  await flag(page, 'wraithsCame');
  // The wound begins by itself, with Frodo lying where he fell.
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').dialogKey === 'road_wound',
  );
  await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat?.busy);
  expect(await ev(page, 's.player.angle')).toBe(90);
  await reload(page, 'weathertop');
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').dialogKey === 'road_wound',
  );
  await dialogue(page);
  await flag(page, 'frodoWounded');
  await page.waitForFunction(() => !window.__game.scene.getScene('WorldScene').storyBeat);
  expect(
    await ev(page, '({ angle: s.player.angle, alpha: s.player.alpha, night: s.road.night.alpha })'),
  ).toEqual({
    angle: 0,
    alpha: 1,
    night: 0,
  });
  expect(errors).toEqual([]);
});

test('the ride to the Ford moves every rider smoothly, with nobody on blocked ground', async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors = watchErrors(page);
  await checkpoint(page, 'bruinen', 'west', { ...AFTER_BREE, ...through('road_ford') });
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene');
    const motion = (window.__ride = { maxSpeed: 0, backwards: 0, frames: 0, chase: 0 });
    let last, at;
    const sample = () => {
      if (s.zoneKey !== 'bruinen' || !s.sys.isActive()) return;
      const now = performance.now();
      const steed = s.road.steed;
      if (s.dialogKey === 'road_ford' && s.dialogIndex >= 4 && steed.visible) {
        if (last !== undefined && now > at) {
          motion.maxSpeed = Math.max(
            motion.maxSpeed,
            (Math.abs(steed.x - last) * 1000) / (now - at),
          );
          if (steed.x < last - 0.5) motion.backwards++;
        }
        motion.chase = Math.max(motion.chase, s.road.chase?.length ?? 0);
        motion.frames++;
        last = steed.x;
        at = now;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await act(page, 'road_ford');
  await flag(page, 'chapter5Complete');
  const ride = await page.evaluate(() => window.__ride);
  expect(ride.frames).toBeGreaterThan(30);
  expect(ride.maxSpeed).toBeLessThan(400);
  expect(ride.backwards).toBe(0);
  expect(ride.chase).toBe(9);
  const blocked = await page.evaluate(async () => {
    const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
    const s = window.__game.scene.getScene('WorldScene');
    const tile = (p) => s.zone.map[Math.floor((p.y + 8) / 16)]?.[Math.floor(p.x / 16)];
    return [s.player, ...s.road.riders].filter((p) => COLLISION_TILES.includes(tile(p))).length;
  });
  expect(blocked).toBe(0);
  expect(errors).toEqual([]);
});

test('a reload in the middle of the ride finds Frodo at the start and the company waiting', async ({
  page,
}) => {
  test.setTimeout(120000);
  await checkpoint(page, 'bruinen', 'west', { ...AFTER_BREE, ...through('road_ford') });
  await walk(page, 5, 11);
  await press(page);
  await untilPrompt(page, 'Mount Asfaloth');
  await press(page);
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').player.alpha === 0);
  await reload(page, 'bruinen');
  const state = await ev(
    page,
    `({ alpha: s.player.alpha, x: s.player.x, done: !!window.__state.flags.chapter5Complete, riders: s.road.riders, glor: s.road.glorfindel.visible, followers: s.followers.filter((p) => p.visible).length })`,
  );
  expect(state).toMatchObject({ alpha: 1, done: false, riders: null, glor: true, followers: 4 });
  expect(state.x).toBeLessThan(10 * 16);
});

test('saves from the end of chapter four still continue onto the road', async ({ page }) => {
  test.setTimeout(90000);
  // The earlier spawn, before the road learned to lead on to Midgewater.
  await checkpoint(page, 'breeroad', 'west', AFTER_BREE);
  await walk(page, 39, 11);
  await zone(page, 'midgewater');
  expect(await ev(page, 'window.__state.objective')).toMatch(/Strider off the Road/);
  // Bree's own exit still turns the party back until Bree is done.
  await checkpoint(page, 'breeroad', 'east', { ...AFTER_BREE, chapter4Complete: false });
  await walk(page, 39, 11);
  await page.waitForTimeout(400);
  expect(await ev(page, 's.zoneKey')).toBe('breeroad');
});

test('the road cannot be skipped: each exit waits for its beat, and a read cue is gone', async ({
  page,
}) => {
  test.setTimeout(150000);
  await checkpoint(page, 'midgewater', 'east', AFTER_BREE);
  await walk(page, 48, 12);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(600);
  await page.keyboard.up('ArrowRight');
  expect(await ev(page, 's.zoneKey')).toBe('midgewater');
  expect(await ev(page, 's.banner.text')).toMatch(/dry bank/);
  // Talk out of order: an example point before its story, then a finished cue again.
  await act(page, 'road_reeds');
  await act(page, 'road_marsh');
  await flag(page, 'marshEntered');
  await walk(page, 4, 13);
  // A finished cue is gone: pressing where it stood starts nothing, repeats no effect.
  await page.waitForTimeout(300);
  await press(page);
  await page.waitForTimeout(400);
  expect(await ev(page, 's.dialogActive')).toBe(false);
  expect(await ev(page, '!!s.storyBeat')).toBe(false);
  expect(
    await ev(
      page,
      "s.interactionMarks.filter((m) => m.p.dialogue === 'road_marsh' && m.dot.visible).length",
    ),
  ).toBe(0);
});

test('the Ford cannot be waded before the ride, and Glorfindel is only ever in one place', async ({
  page,
}) => {
  test.setTimeout(120000);
  await checkpoint(page, 'bruinen', 'west', { ...AFTER_BREE, ...through('road_ford') });
  expect(await ev(page, 'window.__state.flags.fordReached')).toBe(true);
  await walk(page, 27, 11);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(1500);
  await page.keyboard.up('ArrowRight');
  expect(await ev(page, 's.player.x')).toBeLessThan(29 * 16);
  expect(await ev(page, 's.banner.text')).toMatch(/Glorfindel/);
  // Back through the trees to the Trollshaws: the Elf and his horse are not there too.
  await walk(page, 0, 11);
  await zone(page, 'trollshaws');
  expect(await ev(page, 's.road.glorfindel.visible')).toBe(false);
  expect(await ev(page, 's.road.steed.visible')).toBe(false);
});

test('walking back never brings the wrong checkpoint or objective with it', async ({ page }) => {
  test.setTimeout(120000);
  // Back from Midgewater into Bree's road: this chapter's objective, not chapter four's.
  await checkpoint(page, 'midgewater', 'west', { ...AFTER_BREE, ...through('road_midges') });
  await walk(page, 0, 13);
  await zone(page, 'breeroad');
  expect(await ev(page, 'window.__state.objective')).toMatch(/dry bank/);
  // Back up to Weathertop after the wound: the dell is only the live camp's checkpoint.
  await checkpoint(page, 'weathertop', 'dell', { ...AFTER_BREE, ...through('road_athelas') });
  expect(await ev(page, 's.entryKey')).toBe('dell');
  await ev(page, "s.goToZone('weathertop', 'west')");
  await zone(page, 'weathertop');
  await page.waitForTimeout(600);
  expect(await ev(page, 's.entryKey')).toBe('west');
});

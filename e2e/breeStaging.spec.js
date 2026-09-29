import { test, expect } from '@playwright/test';
import { checkpoint, walk, press, dialogue, reload, flag, watchErrors } from './journeyRoute.js';
import { BREE_BEATS } from '../src/state/breeProgress.js';
import { resolveDialogue } from '../src/data/dialogues.js';

async function boot(page, key) {
  const flags = { merryJoined: true, chapter3Complete: true };
  for (const beat of BREE_BEATS) {
    if (beat.key === key) break;
    for (const flag of [].concat(resolveDialogue(beat.key, flags).set || [])) flags[flag] = true;
  }
  const beat = BREE_BEATS.find((b) => b.key === key);
  const entry = {
    breegate: 'west',
    ponyparlour: 'common',
    ponyrooms: 'parlour',
    bree: 'inn',
    breeroad: 'west',
  }[beat.zone];
  await checkpoint(page, beat.zone, entry, flags);
}
async function begin(page, key) {
  const cue = await page.evaluate(
    (key) =>
      window.__game.scene.getScene('WorldScene').zone.interactions.find((p) => p.dialogue === key),
    key,
  );
  await walk(page, cue.x, cue.y);
  await press(page);
}
async function line(page, index) {
  for (let n = 0; n < 35; n++) {
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
      null,
      { timeout: 45000 },
    );
    const reached = await page.evaluate((index) => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.dialogIndex === index && !s.typing;
    }, index);
    if (reached) return;
    await press(page);
  }
  throw new Error(`Did not reach dialogue line ${index}`);
}
async function observe(page) {
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('WorldScene'),
      zone = s.zoneKey;
    const cast = [s.player, ...s.followers, ...Object.values(s.bree.actors)];
    if (s.bree.bill) cast.push(s.bree.bill);
    window.__stageMotion = { maxSpeed: 0, moved: {}, samples: 0 };
    let previous, time;
    const sample = () => {
      if (!s.sys.isActive() || s.zoneKey !== zone) return;
      const now = performance.now();
      const next = cast.map((p) => ({ x: p.x, y: p.y, visible: p.visible && p.alpha > 0.01 }));
      if (previous && now > time)
        next.forEach((p, i) => {
          if (!p.visible || !previous[i].visible) return;
          const distance = Math.hypot(p.x - previous[i].x, p.y - previous[i].y),
            key = cast[i] === s.player ? 'frodo' : cast[i].getData('key') || 'bill';
          window.__stageMotion.maxSpeed = Math.max(
            window.__stageMotion.maxSpeed,
            (distance * 1000) / (now - time),
          );
          window.__stageMotion.moved[key] = (window.__stageMotion.moved[key] || 0) + distance;
        });
      previous = next;
      time = now;
      window.__stageMotion.samples++;
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}
async function smooth(page) {
  await page.waitForTimeout(250);
  const motion = await page.evaluate(() => window.__stageMotion);
  expect(motion.maxSpeed, JSON.stringify(motion)).toBeLessThan(230);
  return motion;
}

test('Butterbur enters, hands over a letter, and an interrupted reading is recoverable', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors = watchErrors(page);
  await boot(page, 'bree_strider');
  await observe(page);
  await begin(page, 'bree_strider');
  await line(page, 3);
  expect(
    await page.evaluate(() => {
      const b = window.__game.scene.getScene('WorldScene').bree;
      return b.actors.butterbur.visible;
    }),
  ).toBe(true);
  await dialogue(page);
  expect((await smooth(page)).moved.butterbur).toBeGreaterThan(50);
  await begin(page, 'bree_letter');
  await line(page, 1);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').storyBeat?.prompt),
  ).toBe('Open the letter');
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').bree.letter?.visible),
  ).toBe(true);
  await press(page);
  await reload(page, 'ponyparlour');
  expect(await page.evaluate(() => !!window.__state.flags.gandalfLetter)).toBe(false);
  await begin(page, 'bree_letter');
  await dialogue(page);
  await flag(page, 'gandalfLetter');
  expect(
    await page.evaluate(
      () => window.__game.scene.getScene('WorldScene').bree.actors.butterbur.visible,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test('Merry and Nob enter through the doorway and return the party without a position snap', async ({
  page,
}) => {
  test.setTimeout(90000);
  await boot(page, 'bree_merry');
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').bree.actors.nob.visible),
  ).toBe(false);
  await begin(page, 'bree_merry');
  await observe(page);
  await dialogue(page);
  await flag(page, 'breeMerryReturned');
  const motion = await smooth(page);
  expect(motion.moved.merry).toBeGreaterThan(100);
  expect(
    await page.evaluate(() =>
      window.__game.scene
        .getScene('WorldScene')
        .followers.every((p) => p.visible && !p.getData('held') && p.angle === 0),
    ),
  ).toBe(true);
  await reload(page, 'ponyparlour');
  expect(
    await page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').followers.every((p) => p.visible),
    ),
  ).toBe(true);
});

test('decoys require help, the party lies down, and Continue replays an unfinished night', async ({
  page,
}) => {
  test.setTimeout(180000);
  await boot(page, 'bree_decoys');
  await begin(page, 'bree_decoys');
  await line(page, 1);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').storyBeat?.prompt),
  ).toBe('Lay the first decoy');
  await dialogue(page);
  await flag(page, 'breeDecoys');
  await boot(page, 'bree_watch');
  await begin(page, 'bree_watch');
  await line(page, 1);
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return [s.player, ...s.followers].every((p) => Math.abs(p.angle) === 90);
    }),
  ).toBe(true);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').bree.night.alpha),
  ).toBeGreaterThan(0.7);
  await reload(page, 'ponyparlour');
  expect(await page.evaluate(() => !!window.__state.flags.breeMorning)).toBe(false);
  await begin(page, 'bree_watch');
  await observe(page);
  await dialogue(page);
  await flag(page, 'breeMorning');
  await smooth(page);
  expect(
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('WorldScene');
      return [s.player, ...s.followers].every((p) => p.angle === 0) && s.player.body.enable;
    }),
  ).toBe(true);
});

test('Bill is loaded visibly and the apple and departure move the travelling company', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors = watchErrors(page);
  await boot(page, 'bree_bill');
  await begin(page, 'bree_bill');
  await line(page, 2);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').storyBeat?.prompt),
  ).toBe('Load Bill’s packs');
  expect(
    await page.evaluate(
      () => !!window.__game.scene.getScene('WorldScene').bree.bill.getData('loaded'),
    ),
  ).toBe(false);
  await observe(page);
  await dialogue(page);
  await flag(page, 'striderJoined');
  expect(
    await page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').bree.bill.getData('loaded'),
    ),
  ).toBe(true);
  await smooth(page);
  await boot(page, 'bree_depart');
  await begin(page, 'bree_depart');
  await line(page, 1);
  expect(
    await page.evaluate(() => window.__game.scene.getScene('WorldScene').storyBeat?.prompt),
  ).toBe('Let Sam throw');
  await observe(page);
  await dialogue(page);
  await flag(page, 'chapter4Complete');
  const motion = await smooth(page);
  expect(motion.moved.frodo).toBeGreaterThan(200);
  expect(motion.moved.strider).toBeGreaterThan(150);
  expect(errors).toEqual([]);
});

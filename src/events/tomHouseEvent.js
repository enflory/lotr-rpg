import { gameState, setObjective } from '../state/GameState.js';
import { nextHouseBeat, houseObjective } from '../state/tomHouseProgress.js';
import { tween, move, walk } from './storyMotion.js';

const pause = (s, ms) => new Promise((resolve) => s.time.delayedCall(ms, resolve));
const party = (s) => [s.player, ...s.followers];
const actor = (s, key, x, y) =>
  s.add
    .sprite(x * 16 + 8, y * 16, key, 1)
    .setData('key', key)
    .setScale(1.15)
    .setDepth(y * 16);
function lock(s) {
  s.player.setVelocity(0);
  s.player.body.enable = false;
  party(s).forEach((p) => p.setData('held', true));
  s.hintIcon.setVisible(false);
  s.journey.markers.forEach(({ dot }) => dot.setVisible(false));
  s.journey.house.cue.setVisible(false);
  s.journey.house.cueText.setVisible(false);
  s.cameras.main.stopFollow();
}
function beat(s, run) {
  lock(s);
  const b = { busy: true };
  s.storyBeat = b;
  run().then(() => {
    if (s.storyBeat === b) b.busy = false;
  });
}
function focus(s, x, y) {
  s.cameras.main.pan(x * 16, y * 16, 1000, 'Sine.easeInOut');
}
async function gather(s) {
  const spots = [
    [17, 12],
    [16, 12],
    [15, 12],
    [14, 12],
  ];
  await Promise.all(party(s).map((p, i) => walk(s, p, ...spots[i], 95)));
}
async function hearth(s) {
  const h = s.journey.house;
  focus(s, 13, 8);
  await Promise.all([
    ...party(s).map((p, i) => walk(s, p, 10 + i * 2, 6, 90)),
    walk(s, h.tom, 8, 5, 100),
    walk(s, h.goldberry, 20, 6, 90),
  ]);
  party(s).forEach((p) => p.play(`${p.getData('key') || 'frodo'}-idle-left`));
  h.tom.play('tom-idle-right');
}
async function supper(s) {
  const h = s.journey.house;
  focus(s, 13, 9);
  const seats = [
    [10, 11, 'up'],
    [13, 11, 'up'],
    [16, 11, 'up'],
    [10, 7, 'down'],
    [13, 7, 'down'],
    [16, 7, 'down'],
  ];
  await Promise.all(
    [...party(s), h.tom, h.goldberry].map(async (p, i) => {
      const [x, y, dir] = seats[i];
      await walk(s, p, x, y, 95);
      p.play(`${p.getData('key') || 'frodo'}-idle-${dir}`);
      await tween(s, p, { y: p.y + (i < 3 ? -4 : 6) }, 300);
      p.setCrop(0, 0, 16, 19);
    }),
  );
}
function paintDream(s, second) {
  const h = s.journey.house,
    g = h.dream;
  g.clear();
  const r = (x, y, w, hh, c) => g.fillStyle(c).fillRect(348 + x, 264 + y, w, hh);
  r(-2, -2, 268, 110, 0xb7aa79);
  r(0, 0, 264, 106, second ? 0xabc5b5 : 0x25384b);
  if (second) {
    r(0, 50, 264, 56, 0x5d8752);
    r(0, 65, 264, 41, 0x759b56);
    for (let i = 0; i < 8; i++) r(i * 37, 53 + (i % 3) * 7, 46, 12, 0x91ac67);
    r(205, 16, 20, 20, 0xe8dca2);
    r(200, 21, 30, 10, 0xe8dca2);
    r(0, 87, 264, 19, 0x99b273);
  } else {
    for (let i = 0; i < 16; i++) r((i * 47) % 264, 10 + ((i * 17) % 42), 2, 1, 0xc5ccba);
    r(96, 29, 42, 77, 0x151e2b);
    r(99, 24, 7, 9, 0x151e2b);
    r(113, 24, 7, 9, 0x151e2b);
    r(128, 24, 7, 9, 0x151e2b);
    r(116, 14, 5, 10, 0x879a9a);
    r(114, 24, 9, 4, 0x6a8287);
    r(119, 31, 2, 70, 0x394c59);
    r(0, 94, 264, 12, 0x1a2935);
  }
  h.dreamVeil.setVisible(second).setAlpha(0.7);
  h.wings.setVisible(!second).setPosition(375, 295);
  if (!second)
    s.tweens.add({ targets: h.wings, x: 590, y: 278, duration: 3500, ease: 'Sine.easeInOut' });
  else s.tweens.add({ targets: h.dreamVeil, alpha: 0, duration: 3000 });
}
async function sleep(s) {
  const h = s.journey.house;
  focus(s, 11, 14);
  await Promise.all(
    party(s).map(async (p, i) => {
      p.setCrop();
      await walk(s, p, 5 + i * 3, 14, 90);
      p.play(`${p.getData('key') || 'frodo'}-idle-down`);
      await move(s, p, { x: (5 + i * 3) * 16 + 8, y: 15 * 16 + 3 }, 60);
      p.setCrop(0, 0, 16, 12);
      await tween(s, h.blankets[i], { alpha: 1 }, 350);
    }),
  );
  await tween(s, h.night, { alpha: 0.72 }, 1100);
  await pause(s, 650);
  paintDream(s, h.secondNight);
  await tween(s, h.dream, { alpha: 1 }, 1000);
}
async function wake(s) {
  const h = s.journey.house;
  await tween(s, [h.dream, h.wings, h.dreamVeil], { alpha: 0 }, 900);
  await tween(s, h.night, { alpha: 0 }, 1200);
  await Promise.all(
    party(s).map(async (p, i) => {
      await tween(s, h.blankets[i], { alpha: 0 }, 400);
      p.setCrop();
      await move(s, p, { x: (5 + i * 3) * 16 + 8, y: 14 * 16 }, 60);
    }),
  );
}
async function closeBeat(s) {
  const h = s.journey.house;
  h.closing = true;
  lock(s);
  s.storyBeat = { busy: true };
  s.journey.ring.setVisible(false).setAlpha(0);
  s.player.setData('cinematicAlpha', null).setAlpha(1);
  [...party(s), h.tom, h.goldberry].forEach((p) => p.setCrop());
  // Walk out of the tableau before handing the party back to the player.
  await Promise.all([gather(s), walk(s, h.tom, 7, 5, 110), walk(s, h.goldberry, 21, 7, 90)]);
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  party(s).forEach((p) => p.setData('held', false));
  s.trail = party(s).map((p) => ({ x: p.x, y: p.y }));
  s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
  h.active = false;
  h.closing = false;
  s.storyBeat = null;
  refresh(s);
  s.checkpoint();
}
function refresh(s) {
  const h = s.journey.house,
    f = gameState.flags,
    next = nextHouseBeat(f);
  const p = s.zone.interactions.find((p) => p.dialogue === next);
  setObjective(houseObjective(f));
  h.cue.setVisible(!!p);
  h.cueText.setVisible(!!p);
  if (p) {
    h.cue.setPosition(p.x * 16 + 8, p.y * 16 - 13);
    h.cueText.setText(
      `NEXT · ${p.dialogue === 'house_bed' && f.houseRing ? 'The second night' : p.label}`,
    );
  }
  for (const { p: point, dot } of s.journey.markers) dot.setVisible(point.dialogue === next);
  h.night.setAlpha(
    f.houseRested || f.learnedSong
      ? 0
      : f.houseRing || (f.houseSupper && !f.houseNightOne)
        ? 0.18
        : 0,
  );
  h.rain.forEach((p) =>
    p.setVisible(!!f.houseNightOne && !f.houseRing && !f.houseRested && !f.learnedSong),
  );
}
export function createTomHouse(s) {
  const tom = actor(s, 'tom', 7, 5),
    goldberry = actor(s, 'goldberry', 21, 7);
  const night = s.add
    .rectangle(480, 360, 320, 240, 0x142340, 1)
    .setAlpha(0)
    .setScrollFactor(0)
    .setDepth(820);
  const rain = [];
  for (let i = 0; i < 10; i++) {
    const p = s.add
      .rectangle(19 * 16 + 3 + ((i * 7) % 13), 3 * 16 + 3 + ((i * 3) % 10), 1, 3, 0xc5d9df, 0.7)
      .setDepth(820)
      .setVisible(false);
    s.tweens.add({ targets: p, y: p.y + 5, duration: 500 + i * 40, repeat: -1 });
    rain.push(p);
  }
  s.journey.ring = s.add
    .circle(0, 0, 2)
    .setStrokeStyle(1, 0xebcc59)
    .setDepth(850)
    .setVisible(false);
  const blankets = party(s).map((_, i) =>
    s.add
      .rectangle((5 + i * 3) * 16 + 8, 15 * 16 + 7, 13, 12, 0x798776, 1)
      .setAlpha(0)
      .setDepth(280),
  );
  const dream = s.add.graphics().setScrollFactor(0).setDepth(900).setAlpha(0);
  const dreamVeil = s.add
    .rectangle(480, 317, 264, 106, 0xc1c7c3, 1)
    .setAlpha(0)
    .setScrollFactor(0)
    .setDepth(902);
  const wings = s.add.graphics().setScrollFactor(0).setDepth(901).setVisible(false);
  wings.fillStyle(0x99a8a4).fillRect(-8, 0, 16, 2).fillRect(-12, -2, 7, 2).fillRect(5, -2, 7, 2);
  const cue = s.add
    .text(0, 0, '▼', { fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#f2d782' })
    .setOrigin(0.5)
    .setDepth(910);
  const cueText = s.add
    .text(334, 252, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '5px',
      color: '#f2d782',
      backgroundColor: '#242b24',
      padding: { x: 4, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(910);
  s.tweens.add({ targets: cue, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
  s.journey.house = {
    tom,
    goldberry,
    night,
    rain,
    blankets,
    dream,
    dreamVeil,
    wings,
    cue,
    cueText,
    active: false,
    closing: false,
  };
  refresh(s);
}
export function updateTomHouse(s) {
  const h = s.journey.house;
  if (h.active) {
    if (!s.dialogActive && !h.closing) closeBeat(s);
    return;
  }
  refresh(s);
}
export function tomHouseDialogue(s) {
  const h = s.journey.house,
    key = s.dialogKey,
    page = s.dialogIndex;
  if (!key.startsWith('house_')) return;
  h.active = true;
  if (page === 0) h.secondNight = !!gameState.flags.houseNightOne;
  beat(s, async () => {
    if (key === 'house_welcome') {
      focus(s, 16, 10);
      if (page === 0) await Promise.all([walk(s, h.goldberry, 20, 10, 80), gather(s)]);
      else await tween(s, h.goldberry, { y: h.goldberry.y - 2, yoyo: true }, 350);
    } else if (key === 'house_supper') {
      if (page === 0) await supper(s);
      else await tween(s, h.tom, { y: h.tom.y - 2, yoyo: true }, 350);
    } else if (key === 'house_bed') {
      if (page === 0) await sleep(s);
      else await wake(s);
    } else if (key === 'house_stories') {
      if (page === 0) await hearth(s);
      else await tween(s, h.tom, { angle: 5, yoyo: true }, 400);
    } else if (key === 'house_ring') {
      const ring = s.journey.ring;
      if (page === 0) {
        await hearth(s);
        ring
          .setPosition(s.player.x + 5, s.player.y - 2)
          .setVisible(true)
          .setAlpha(1);
        await tween(s, ring, { x: h.tom.x + 7, y: h.tom.y - 2 }, 1300);
        await tween(s, h.tom, { angle: -5, yoyo: true }, 500);
      } else if (page === 1) {
        await tween(s, ring, { x: s.player.x + 5, y: s.player.y - 2 }, 1300);
        s.player.setData('cinematicAlpha', 0.25);
        await tween(s, s.player, { alpha: 0.25 }, 700);
      } else {
        await tween(s, ring, { x: s.player.x, y: s.player.y + 4, alpha: 0 }, 650);
        ring.setVisible(false);
        s.player.setData('cinematicAlpha', null);
        await tween(s, s.player, { alpha: 1 }, 650);
      }
    } else if (key === 'house_farewell') {
      focus(s, 17, 13);
      if (page === 0) await Promise.all([gather(s), walk(s, h.tom, 19, 14, 100)]);
      else await tween(s, h.tom, { angle: 5, yoyo: true }, 350);
    }
  });
}

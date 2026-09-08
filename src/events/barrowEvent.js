// The Barrow-downs set piece: the mist on the hills, the dark under the stone
// and the morning after. Only completed dialogue beats are saved; every
// animation here is transient, so Continue replays it from its checkpoint.
import { gameState, setFlag } from '../state/GameState.js';
import { T } from '../data/tileTypes.js';
import { tween, move, walk } from './storyMotion.js';
import {
  drawDownsRelief,
  drawDownsFeatures,
  drawBarrowInterior,
  drawBarrowhillScenery,
} from '../art/downsScenery.js';
import { playMusic, sfx } from '../audio/sound.js';

const at = (x, y) => ({ x: x * 16 + 8, y: y * 16 });
const friend = (s, key) => s.followers.find((p) => p.getData('key') === key);
const SLEEPERS = ['sam', 'pippin', 'merry'];
// The gate stones, and the hollow beyond them where the mist takes Frodo.
const GATE = { x: 53, y: 12 };
const BEYOND = { x: 61, y: 9 };

function actor(scene, key, x, y, scale = 1) {
  return scene.add
    .sprite(x * 16 + 8, y * 16, key, 1)
    .setScale(scale)
    .setDepth(y * 16);
}

function pony(scene, x, y, color = 0x79533a) {
  const g = scene.add.graphics().setDepth(y * 16);
  const px = x * 16,
    py = y * 16;
  g.fillStyle(0x19201a).fillRect(px - 10, py - 6, 24, 10);
  g.fillStyle(color)
    .fillRect(px - 9, py - 5, 21, 8)
    .fillRect(px + 8, py - 13, 6, 10);
  g.fillStyle(0x302c24)
    .fillRect(px - 7, py + 3, 3, 7)
    .fillRect(px + 7, py + 3, 3, 7);
  g.fillStyle(0xc8ac77).fillRect(px - 4, py - 6, 11, 7);
  g.fillStyle(0x181c18)
    .fillRect(px + 9, py - 15, 2, 3)
    .fillRect(px + 13, py - 15, 2, 3);
  g.fillStyle(0xe0d8b5).fillRect(px + 12, py - 11, 1, 1);
  return g;
}

/* ── story beats ──────────────────────────────────────────────────────────
   Identical contract to the Willow: the beat owns the player until it ends,
   and a prompt turns the page into an action the player must choose to take. */
function freeze(s) {
  s.journey.downs.active = true;
  s.player.setVelocity(0);
  s.player.body.enable = false;
  for (const p of s.followers) p.setData('held', true);
}
function beat(s, run = null, prompt = '') {
  freeze(s);
  const b = { busy: false, prompt, action: null };
  s.storyBeat = b;
  const execute = async () => {
    b.busy = true;
    b.prompt = '';
    try {
      await run();
    } catch (err) {
      // A broken tableau must never freeze the game: drop the staging and let
      // the page — or, outside a dialogue, the player — carry on regardless.
      console.error('barrow beat failed', err);
    }
    if (s.storyBeat !== b) return;
    b.busy = false;
    if (prompt) s.advanceDialogue();
    else if (!s.dialogActive) releaseControl(s);
  };
  if (prompt) b.action = execute;
  else if (run) execute();
}
function releaseControl(s) {
  const d = s.journey.downs,
    f = gameState.flags;
  d.active = false;
  s.storyBeat = null;
  s.player.setAngle(0).setTint(0xffffff).setAlpha(1);
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  const hidden = heldKeys(s, f);
  for (const p of s.followers) {
    const held = hidden.includes(p.getData('key'));
    p.setData('held', held).setVisible(!held);
    if (!held) p.setAngle(0).setCrop().setAlpha(1);
  }
  // Seed the trail from the visible formation rather than snapping anyone.
  s.trail = [s.player, ...s.followers].map((p) => ({ x: p.x, y: p.y }));
  s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
}
// Who is out of sight, by flag alone — the single source of truth for both
// the live scene and everything Continue has to rebuild.
function heldKeys(s, f) {
  if (s.zoneKey === 'barrow') return SLEEPERS;
  if (s.zoneKey === 'downs' && f.downsSeparated) return SLEEPERS;
  return [];
}
function applyHeld(s, f) {
  const hidden = heldKeys(s, f);
  for (const p of s.followers) {
    const held = hidden.includes(p.getData('key'));
    p.setData('held', held).setVisible(!held);
    if (held) p.getData('fernOverlay')?.setVisible(false);
  }
}

/* ── the downs ────────────────────────────────────────────────────────────*/
function buildFog(s) {
  const d = s.journey.downs;
  d.fog = s.add.graphics().setScrollFactor(0).setDepth(840).setAlpha(0);
  // A roof of mist drawn over the whole view, thinning to arm's length.
  for (let y = 0; y < 240; y += 4)
    for (let x = 0; x < 320; x += 4) {
      const dist = Math.hypot((x - 160) / 1.15, y - 120);
      const alpha = Math.min(0.93, Math.max(0, (dist - 24) / 100));
      d.fog.fillStyle(0xc1cac5, alpha).fillRect(320 + x, 240 + y, 4, 4);
    }
  d.mist = [];
  for (let i = 0; i < 18; i++) {
    const band = s.add
      .ellipse(325 + ((i * 43) % 310), 250 + ((i * 31) % 220), 66 + (i % 4) * 26, 9, 0xdde4dc, 0.12)
      .setScrollFactor(0)
      .setDepth(841)
      .setAlpha(0);
    s.tweens.add({
      targets: band,
      x: band.x + 34,
      duration: 4300 + i * 123,
      yoyo: true,
      repeat: -1,
    });
    d.mist.push(band);
  }
  // The lost voices: a pale drift that only shows itself when the player has
  // strayed well off the chalk, and always leans toward the next landmark.
  d.wisp = s.add.ellipse(0, 0, 9, 5, 0xe8f0e2, 0.5).setDepth(845).setAlpha(0);
  s.tweens.add({ targets: d.wisp, scaleY: 1.5, duration: 900, yoyo: true, repeat: -1 });
}

export function createDowns(s) {
  const f = gameState.flags;
  const d = (s.journey.downs = /** @type {any} */ ({ active: false, nudge: 0, stray: 0 }));
  buildFog(s);
  d.fog.setAlpha(f.downsFog ? 1 : 0);
  for (const band of d.mist) band.setAlpha(f.downsFog ? 1 : 0);
  // Daylight drains out of the downs with the mist and never comes back.
  d.gloom = s.add
    .rectangle(480, 360, 320, 240, 0x4c5f6b)
    .setScrollFactor(0)
    .setDepth(835)
    .setAlpha(f.downsFog ? 0.3 : 0);
  d.night = s.add
    .rectangle(480, 360, 320, 240, 0x000000)
    .setScrollFactor(0)
    .setDepth(880)
    .setAlpha(0);
  // A cold gleam on the gate stones: visible only once the mist is down, and
  // the one thing in the whole white-out that says which way is on.
  d.beacon = s.add
    .ellipse(GATE.x * 16 + 8, GATE.y * 16 + 4, 34, 50, 0xdfe7d8)
    .setDepth(843)
    .setAlpha(0);
  // The one instruction the downs ever give you, given once, on arrival.
  if (!f.downsFog && s.entryKey === 'west')
    s.showBanner('A chalk track runs east\nover the green downs.');
}

export function updateDowns(s, delta) {
  const d = s.journey.downs,
    f = gameState.flags;
  if (d.active && !s.dialogActive) releaseControl(s);
  if (!d.active) applyHeld(s, f);
  // The fog is raised by the sleep beat and held up by the flag afterwards,
  // so a reload during the beat simply finds clear noon again and replays it.
  if (f.downsFog) {
    const step = Math.min(1, delta / 2600);
    d.fog.setAlpha(d.fog.alpha + (1 - d.fog.alpha) * step);
    d.gloom.setAlpha(d.gloom.alpha + (0.3 - d.gloom.alpha) * step);
    for (const band of d.mist) band.setAlpha(d.fog.alpha);
  }
  if (f.downsFog && !d.music) {
    d.music = true;
    playMusic('barrow');
  }
  const tx = s.player.x / 16,
    ty = (s.player.y + 8) / 16;
  // Checkpoints follow the story, not the doorway you came in by, and they are
  // taken on *reaching* a landmark: being interrupted inside the sleep or the
  // separation should cost a step, not the whole crossing.
  if (d.saved !== 'gate') {
    const atStone = Math.hypot(tx - 28, ty - 22) < 4;
    const atGate = f.downsFog && Math.hypot(tx - GATE.x, ty - GATE.y) < 5;
    const want = f.downsSeparated || atGate ? 'gate' : f.downsFog || atStone ? 'stone' : d.saved;
    if (want && want !== d.saved) {
      d.saved = want;
      s.checkpoint(want);
    }
  }
  if (s.storyBeat || s.dialogActive) return;

  const goal = f.downsSeparated ? BEYOND : f.downsFog ? GATE : { x: 28, y: 22 };
  // Off the track and out of ideas: the voices drift into view ahead of you.
  const onTrack = nearTrack(s, tx, ty);
  d.stray = onTrack || !f.downsFog ? 0 : d.stray + delta;
  const show = d.stray > 4000;
  const gateDist = Math.hypot(tx - GATE.x, ty - GATE.y);
  // Once he is through, the stones are behind him and must stop calling him
  // back; from there the wisp and the banner are the only cues, and they agree.
  d.beacon.setAlpha(
    f.downsFog && !f.downsSeparated
      ? Math.max(0, 0.34 - gateDist / 60) * (0.7 + 0.3 * Math.sin(s.time.now / 700))
      : 0,
  );
  const angle = Math.atan2(goal.y - ty, goal.x - tx);
  d.wisp
    .setPosition(s.player.x + Math.cos(angle) * 34, s.player.y - 6 + Math.sin(angle) * 34)
    .setAlpha(show ? 1 : 0);
  d.nudge -= delta;
  if (f.downsFog && !f.barrowTaken && d.stray > 12000 && d.nudge <= 0) {
    d.nudge = 18000;
    d.stray = 0;
    s.showBanner(
      f.downsSeparated
        ? 'The voices call from the north-east.'
        : 'Two stones stand somewhere ahead,\nnorth-east along the chalk.',
    );
  }
  // The scarp has one gap in it, so simply being near the gate is enough:
  // there is no route north that does not come within a tile of the stones.
  if (f.downsFog && !f.downsSeparated && gateDist < 4.2) s.startDialogue('downs_gate');
  else if (f.downsSeparated && !f.barrowTaken && Math.hypot(tx - BEYOND.x, ty - BEYOND.y) < 3.5)
    s.startDialogue('downs_voices');
  if (f.barrowTaken) s.goToZone('barrow', 'default');
}
function nearTrack(s, tx, ty) {
  const map = s.zone.map;
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++)
      if (map[Math.round(ty) + dy]?.[Math.round(tx) + dx] === T.CHALK) return true;
  return false;
}

/* ── under the stone ──────────────────────────────────────────────────────*/
// The hand is a real crawling thing, and has to read as one at a glance: a
// severed forearm walking on four fingers and a thumb, bone-pale against the
// dark floor, dragging its own shadow. It is drawn pointing east and rotated
// to face wherever it is going, which is always Frodo.
function makeHand(s) {
  const outline = 0x151d18,
    flesh = 0xa8bda2,
    lit = 0xd3e2ca,
    nail = 0xf0f4e4;
  const arm = s.add.graphics();
  const r = (x, y, w, h, col) => arm.fillStyle(col).fillRect(x, y, w, h);
  // Torn wrist, then the back of the hand, in silhouette then in light.
  r(-24, -8, 20, 16, outline);
  r(-22, -6, 17, 12, 0x6f7f6b);
  r(-22, -6, 17, 4, 0x93a58c);
  r(-24, -5, 3, 10, 0x4a2f2c);
  r(-23, -3, 2, 5, 0xbcae9a);
  // Palm: narrow at the wrist, widening to the knuckles, corners knocked off
  // so the silhouette is a hand and not a box.
  r(-8, -8, 4, 16, outline);
  r(-5, -10, 6, 20, outline);
  r(1, -12, 11, 24, outline);
  r(-7, -6, 3, 12, flesh);
  r(-4, -8, 5, 16, flesh);
  r(1, -10, 9, 20, flesh);
  r(-7, -6, 3, 4, lit);
  r(-4, -8, 5, 5, lit);
  r(1, -10, 9, 6, lit);
  r(2, -3, 7, 2, 0x86997f);
  r(2, 2, 7, 2, 0x86997f);
  const container = s.add.container(0, 0, []);
  const shadow = s.add.ellipse(-2, 12, 40, 10, 0x080f0c, 0.45);
  container.add(shadow);
  container.add(arm);
  // Five digits, each its own object so they can pull the arm along.
  const fingers = [];
  for (let i = 0; i < 5; i++) {
    const thumb = i === 4;
    const f = s.add.graphics();
    const len = thumb ? 9 : 13 - Math.abs(i - 1) * 2;
    f.fillStyle(outline).fillRect(-1, -3, len + 3, 6);
    f.fillStyle(flesh).fillRect(0, -2, len + 1, 4);
    f.fillStyle(lit).fillRect(0, -2, len + 1, 1);
    f.fillStyle(0x86997f).fillRect(Math.round(len * 0.55), -2, 1, 4);
    f.fillStyle(nail).fillRect(len - 1, -2, 2, 3);
    f.setPosition(thumb ? 1 : 9, thumb ? -10 : -6 + i * 4);
    if (thumb) f.setRotation(-0.9);
    fingers.push(f);
    container.add(f);
  }
  container.setDepth(300).setScale(0.85);
  return { container, fingers, arm, shadow };
}
export function createBarrow(s) {
  const f = gameState.flags;
  const b = (s.journey.downs = /** @type {any} */ ({ active: false, barrow: true }));
  drawBarrowInterior(s);
  // The three of them laid out in a row with their heads to the west: a slab
  // apiece, white grave-clothes over the body, the head still their own face,
  // a gold circlet across the brow and one long sword over all three necks.
  b.sleepers = SLEEPERS.map((key, i) => {
    const x = (13 + i * 2) * 16 + 8,
      y = 11 * 16;
    const slab = s.add.graphics().setDepth(y - 6);
    slab.fillStyle(0x3c463c).fillRect(x - 11, y - 13, 22, 30);
    slab.fillStyle(0x55604f).fillRect(x - 10, y - 12, 20, 28);
    slab.fillStyle(0x6b7663).fillRect(x - 10, y - 12, 20, 1);
    const body = actor(s, key, (x - 8) / 16, 11)
      .setTint(0xa8cfae)
      .setDepth(y);
    const shroud = s.add.graphics().setDepth(y + 1);
    shroud.fillStyle(0xd9dfcb).fillRect(x - 7, y - 4, 14, 15);
    shroud.fillStyle(0xeff3e4).fillRect(x - 7, y - 4, 14, 2);
    shroud.fillStyle(0xc3cab2).fillRect(x - 7, y + 5, 14, 1);
    // Hands folded on the breast, over the linen.
    shroud.fillStyle(0xb7c9b4).fillRect(x - 4, y + 1, 8, 3);
    const circlet = s.add.rectangle(x, y - 11, 13, 3, 0xd8bd61).setDepth(y + 2);
    s.add.rectangle(x - 3, y - 11, 3, 3, 0xf6e6a2).setDepth(y + 3);
    return { slab, shroud, body, circlet };
  });
  b.sword = s.add.graphics().setDepth(11 * 16 + 4);
  b.sword.fillStyle(0x5c6656).fillRect(12 * 16 + 6, 11 * 16 - 4, 88, 5);
  b.sword.fillStyle(0xb9ceb2).fillRect(12 * 16 + 6, 11 * 16 - 5, 88, 3);
  b.sword.fillStyle(0xe4efdd).fillRect(12 * 16 + 6, 11 * 16 - 5, 88, 1);
  b.sword.fillStyle(0x8b7541).fillRect(12 * 16 + 1, 11 * 16 - 9, 7, 12);
  b.sword.fillStyle(0xd8bd61).fillRect(12 * 16 + 2, 11 * 16 - 8, 5, 3);
  // The singer at the far end: a cold shape that is never quite resolved.
  b.wight = s.add
    .graphics()
    .setDepth(9 * 16)
    .setAlpha(f.barrowCourage ? 0 : 0.6);
  const wx = 26 * 16,
    wy = 8 * 16;
  b.wight.fillStyle(0x13291f).fillRect(wx - 3, wy, 30, 80);
  b.wight.fillStyle(0x1e4436).fillRect(wx, wy + 3, 24, 74);
  b.wight.fillStyle(0x2b6249).fillRect(wx + 4, wy + 8, 16, 60);
  b.wight.fillStyle(0x0d1c16).fillRect(wx + 3, wy + 10, 18, 12);
  b.wight.fillStyle(0x9ce6bd).fillRect(wx + 6, wy + 14, 4, 4);
  b.wight.fillStyle(0x9ce6bd).fillRect(wx + 14, wy + 14, 4, 4);
  b.wight.fillStyle(0x1e4436).fillRect(wx - 8, wy + 26, 10, 34);
  b.wight.fillStyle(0x1e4436).fillRect(wx + 22, wy + 26, 10, 34);
  s.tweens.add({ targets: b.wight, y: -4, duration: 2600, yoyo: true, repeat: -1 });

  const hand = makeHand(s);
  b.hand = hand;
  if (f.barrowCourage) {
    // Struck off and lying still, fingers half curled, a stride short of Sam.
    hand.container
      .setPosition(19 * 16, 11 * 16 + 18)
      .setAngle(146)
      .setAlpha(0.7);
    hand.shadow.setRotation(-hand.container.rotation);
    hand.fingers.forEach((digit, i) => digit.setRotation(0.5 + i * 0.12));
  } else {
    hand.container.setPosition(30 * 16, 15 * 16);
    b.crawl = { phase: 0, pause: 0 };
  }
  s.add.rectangle(480, 360, 320, 240, 0x0d3326, 0.22).setScrollFactor(0).setDepth(820);
  b.dark = s.add
    .rectangle(480, 360, 320, 240, 0x000000)
    .setScrollFactor(0)
    .setDepth(860)
    .setAlpha(f.barrowWoke ? 0 : 1);
  // He wakes lying on his back where the dark put him down.
  if (!f.barrowWoke) s.player.setAngle(-90);
}

// Route the hand round the wall spur: east chamber, through the gap at y≈13,
// then straight down the chamber at whoever is standing in it.
function crawlTarget(s) {
  const hx = s.journey.downs.hand.container.x / 16;
  if (hx > 25) return { x: 25 * 16, y: 13.5 * 16 };
  return { x: s.player.x, y: s.player.y + 6 };
}
function updateHand(s, delta) {
  const b = s.journey.downs;
  const c = b.crawl;
  if (!c) return;
  const hand = b.hand,
    node = hand.container;
  c.phase += delta / 1000;
  const dest = crawlTarget(s);
  const dx = dest.x - node.x,
    dy = dest.y - node.y,
    dist = Math.hypot(dx, dy);
  node.setRotation(Math.atan2(dy, dx));
  // The shadow belongs to the floor, so it never turns with the arm.
  hand.shadow.setRotation(-node.rotation);
  node.setDepth(node.y + 4);
  // Fingers pull, then the arm drags after them: a two-stroke lurch.
  const stroke = Math.sin(c.phase * 3.4);
  hand.fingers.forEach((f, i) => {
    const thumb = i === 4;
    const reach = Math.max(0, stroke) * 5;
    f.x = (thumb ? 1 : 9) + reach;
    f.y = (thumb ? -10 : -6 + i * 4) + Math.sin(c.phase * 3.4 + i * 0.8) * 1.4;
    f.setRotation((thumb ? -0.9 : 0) + Math.sin(c.phase * 3.4 + i) * 0.3);
  });
  // The whole arm hunches as the fingers pull, then flattens as it drags.
  hand.arm.setScale(1 - Math.max(0, stroke) * 0.07, 1 + Math.max(0, stroke) * 0.09);
  hand.shadow.setScale(1 + Math.max(0, stroke) * 0.1);
  // It never quite arrives: within a pace it hesitates, then gathers again.
  if (dist < 26) {
    c.pause += delta;
    if (c.pause < 1400) return;
    if (c.pause > 2600) c.pause = 0;
    // Backing off along a zero-length vector would put NaN in the position and
    // lose the hand for the rest of the scene.
    if (dist > 0.01) node.x -= (dx / dist) * (delta / 30);
    return;
  }
  c.pause = 0;
  const speed = Math.max(0, stroke) * 26 + 5;
  node.x += ((dx / dist) * (speed * delta)) / 1000;
  node.y += ((dy / dist) * (speed * delta)) / 1000;
}

export function updateBarrow(s, delta) {
  const b = s.journey.downs,
    f = gameState.flags;
  if (b.active && !s.dialogActive) releaseControl(s);
  for (const p of s.followers) p.setData('held', true).setVisible(false);
  if (!s.storyBeat && !s.dialogActive) updateHand(s, delta);
  if (f.barrowTaken && !f.barrowWoke && !f.barrowCourage && !s.dialogActive && !s.storyBeat)
    s.startDialogue('barrow_wake');
  if (f.barrowRescued) s.goToZone('barrowhill', 'default');
}

/* ── the morning after ────────────────────────────────────────────────────*/
export function createBarrowhill(s) {
  const f = gameState.flags;
  const b = (s.journey.downs = /** @type {any} */ ({ active: false, hill: true }));
  // The blades stand in the turf only until Tom hands them out.
  drawBarrowhillScenery(s, !f.barrowBlades);
  b.tom = actor(s, 'tom', 27, 17, 1.15);
  // Tom whistles the ponies up over the shoulder of the hill during
  // `barrow_ponies`; until he has, there are no ponies standing on this hill.
  b.ponies = [];
  if (f.poniesRecovered)
    for (let i = 0; i < 6; i++)
      b.ponies.push(pony(s, 30 + i * 1.7, 20, i === 5 ? 0x9b8261 : 0x70513d));
  // Straight out of the barrow: the three of them are still lying on the turf.
  // Keyed off its own flag, because any checkpoint taken on this hill before
  // the blades — examining the mound, say — would otherwise replay the waking.
  b.rising = !f.hillRisen && s.entryKey === 'default';
  if (b.rising)
    for (const [i, key] of SLEEPERS.entries()) {
      const p = s.followers.find((q) => q.getData('key') === key);
      if (!p) continue;
      p.setPosition((14 + i * 2) * 16 + 8, 17 * 16)
        .setAngle(-90)
        .setTint(0xcfd8c4)
        .setDepth(17 * 16)
        .setData('held', true);
    }
}

export function updateBarrowhill(s) {
  const b = s.journey.downs;
  if (b.active && !s.dialogActive) releaseControl(s);
  if (b.rising && !b.woke && !s.dialogActive) {
    b.woke = true;
    // Nobody is teleported awake: they sit up, stand, and fall in behind.
    beat(s, async () => {
      s.cameras.main.stopFollow();
      s.cameras.main.pan(17 * 16, 17 * 16, 900, 'Sine.easeInOut');
      await Promise.all(
        SLEEPERS.map(async (key, i) => {
          const p = friend(s, key);
          if (!p) return;
          p.setVisible(true);
          await tween(s, p, { angle: -60, delay: i * 240 }, 500);
          await tween(s, p, { angle: 0, y: p.y - 4 }, 450);
          p.clearTint();
          p.play(`${key}-idle-down`, true);
        }),
      );
      await Promise.all(
        SLEEPERS.map((key, i) => {
          const p = friend(s, key);
          return p ? move(s, p, at(14 + i * 2, 18), 46) : null;
        }).filter(Boolean),
      );
      b.rising = false;
      setFlag('hillRisen');
      s.checkpoint();
      s.showBanner('Your companions wake in the sun.');
    });
  }
}

export function createEastroad(s) {
  s.journey.downs = /** @type {any} */ ({ active: false, road: true });
  s.journey.downs.tom = actor(s, 'tom', 14, 10, 1.15);
}
export function updateEastroad(s) {
  const b = s.journey.downs;
  if (b.active && !s.dialogActive) releaseControl(s);
  b.tom.setVisible(!gameState.flags.chapter3Complete);
}

export function barrowCreate(s) {
  drawDownsRelief(s);
  drawDownsFeatures(s);
  if (s.zoneKey === 'downs') createDowns(s);
  if (s.zoneKey === 'barrow') createBarrow(s);
  if (s.zoneKey === 'barrowhill') createBarrowhill(s);
  if (s.zoneKey === 'eastroad') createEastroad(s);
}
export function barrowUpdate(s, delta) {
  if (!s.journey.downs) return;
  if (s.zoneKey === 'downs') updateDowns(s, delta);
  if (s.zoneKey === 'barrow') updateBarrow(s, delta);
  if (s.zoneKey === 'barrowhill') updateBarrowhill(s);
  if (s.zoneKey === 'eastroad') updateEastroad(s);
}

/* ── the beats ────────────────────────────────────────────────────────────
   One page of dialogue, one piece of staging. None of these set a flag: the
   dialogue does that when it closes, so an interrupted scene simply replays. */
function gather(s, cx, cy, spread = 2) {
  return Promise.all([
    walk(s, s.player, cx, cy),
    ...s.followers.map((p, i) =>
      move(s, p, at(cx - spread - i, cy + (i % 2)), 70).then(() => p.setVisible(true)),
    ),
  ]);
}
function lie(s, sprite, tilt) {
  return tween(s, sprite, { angle: tilt, y: sprite.y + 3 }, 700);
}
function scatterPonies(s) {
  for (const [i, p] of (s.journey.ponies ?? []).entries())
    s.tweens.add({
      targets: p,
      x: p.x + (i % 2 ? 90 : -70),
      y: p.y - 40 - i * 8,
      alpha: 0,
      duration: 2200 + i * 180,
      ease: 'Sine.easeIn',
    });
}

function downsBeats(s, key, page, f) {
  const d = s.journey.downs;
  const party = [s.player, ...s.followers];
  // Every beat below is staged against the page of prose it plays under, so
  // the party sits down on the line that says they sit down.
  if (key === 'downs_stone' && !f.downsFog) {
    if (page === 0)
      beat(s, async () => {
        s.cameras.main.stopFollow();
        s.cameras.main.pan(28 * 16 + 8, 20 * 16, 1100, 'Sine.easeInOut');
        await gather(s, 28, 22);
      });
    else if (page === 1)
      // Out of the sun, in the shadow of the stone: they sit, and stay sitting.
      beat(s, () =>
        Promise.all(party.map((p, i) => tween(s, p, { y: p.y + 2, angle: i % 2 ? 8 : -8 }, 700))),
      );
    else if (page === 2)
      beat(s, async () => {
        // Noon heat. They lie back one by one, the light goes out of the day,
        // and somewhere in it the ponies wander off.
        await Promise.all(party.map((p, i) => lie(s, p, i % 2 ? 78 : -78)));
        await tween(s, d.gloom, { alpha: 0.42 }, 2400);
        scatterPonies(s);
      });
    else if (page === 3)
      beat(s, async () => {
        playMusic('barrow');
        await Promise.all([
          tween(s, d.fog, { alpha: 1 }, 2600),
          tween(s, d.mist, { alpha: 1 }, 2600),
          tween(s, d.gloom, { alpha: 0.3 }, 2600),
        ]);
        await Promise.all(party.map((p) => tween(s, p, { angle: 0, y: p.y - 5 }, 600)));
        s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
      });
  }
  if (key === 'downs_gate' && f.downsFog && !f.downsSeparated) {
    if (page === 0)
      beat(s, async () => {
        s.cameras.main.stopFollow();
        s.cameras.main.pan(GATE.x * 16 + 8, GATE.y * 16, 900, 'Sine.easeInOut');
        sfx.blip();
      });
    else if (page === 1)
      beat(s, async () => {
        // They go by him and on through, and the mist takes them in order.
        await Promise.all(
          s.followers.map(async (p, i) => {
            await move(s, p, at(GATE.x - 1 + i, GATE.y + 1), 58);
            await move(s, p, at(GATE.x + 1 + i, GATE.y - 2), 58);
            await tween(s, p, { alpha: 0, x: p.x + 22, y: p.y - 16 }, 1500);
            p.setVisible(false);
          }),
        );
      });
    else if (page === 2)
      beat(
        s,
        async () => {
          await walk(s, s.player, GATE.x, GATE.y + 1, 60);
          await move(s, s.player, at(GATE.x, GATE.y - 1), 44);
          s.player.setTint(0xb9c6cc);
          s.cameras.main.shake(400, 0.002);
          await tween(s, d.fog, { alpha: 1 }, 900);
          s.player.clearTint();
          s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
        },
        'Pass between the stones',
      );
  }
  if (key === 'downs_voices' && f.downsSeparated && !f.barrowTaken) {
    if (page === 0)
      beat(s, async () => {
        s.cameras.main.shake(600, 0.0015);
        await move(s, s.player, at(BEYOND.x + 1, BEYOND.y - 1), 96);
      });
    else if (page === 1)
      beat(s, async () => {
        // A shape leans over him out of the white: tall, and then everywhere.
        const shade = s.add
          .rectangle(s.player.x + 20, s.player.y - 30, 16, 4, 0x14231d, 0.9)
          .setDepth(880);
        sfx.sting();
        await tween(s, shade, { scaleX: 3.5, scaleY: 22, y: s.player.y - 22 }, 1200);
        s.player.setTint(0x8fa3ad);
        await tween(s, s.player, { x: s.player.x + 14, angle: 42 }, 700);
        await tween(s, shade, { alpha: 0.35 }, 400);
      });
    else if (page === 2) beat(s, () => tween(s, d.night, { alpha: 1 }, 1400));
  }
}

function barrowBeats(s, key, page, f) {
  const b = s.journey.downs;
  if (key === 'barrow_wake' && f.barrowTaken && !f.barrowWoke) {
    if (page === 0)
      beat(s, async () => {
        s.cameras.main.stopFollow();
        await tween(s, b.dark, { alpha: 0 }, 2200);
        await tween(s, s.player, { angle: 0, y: s.player.y - 4 }, 900);
        s.player.play('frodo-idle-up', true);
      });
    else if (page === 1)
      beat(s, async () => {
        // Along the row: three faces, three circlets.
        s.cameras.main.pan(15 * 16, 11 * 16, 1400, 'Sine.easeInOut');
        for (const sleeper of b.sleepers) await tween(s, sleeper.circlet, { alpha: 0.35 }, 240);
        for (const sleeper of b.sleepers) await tween(s, sleeper.circlet, { alpha: 1 }, 160);
      });
    else if (page === 2)
      beat(s, async () => {
        await tween(s, b.sword, { alpha: 0.4 }, 600);
        await tween(s, b.sword, { alpha: 1 }, 600);
      });
    else if (page === 3)
      beat(s, async () => {
        sfx.chant();
        await tween(s, b.wight, { alpha: 0.85 }, 1200);
        await tween(s, b.wight, { alpha: 0.5 }, 900);
        s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
      });
  }
  if (key === 'barrow_courage' && f.barrowTaken && !f.barrowCourage) {
    if (page === 0)
      beat(s, async () => {
        s.cameras.main.stopFollow();
        s.cameras.main.pan(17 * 16, 12 * 16, 900, 'Sine.easeInOut');
        await walk(s, s.player, 15, 13, 62);
        s.player.play('frodo-idle-up', true);
      });
    else if (page === 1)
      beat(s, async () => {
        // Round the corner of the wall spur, out of the dark end.
        b.crawl = b.crawl ?? { phase: 0, pause: 0 };
        await tween(s, b.hand.container, { x: 24 * 16, y: 13.5 * 16 }, 1500);
      });
    else if (page === 2)
      beat(s, async () => {
        // Past the sleepers, and on at him, in no hurry at all.
        await tween(s, b.hand.container, { x: 19 * 16, y: 12 * 16 }, 1700);
      });
    else if (page === 3)
      beat(
        s,
        async () => {
          const blade = s.add.graphics().setDepth(s.player.y + 20);
          blade.fillStyle(0xdcead5).fillRect(0, -2, 22, 3);
          blade.fillStyle(0x8b7541).fillRect(-6, -3, 7, 5);
          blade.setPosition(s.player.x + 4, s.player.y - 6);
          await tween(s, blade, { angle: -70, x: blade.x + 6 }, 260);
          sfx.crack();
          s.cameras.main.flash(220, 220, 240, 220);
          await tween(s, blade, { angle: 30, x: blade.x + 12, y: blade.y + 8 }, 160);
          b.crawl = null;
          const hand = b.hand.container;
          await tween(s, hand, { angle: 146, x: hand.x + 24, y: hand.y + 14 }, 340);
          b.hand.shadow.setRotation(-hand.rotation);
          b.hand.fingers.forEach((digit) =>
            s.tweens.add({ targets: digit, rotation: 0.6, duration: 500 }),
          );
          for (let n = 0; n < 3; n++)
            await tween(s, hand, { angle: hand.angle + (n % 2 ? 12 : -12) }, 120);
          await Promise.all([
            tween(s, hand, { alpha: 0.7 }, 500),
            tween(s, b.wight, { alpha: 0.18 }, 700),
            tween(s, blade, { alpha: 0 }, 700),
          ]);
          blade.destroy();
          sfx.chant();
          s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
        },
        'Take up the sword and strike',
      );
  }
  if (key === 'barrow_call' && f.barrowCourage && !f.barrowRescued) {
    if (page === 0)
      beat(s, async () => {
        s.cameras.main.stopFollow();
        s.cameras.main.pan(11 * 16, 13 * 16, 800, 'Sine.easeInOut');
        await walk(s, s.player, 10, 13, 62);
        s.player.play('frodo-idle-down', true);
        sfx.chant();
        await tween(s, b.dark, { alpha: 0.45 }, 1200);
      });
    else if (page === 1 || page === 2)
      beat(
        s,
        async () => {
          sfx.hymn();
          b.warm =
            b.warm ??
            s.add
              .rectangle(480, 360, 320, 240, 0xffe9a8)
              .setScrollFactor(0)
              .setDepth(858)
              .setAlpha(0);
          await Promise.all([
            tween(s, b.dark, { alpha: page === 1 ? 0.3 : 0.12 }, 1500),
            tween(s, b.warm, { alpha: page === 1 ? 0.06 : 0.13 }, 1500),
            tween(s, s.player, { y: s.player.y - 2, yoyo: true, repeat: 2 }, 420),
          ]);
        },
        page === 1 ? 'Sing the verse Tom taught you' : 'Sing on',
      );
    else if (page === 3)
      beat(s, async () => {
        sfx.crack();
        s.cameras.main.shake(1400, 0.006);
        b.crackLight = s.add.graphics().setDepth(856);
        b.crackLight.fillStyle(0xfff6cf, 0.9);
        for (const [x, y, w, h] of [
          [14 * 16, 6 * 16, 3, 60],
          [19 * 16, 5 * 16 + 8, 2, 74],
          [24 * 16, 6 * 16, 4, 52],
        ])
          b.crackLight.fillRect(x, y, w, h);
        b.crackLight.setAlpha(0);
        await tween(s, b.crackLight, { alpha: 1 }, 1100);
      });
    else if (page === 4)
      beat(s, async () => {
        sfx.crack();
        s.cameras.main.flash(1400, 250, 246, 214);
        b.gap = s.add.rectangle(18 * 16, 6 * 16, 10, 8, 0xfff8dc).setDepth(857);
        await Promise.all([
          tween(s, b.gap, { scaleX: 13, scaleY: 9 }, 1300),
          tween(s, b.wight, { alpha: 0, x: 60 }, 1000),
          tween(s, b.warm, { alpha: 0.3 }, 1300),
        ]);
      });
    else if (page === 5)
      beat(s, async () => {
        // Out of the daylight in the broken roof, and down into the chamber.
        const tom = actor(s, 'tom', 18, 8, 1.15).setDepth(858).setAlpha(0);
        await tween(s, tom, { alpha: 1 }, 600);
        await tween(s, tom, { y: tom.y + 22 }, 700);
      });
  }
}

export function barrowDialogue(s) {
  const d = s.journey.downs;
  if (!d) return;
  const key = s.dialogKey,
    page = s.dialogIndex,
    f = gameState.flags;
  if (s.zoneKey === 'downs') downsBeats(s, key, page, f);
  if (s.zoneKey === 'barrow') barrowBeats(s, key, page, f);
}

import { gameState, setObjective } from '../state/GameState.js';
import { nextBreeBeat, breeObjective } from '../state/breeProgress.js';
import { drawBreeScenery } from '../art/breeScenery.js';
import { walk, tween } from './storyMotion.js';
import { makePony, updatePonies } from './ponyEvent.js';

const party = (s) => [s.player, ...s.followers];
const pause = (s, ms) => new Promise((resolve) => s.time.delayedCall(ms, resolve));
function actor(s, key, x, y, dir = 'down') {
  const p = s.add
    .sprite(x * 16 + 8, y * 16, key)
    .setData('key', key)
    .setDepth(y * 16);
  p.setScale(['strider', 'butterbur', 'harry', 'ferny', 'southerner'].includes(key) ? 1.25 : 1);
  p.play(`${key}-idle-${dir}`);
  s.bree.actors[key] = p;
  return p;
}
function lock(s) {
  s.player.setVelocity(0);
  s.player.body.enable = false;
  party(s).forEach((p) => p.setData('held', true));
  s.bree.active = true;
}
function beat(s, run) {
  lock(s);
  const b = { busy: true };
  s.storyBeat = b;
  run().then(() => {
    if (s.storyBeat === b) b.busy = false;
  });
}
function restore(s) {
  s.player.setData('cinematicAlpha', null).setAlpha(1).setAngle(0);
  party(s).forEach((p) => p.setData('held', false));
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  s.trail = party(s).map((p) => ({ x: p.x, y: p.y }));
  s.bree.active = false;
}
function merryVisibility(s) {
  const f = gameState.flags,
    m = s.followers.find((p) => p.getData('key') === 'merry');
  if (!m) return;
  const absent =
    (f.ponyWelcomed || ['ponycommon', 'ponyparlour', 'ponyrooms'].includes(s.zoneKey)) &&
    !f.breeMerryReturned;
  m.setVisible(!absent).setData('held', absent);
}
function refresh(s) {
  const b = s.bree,
    f = gameState.flags;
  if (b.active) restore(s);
  merryVisibility(s);
  const next = nextBreeBeat(f);
  setObjective(breeObjective(f));
  b.cue.setText(next?.zone === s.zoneKey ? '▼ ' + next.objective : '');
  const p = s.zone.interactions.find((p) => p.dialogue === next?.key);
  b.cue.setVisible(!!p);
  if (p) b.cue.setPosition(p.x * 16 + 8, p.y * 16 - 25);
  for (const { p, dot } of s.interactionMarks) dot.setVisible(!p.when || p.when(f));
  if (b.actors.strider)
    b.actors.strider.setVisible(
      !f.striderJoined && (s.zoneKey !== 'ponycommon' || !f.breeRingSlip),
    );
  if (s.zoneKey === 'ponycommon') {
    b.actors.ferny.setVisible(!f.breeRingSlip);
    b.actors.southerner.setVisible(!f.breeRingSlip);
  }
  if (f.striderJoined && !s.followers.some((p) => p.getData('key') === 'strider')) {
    const p = s.createFollower('strider');
    const a = b.actors.strider;
    if (a) p.setPosition(a.x, a.y);
    else s.snapFollower();
    s.trail = party(s).map((p) => ({ x: p.x, y: p.y }));
  }
  if (s.zoneKey === 'bree' && f.billBought && !s.journey.ponies) {
    s.journey.ponies = [b.bill];
  }
  if (s.zoneKey === 'ponyrooms') {
    b.props.destroy();
    b.props = drawBreeRoomProps(s);
  }
  if (b.actors.butterbur && s.zoneKey === 'ponyparlour')
    b.actors.butterbur.setVisible(f.striderOffer && !f.striderTrusted);
  if (b.actors.nob && s.zoneKey === 'ponyparlour') b.actors.nob.setVisible(f.striderTrusted);
  if (s.zoneKey === 'ponyparlour') b.night.setAlpha(f.breeMorning ? 0 : 0.1);
}
// Rebuild only mutable bedroom props, without redrawing labels and lighting.
function drawBreeRoomProps(s) {
  const g = s.add.graphics().setDepth(100),
    f = gameState.flags;
  if (f.breeDecoys)
    for (const x of [5, 10, 15, 20]) {
      g.fillStyle(0x765335).fillRect(x * 16 + 4, 82, 8, 5);
      g.fillStyle(0xaaa080).fillRect(x * 16 + 3, 88, 10, 6);
      if (f.breeMorning) {
        g.fillStyle(0xeee0bb)
          .fillRect(x * 16 - 7, 104, 12, 3)
          .fillRect(x * 16 + 8, 112, 8, 2);
        g.lineStyle(2, 0x292523).lineBetween(x * 16 + 3, 83, x * 16 + 12, 94);
      }
    }
  return g;
}
export function breeCreate(s) {
  s.bree = { actors: {}, active: false, lastState: '' };
  s.journey = { ponies: null };
  const b = s.bree;
  b.props = drawBreeScenery(s);
  b.cue = s.add
    .text(0, 0, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '5px',
      lineSpacing: 5,
      color: '#f5d389',
      align: 'center',
      wordWrap: { width: 150 },
      backgroundColor: '#151a22cc',
      padding: { x: 3, y: 3 },
    })
    .setOrigin(0.5, 1)
    .setDepth(800);
  b.night = s.add
    .rectangle(480, 360, 320, 240, 0x101a30, 1)
    .setAlpha(0)
    .setScrollFactor(0)
    .setDepth(850);
  b.ring = s.add.circle(0, 0, 2).setStrokeStyle(1, 0xf1d16d).setDepth(810).setVisible(false);
  if (s.zoneKey === 'breegate') actor(s, 'harry', 19, 12);
  if (s.zoneKey === 'bree') {
    actor(s, 'butterbur', 35, 20, 'right').setVisible(!!gameState.flags.breeMorning);
    b.bill = makePony(s, 38 * 16, 19 * 16, 0x806046);
    b.bill.setVisible(!!gameState.flags.breeMorning);
  }
  if (s.zoneKey === 'ponycommon') {
    actor(s, 'butterbur', 6, 4);
    actor(s, 'strider', 25, 4, 'left');
    actor(s, 'ferny', 25, 7, 'left');
    actor(s, 'southerner', 26, 8, 'left');
    actor(s, 'breelocal', 8, 15, 'right');
    actor(s, 'breelocal2', 19, 7, 'left');
    actor(s, 'breedwarf', 5, 9, 'right');
  }
  if (s.zoneKey === 'ponyparlour') {
    actor(s, 'strider', 17, 5, 'left');
    actor(s, 'butterbur', 4, 11);
    actor(s, 'nob', 4, 15, 'right');
  }
  if (s.zoneKey === 'ponyrooms') actor(s, 'nob', 11, 7, 'down');
  if (s.zoneKey === 'breeroad') {
    actor(s, 'ferny', 11, 7);
    if (gameState.flags.billBought)
      s.journey.ponies = [makePony(s, s.player.x - 38, s.player.y, 0x806046)];
  }
  refresh(s);
}
export function breeUpdate(s, delta) {
  if (!s.bree || s.dialogActive || s.transitioning) return;
  const state = JSON.stringify(gameState.flags);
  if (state !== s.bree.lastState || s.bree.active) {
    s.bree.lastState = state;
    refresh(s);
  }
  updatePonies(s, delta);
}
export function breeDialogue(s) {
  const key = s.dialogKey,
    i = s.dialogIndex,
    b = s.bree;
  // Replayed/revisited fallback dialogue carries no story effects.
  if (!s.dialogStage.set) return;
  if (key === 'bree_song') {
    if (i === 1)
      beat(s, async () => {
        await walk(s, s.player, 14, 9, 65);
        await Promise.all(
          s.followers.filter((p) => p.visible).map((p, j) => walk(s, p, 12 + j * 3, 11, 65)),
        );
      });
    if (i === 2)
      beat(s, async () => {
        await tween(s, s.player, { y: s.player.y - 9 }, 380);
        await tween(s, s.player, { y: s.player.y + 13, angle: 75 }, 400);
      });
    if (i === 3) {
      lock(s);
      s.player.setData('cinematicAlpha', 0).setAlpha(0);
      b.ring.setPosition(s.player.x, s.player.y).setVisible(true);
      beat(s, async () => {
        await tween(s, b.ring, { alpha: 0 }, 700);
        b.ring.setVisible(false).setAlpha(1);
      });
    }
    if (i === 4)
      beat(s, async () => {
        await walk(s, s.player, 17, 10, 45);
        s.player.setAngle(0).setData('cinematicAlpha', 1).setAlpha(1);
        await pause(s, 300);
      });
  }
  if (key === 'bree_trust' && i === 0)
    beat(s, async () => {
      const a = b.actors.strider;
      const sword = s.add.graphics().setDepth(a.y + 25);
      sword
        .fillStyle(0xddd5b6)
        .fillRect(a.x - 15, a.y - 2, 11, 2)
        .fillStyle(0xa89a70)
        .fillRect(a.x - 7, a.y - 5, 2, 8);
      await pause(s, 1700);
      sword.destroy();
    });
  if (key === 'bree_merry' && i === 0)
    beat(s, async () => {
      const m = s.followers.find((p) => p.getData('key') === 'merry');
      m.setVisible(true)
        .setPosition(16, 16 * 16)
        .setData('held', true);
      b.actors.nob.setPosition(16, 15 * 16);
      await Promise.all([walk(s, m, 8, 13, 40), walk(s, b.actors.nob, 7, 13, 40)]);
    });
  if (key === 'bree_decoys' && i === 0)
    beat(s, async () => {
      for (const x of [5, 10, 15, 20]) {
        await walk(s, b.actors.nob, x, 6, 85);
        b.props.fillStyle(0x765335).fillRect(x * 16 + 4, 82, 8, 5);
        b.props.fillStyle(0xaaa080).fillRect(x * 16 + 3, 88, 10, 6);
        await pause(s, 180);
      }
    });
  if (key === 'bree_watch') {
    if (i === 0)
      beat(s, async () => {
        await Promise.all(party(s).map((p, j) => walk(s, p, 10 + j * 2, 11, 65)));
        await walk(s, b.actors.strider, 4, 16, 65);
      });
    if (i === 1)
      beat(s, async () => {
        await tween(s, b.night, { alpha: 0.78 }, 1500);
        await pause(s, 1200);
      });
    if (i === 2)
      beat(s, async () => {
        await tween(s, b.night, { alpha: 0 }, 1800);
      });
  }
  if (key === 'bree_depart' && i === 0)
    beat(s, async () => {
      const sam = s.followers.find((p) => p.getData('key') === 'sam');
      await walk(s, sam, 11, 10, 60);
      const apple = s.add.circle(sam.x, sam.y - 6, 2, 0xac3f23).setDepth(810);
      await tween(s, apple, { x: b.actors.ferny.x, y: b.actors.ferny.y - 9 }, 450);
      b.actors.ferny.setAngle(-12);
      apple.destroy();
      await pause(s, 400);
      b.actors.ferny.setAngle(0);
      await walk(s, sam, 12, 13, 65);
    });
}

import { gameState, setObjective } from '../state/GameState.js';
import { breeObjective, isBreeBeat } from '../state/breeProgress.js';
import { drawBreeScenery } from '../art/breeScenery.js';
import { walk, tween } from './storyMotion.js';
import { makePony, updatePonies } from './ponyEvent.js';
import { trailPosition } from '../state/partyMovement.js';
import { innDialogue, restoreInnPositions } from './breeInnEvent.js';

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
  s.hintIcon.setVisible(false);
  s.bree.active = true;
}
function beat(s, run, prompt = '') {
  lock(s);
  const b = { busy: false, prompt, action: null };
  s.storyBeat = b;
  const execute = async () => {
    b.busy = true;
    b.prompt = '';
    await run();
    if (s.storyBeat !== b) return;
    b.busy = false;
    if (prompt) s.advanceDialogue();
  };
  if (prompt) b.action = execute;
  else execute();
}
function restore(s) {
  s.player.setData('cinematicAlpha', null).setAlpha(1).setAngle(0);
  party(s).forEach((p) => p.setData('held', false));
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  s.trail = party(s)
    .filter((p) => p.visible)
    .map((p) => ({ x: p.x, y: p.y }));
  s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
  s.bree.active = false;
}
function restoreCompanionRoles(s) {
  const f = gameState.flags,
    m = s.followers.find((p) => p.getData('key') === 'merry');
  if (!m) return;
  const leftBehind = (f.ponySupper || f.breeRingSlip) && !f.breeMerryReturned;
  const resting = s.zoneKey === 'ponyparlour' && f.ponySupper && !f.breeRingSlip;
  m.setVisible(!leftBehind || resting).setData('held', leftBehind);
  const pippin = s.followers.find((p) => p.getData('key') === 'pippin');
  pippin?.setData('held', s.zoneKey === 'ponycommon' && f.breeCompany && !f.breeRingSlip);
}
function refresh(s) {
  const b = s.bree,
    f = gameState.flags;
  if (b.active) restore(s);
  restoreCompanionRoles(s);
  setObjective(breeObjective(f));
  for (const { p, dot } of s.interactionMarks) dot.setVisible(!p.when || p.when(f));
  if (b.actors.strider)
    b.actors.strider.setVisible(
      !f.striderJoined &&
        (s.zoneKey !== 'ponycommon' || !f.breeRingSlip) &&
        (s.zoneKey !== 'ponyparlour' || f.breeRingSlip) &&
        (s.zoneKey !== 'bree' || f.breeMorning),
    );
  if (s.zoneKey === 'ponycommon') {
    for (const key of ['ferny', 'southerner', 'harry', 'breelocal', 'breelocal2', 'breedwarf'])
      b.actors[key].setVisible(!f.breeRingSlip);
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
    b.actors.butterbur.setVisible(
      (!f.ponySupper && !f.breeRingSlip) || (f.striderOffer && !f.striderTrusted),
    );
  if (b.actors.nob && s.zoneKey === 'ponyparlour')
    b.actors.nob.setVisible((!f.ponySupper && !f.breeRingSlip) || f.striderTrusted);
  if (s.zoneKey === 'ponyparlour') b.night.setAlpha(f.breeMorning ? 0 : 0.1);
}
// Rebuild only mutable bedroom props, without redrawing scenery and lighting.
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
  b.night = s.add
    .rectangle(480, 360, 320, 240, 0x101a30, 1)
    .setAlpha(0)
    .setScrollFactor(0)
    .setDepth(850);
  if (s.zoneKey === 'breegate') actor(s, 'harry', 19, 12);
  if (s.zoneKey === 'bree') {
    actor(s, 'butterbur', 35, 20, 'right').setVisible(!!gameState.flags.breeMorning);
    actor(s, 'strider', 34, 19, 'right').setVisible(!!gameState.flags.breeMorning);
    const pos = gameState.flags.billBought
      ? trailPosition(s.trail, 90)
      : { x: 38 * 16, y: 19 * 16 };
    b.bill = makePony(s, pos.x, pos.y, 0x806046);
    b.bill.setVisible(!!gameState.flags.breeMorning);
  }
  if (s.zoneKey === 'ponycommon') {
    actor(
      s,
      'butterbur',
      gameState.flags.breeRingSlip ? 18 : 6,
      gameState.flags.breeRingSlip ? 9 : 4,
    );
    actor(s, 'strider', 25, 4, 'left');
    actor(s, 'ferny', 25, 7, 'left');
    actor(s, 'southerner', 26, 8, 'left');
    actor(s, 'harry', 4, 18, 'up');
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
    if (gameState.flags.billBought) {
      const pos = trailPosition(s.trail, 90);
      s.journey.ponies = [makePony(s, pos.x, pos.y, 0x806046)];
    }
  }
  restoreInnPositions(s);
  refresh(s);
}
export function breeUpdate(s, delta) {
  if (!s.bree || s.dialogActive || s.transitioning) return;
  const state = JSON.stringify(gameState.flags);
  if (state !== s.bree.lastState || s.bree.active) {
    s.bree.lastState = state;
    refresh(s);
  }
  if (s.bree.nextZone) {
    const { zone, entry } = s.bree.nextZone;
    s.bree.nextZone = null;
    s.goToZone(zone, entry);
    return;
  }
  if (s.zoneKey === 'ponycommon' && isBreeBeat(gameState.flags, 'bree_company')) {
    s.startDialogue('bree_company');
    return;
  }
  updatePonies(s, delta);
}
export function breeDialogue(s) {
  const key = s.dialogKey,
    i = s.dialogIndex,
    b = s.bree;
  // Replayed/revisited fallback dialogue carries no story effects.
  if (!s.dialogStage.set) return;
  if (innDialogue(s, beat)) return;
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

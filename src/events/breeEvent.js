import { gameState, setObjective } from '../state/GameState.js';
import { breeObjective, isBreeBeat } from '../state/breeProgress.js';
import { drawBreeScenery, drawBreeDecoy } from '../art/breeScenery.js';
import { makePony, updatePonies } from './ponyEvent.js';
import { innDialogue, restoreInnPositions } from './breeInnEvent.js';
import { restDialogue, restoreRestPositions } from './breeRestEvent.js';
import { departureDialogue } from './breeDepartureEvent.js';
import { billPosition, packBill } from './breeStoryMotion.js';

const party = (s) => [s.player, ...s.followers];
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
  s.trail =
    s.bree.releaseTrail ??
    party(s)
      .filter((p) => p.visible)
      .map((p) => ({ x: p.x, y: p.y }));
  s.bree.releaseTrail = null;
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
      (!f.ponySupper && !f.breeRingSlip) || (f.striderOffer && !f.gandalfLetter),
    );
  if (b.actors.nob && s.zoneKey === 'ponyparlour')
    b.actors.nob.setVisible(
      (!f.ponySupper && !f.breeRingSlip) || (f.breeMerryReturned && !f.breeDecoys) || f.breeMorning,
    );
  if (s.zoneKey === 'ponyparlour') b.night.setAlpha(f.breeMorning ? 0 : 0.1);
}
// Rebuild only mutable bedroom props, without redrawing scenery and lighting.
function drawBreeRoomProps(s) {
  const g = s.add.graphics().setDepth(100),
    f = gameState.flags;
  if (f.breeDecoys) for (const x of [5, 10, 15, 20]) drawBreeDecoy(g, x, f.breeMorning);
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
  if (s.zoneKey === 'breegate') {
    const harry = actor(s, 'harry', 19, 13, 'left');
    b.lantern = s.add.graphics({ x: harry.x - 10, y: harry.y - 5 }).setDepth(harry.y + 25);
    b.lantern
      .fillStyle(0xeabb62, 0.14)
      .fillCircle(0, 0, 9)
      .fillStyle(0x2c251d)
      .fillRect(-3, -5, 6, 9)
      .fillStyle(0xf8d985)
      .fillRect(-2, -3, 4, 5);
  }
  if (s.zoneKey === 'bree') {
    actor(s, 'butterbur', 35, 20, 'right').setVisible(!!gameState.flags.breeMorning);
    actor(s, 'strider', 34, 17, 'right').setVisible(!!gameState.flags.breeMorning);
    const pos = gameState.flags.billBought ? billPosition(s) : { x: 38 * 16, y: 19 * 16 };
    b.bill = makePony(s, pos.x, pos.y, 0x806046);
    b.bill.setVisible(!!gameState.flags.breeMorning);
    if (gameState.flags.billBought) packBill(b.bill);
    actor(s, 'ferny', 40, 19, 'left').setVisible(
      !!gameState.flags.breeMorning && !gameState.flags.billBought,
    );
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
      const pos = billPosition(s);
      b.bill = makePony(s, pos.x, pos.y, 0x806046);
      packBill(b.bill);
      s.journey.ponies = [b.bill];
    }
  }
  restoreInnPositions(s);
  restoreRestPositions(s);
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
  // Revisited fallback dialogue has no story effects or choreography.
  if (!s.dialogStage.set) return;
  if (innDialogue(s, beat)) return;
  if (restDialogue(s, beat)) return;
  departureDialogue(s, beat);
}

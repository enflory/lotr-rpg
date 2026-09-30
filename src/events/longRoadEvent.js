import { gameState, setObjective } from '../state/GameState.js';
import { roadObjective, isRoadBeat } from '../state/longRoadProgress.js';
import { drawLongRoadScenery } from '../art/longRoadScenery.js';
import { drawWraith } from '../art/longRoadArt.js';
import { makePony, updatePonies } from './ponyEvent.js';
import {
  billPosition,
  packBill,
  friend,
  pause,
  face,
  gesture,
  focus,
  regroup,
} from './breeStoryMotion.js';
import { walk, tween } from './storyMotion.js';
import { runBeat, restoreParty } from './storyFlow.js';
import { AT, RIDE } from './longRoadStaging.js';
import { sfx } from '../audio/sound.js';

// Chapter 5: Midgewater, Weathertop, the Trollshaws and the Ford. Completed
// beats are flags; every tableau below is transient and is rebuilt from those
// flags, so a reload never finds an animation half-way through.

const TILE = 16;
const beat = (s, run, prompt = '') => runBeat(s, s.road, run, prompt);
const go = (s, p, at, speed = 60) => (p ? walk(s, p, at.x, at.y, speed) : Promise.resolve());
const tileOf = (p) => ({ x: Math.floor(p.x / TILE), y: Math.floor((p.y + 8) / TILE) });
const gather = (s) => {
  const { x, y } = tileOf(s.player);
  return regroup(s, x, y, s.lastDir);
};

/** The nine wait on the far bank of the Ford once Frodo has crossed. */
export const RIDERS_AT = [
  [25, 9],
  [24, 10],
  [26, 10],
  [25, 11],
  [24, 12],
  [26, 12],
  [25, 13],
  [24, 14],
  [26, 8],
];

function nightLevel(f) {
  if (f.frodoWounded) return 0;
  if (f.fireTale) return 0.34;
  if (f.runeRead) return 0.12;
  return 0;
}
const chillLevel = (f) =>
  f.chapter5Complete ? 0.12 : f.frodoWounded ? (f.athelasFound ? 0.07 : 0.13) : 0;

function actor(s, key, x, y, dir = 'down') {
  const p = s.add
    .sprite(x * TILE + 8, y * TILE, key)
    .setData('key', key)
    .setDepth(y * TILE);
  p.setScale(1.25);
  p.play(`${key}-idle-${dir}`);
  return p;
}
function steedAt(s, x, y, anim = 'steed-idle') {
  const p = s.add.sprite(x * TILE + 8, y * TILE + 12, 'steed').setOrigin(0.5, 1);
  p.setDepth(y * TILE + 14);
  p.play(anim);
  return p;
}
function makeRider(s, x, y, still) {
  const p = s.add
    .sprite(x * TILE + 8, y * TILE + 12, 'rider')
    .setOrigin(0.5, 1)
    .setDepth(y * TILE + 14);
  if (still) p.setFrame(0);
  else p.play('rider-gallop');
  return p;
}
function tableau(s) {
  const r = s.road;
  if (r.riders) return;
  r.riders = RIDERS_AT.map(([x, y]) => makeRider(s, x, y, true));
}

function refresh(s) {
  const r = s.road,
    f = gameState.flags;
  if (r.active) restoreParty(s, r);
  setObjective(roadObjective(f));
  for (const { p, dot } of s.interactionMarks) dot.setVisible(!p.when || p.when(f));
  r.night.setAlpha(nightLevel(f));
  r.chill.setAlpha(chillLevel(f));
  r.sight.setAlpha(0);
  const fx = r.fx;
  if (fx.fire) fx.fire.forEach((o) => o.setVisible(!!f.fireTale && !f.frodoWounded));
  if (fx.midges) fx.midges.setAlpha(f.midgesEndured ? 0.3 : 0.45);
  // The camp is where Continue returns to once the night has begun.
  if (s.zoneKey === 'weathertop' && f.fireTale) s.entryKey = 'dell';
  if (s.zoneKey === 'trollshaws') {
    const there = !!f.glorfindelMet;
    r.glorfindel?.setVisible(there);
    r.steed?.setVisible(there);
  }
  if (s.zoneKey === 'bruinen') {
    const done = !!f.chapter5Complete;
    r.glorfindel?.setVisible(!done);
    if (r.steed) r.steed.setVisible(!done);
    if (r.block) r.block.body.enable = done;
    if (done) {
      s.followers.forEach((p) => p.setVisible(false).setData('held', true));
      s.trail = [{ x: s.player.x, y: s.player.y }];
      tableau(s);
    }
  }
}

export function roadCreate(s) {
  s.road = { active: false, lastState: '', actors: {}, riders: null, fx: {} };
  s.journey = { ponies: null };
  const r = s.road,
    f = gameState.flags;
  r.fx = drawLongRoadScenery(s);
  const overlay = (color, depth) =>
    s.add.rectangle(480, 360, 320, 240, color, 1).setAlpha(0).setScrollFactor(0).setDepth(depth);
  r.night = overlay(0x101a30, 850);
  r.chill = overlay(0x9ab8d8, 851);
  r.sight = overlay(0x7c8490, 852);
  // Midgewater is seen through a sour, yellow-green haze.
  if (s.zoneKey === 'midgewater') overlay(0x4a5a22, 849).setAlpha(0.14);
  if (f.billBought && s.zoneKey !== 'bruinen') {
    const pos = billPosition(s);
    const bill = makePony(s, pos.x, pos.y, 0x806046);
    packBill(bill);
    s.journey.ponies = [bill];
  }
  if (s.zoneKey === 'trollshaws') {
    r.glorfindel = actor(s, 'glorfindel', AT.elfLands.x, AT.elfLands.y, 'left');
    r.steed = steedAt(s, AT.elfSteed.x, AT.elfSteed.y);
  }
  if (s.zoneKey === 'bruinen') {
    r.glorfindel = actor(s, 'glorfindel', AT.elfStart.x, AT.elfStart.y, 'right');
    r.steed = steedAt(s, AT.steedStart.x, AT.steedStart.y);
    r.block = s.add.zone(33 * TILE + 8, 11.5 * TILE, TILE, 7 * TILE);
    s.physics.add.existing(r.block, true);
    s.physics.add.collider(s.player, r.block);
    r.block.body.enable = !!f.chapter5Complete;
  }
  refresh(s);
}

export function roadUpdate(s, delta) {
  if (!s.road || s.dialogActive || s.transitioning) return;
  const r = s.road;
  const state = JSON.stringify(gameState.flags);
  if (state !== r.lastState || r.active) {
    r.lastState = state;
    refresh(s);
  }
  // The wound follows the stabbing without any walking in between.
  if (s.zoneKey === 'weathertop' && isRoadBeat(gameState.flags, 'road_wound') && !s.storyBeat) {
    s.startDialogue('road_wound');
    return;
  }
  updatePonies(s, delta);
}

/* ── scene choreography, by dialogue key and page ───────────── */

const SCENES = {
  road_marsh(s, i) {
    const strider = friend(s, 'strider');
    if (i === 0)
      beat(s, async () => {
        await go(s, strider, AT.marshLead);
        if (strider) face(strider, 'right');
      });
    if (i === 2) beat(s, () => tween(s, s.road.fx.midges, { alpha: 0.9 }, 900));
    if (i === 3) beat(s, () => gesture(s, friend(s, 'sam')));
  },
  road_midges(s, i) {
    const r = s.road;
    if (i === 0) beat(s, () => tween(s, r.night, { alpha: 0.4 }, 1600));
    if (i === 1) beat(s, () => tween(s, r.fx.midges, { alpha: 1 }, 800));
    if (i === 2)
      beat(s, async () => {
        await Promise.all([gesture(s, friend(s, 'pippin')), gesture(s, friend(s, 'merry'))]);
      });
    if (i === 3) beat(s, () => gesture(s, friend(s, 'strider')));
    if (i === 4)
      beat(s, async () => {
        await Promise.all([
          tween(s, r.night, { alpha: 0 }, 1400),
          tween(s, r.fx.midges, { alpha: 0.3 }, 1400),
        ]);
      });
  },
  road_hill(s, i) {
    if (i === 0)
      beat(s, async () => {
        focus(s, 26, 9);
        await pause(s, 1300);
      });
    if (i === 2) beat(s, () => gesture(s, friend(s, 'strider')));
    if (i === 3) beat(s, () => pause(s, 200));
  },
  road_rune(s, i) {
    const strider = friend(s, 'strider');
    if (i === 1)
      beat(s, async () => {
        await go(s, strider, AT.stoneSide);
        if (strider) face(strider, 'right');
        await gesture(s, strider);
      });
    if (i === 3)
      beat(s, async () => {
        focus(s, 26, 17);
        await pause(s, 1200);
      });
    if (i === 4) beat(s, () => gather(s));
  },
  road_fire(s, i) {
    const r = s.road;
    if (i === 0)
      beat(s, async () => {
        await go(s, friend(s, 'sam'), AT.samAtFire);
        r.fx.fire?.forEach((o) => o.setVisible(true));
        sfx.jingle();
        await tween(s, r.night, { alpha: 0.34 }, 1600);
      });
    if (i === 1) beat(s, () => gesture(s, friend(s, 'sam')));
    if (i === 2)
      beat(s, async () => {
        const st = friend(s, 'strider');
        await go(s, st, AT.striderAtFire);
        if (st) face(st, 'left');
      });
    if (i === 3) beat(s, () => gesture(s, friend(s, 'strider')));
    if (i === 4)
      beat(s, async () => {
        const g = s.add
          .graphics({ x: 37 * TILE, y: 23 * TILE })
          .setDepth(23 * TILE)
          .setAlpha(0)
          .setScale(0.85);
        drawWraith(g, false);
        await tween(s, g, { alpha: 0.6 }, 700);
        await tween(s, g, { alpha: 0 }, 700);
        g.destroy();
        await gather(s);
      });
  },
  road_attack(s, i) {
    const r = s.road;
    const hobbits = () => ['sam', 'pippin', 'merry'].map((k) => friend(s, k)).filter(Boolean);
    const leader = () => r.wraiths?.[2];
    if (i === 0)
      beat(s, async () => {
        const st = friend(s, 'strider');
        await go(s, st, AT.dellRim);
        if (st) face(st, 'up');
      });
    if (i === 1)
      beat(s, async () => {
        r.wraiths = [35, 37, 39, 41, 43].map((x, n) => {
          const g = s.add
            .graphics({ x: x * TILE + 8, y: 22.4 * TILE })
            .setDepth(22.4 * TILE + 40)
            .setAlpha(0)
            .setScale(n === 2 ? 0.95 : 0.85);
          drawWraith(g, false, n === 2);
          return g;
        });
        sfx.sting();
        await Promise.all([
          ...r.wraiths.map((g) => tween(s, g, { alpha: 0.9 }, 1200)),
          tween(s, r.chill, { alpha: 0.28 }, 1200),
        ]);
      });
    if (i === 2)
      beat(s, async () => {
        const dest = [36.6, 38, 39.2, 40.4, 41.8];
        await Promise.all([
          ...r.wraiths.map((g, n) => tween(s, g, { x: dest[n] * TILE + 8, y: 25.6 * TILE }, 1700)),
          ...hobbits().map((p, n) => tween(s, p, { angle: n % 2 ? -80 : 80 }, 600)),
        ]);
      });
    if (i === 3)
      beat(
        s,
        async () => {
          r.wraiths.forEach((g, n) => drawWraith(g, true, n === 2));
          s.player.setAlpha(0.5);
          sfx.sting();
          await tween(s, r.sight, { alpha: 0.4 }, 500);
        },
        'Slip on the Ring',
      );
    if (i === 4)
      beat(s, async () => {
        await tween(s, leader(), { y: leader().y + 6 }, 500);
        await tween(s, leader(), { y: leader().y - 6 }, 400);
      });
    if (i === 5)
      beat(
        s,
        async () => {
          const flash = s.add
            .rectangle(s.player.x + 6, s.player.y - 4, 9, 1, 0xf4f8ff)
            .setDepth(900);
          await tween(s, s.player, { y: s.player.y - 5 }, 160);
          sfx.confirm();
          await tween(s, flash, { x: flash.x + 6, alpha: 0 }, 260);
          flash.destroy();
        },
        'Strike and cry out',
      );
    if (i === 6)
      beat(s, async () => {
        s.cameras.main.flash(300, 255, 255, 255);
        sfx.sting();
        await Promise.all([
          tween(s, leader(), { angle: 14, y: leader().y - 4 }, 300),
          tween(s, r.sight, { alpha: 0 }, 500),
        ]);
        s.player.setAlpha(1);
        await tween(s, s.player, { angle: 90 }, 500);
      });
    if (i === 7)
      beat(s, async () => {
        const st = friend(s, 'strider');
        const brand = (dx) =>
          s.add.circle(st.x + dx, st.y - 12, 3, 0xff9a30, 0.95).setDepth(st.y + 40);
        const brands = [brand(-7), brand(7)];
        await Promise.all([
          go(s, st, AT.striderAtFire, 90),
          ...r.wraiths.map((g) => tween(s, g, { alpha: 0 }, 1200)),
          ...hobbits().map((p) => tween(s, p, { angle: 0 }, 900)),
          tween(s, r.chill, { alpha: 0.12 }, 1200),
        ]);
        r.wraiths.forEach((g) => g.destroy());
        r.wraiths = null;
        brands.forEach((b) => b.destroy());
      });
  },
  road_wound(s, i) {
    const r = s.road;
    if (i === 0)
      beat(s, async () => {
        s.player.setAngle(90).setAlpha(1);
        focus(s, 39, 28);
        const knife = s.add.rectangle(40 * TILE, 28.3 * TILE, 10, 2, 0xb8c4d0).setDepth(29 * TILE);
        await gesture(s, friend(s, 'strider'));
        await tween(s, knife, { alpha: 0, scaleX: 0.1 }, 1100);
        knife.destroy();
      });
    if (i === 2)
      beat(s, async () => {
        await Promise.all([
          go(s, friend(s, 'sam'), AT.samAtFire),
          ...['pippin', 'merry']
            .map((k) => friend(s, k))
            .filter(Boolean)
            .map((p) => tween(s, p, { angle: 0 }, 400)),
        ]);
        await gesture(s, friend(s, 'sam'));
      });
    if (i === 3) beat(s, () => gesture(s, friend(s, 'strider')));
    if (i === 4)
      beat(s, async () => {
        await Promise.all([
          tween(s, r.night, { alpha: 0 }, 1800),
          tween(s, r.chill, { alpha: 0.13 }, 1800),
          tween(s, s.player, { angle: 0 }, 900),
        ]);
        r.fx.fire?.forEach((o) => o.setVisible(false));
        await gather(s);
      });
  },
  road_athelas(s, i) {
    const r = s.road;
    if (i === 0) beat(s, () => tween(s, r.chill, { alpha: 0.2 }, 1200));
    if (i === 1)
      beat(s, async () => {
        const st = friend(s, 'strider');
        await go(s, st, AT.plants);
        if (st) await gesture(s, st);
      });
    if (i === 2)
      beat(s, async () => {
        sfx.jingle();
        const st = friend(s, 'strider') ?? s.player;
        const puffs = [-8, -2, 5, 10, 0].map((dx, n) =>
          s.add.circle(st.x + dx, st.y - 6, 3, 0xc6e8b8, 0.6).setDepth(st.y + 40 + n),
        );
        await Promise.all([
          ...puffs.map((p, n) => tween(s, p, { y: p.y - 22 - n * 3, alpha: 0 }, 1500)),
          tween(s, r.chill, { alpha: 0.07 }, 1500),
        ]);
        puffs.forEach((p) => p.destroy());
      });
    if (i === 3) beat(s, () => gather(s));
  },
  road_trolls(s, i) {
    if (i === 0)
      beat(s, async () => {
        focus(s, 31, 10);
        await pause(s, 1200);
      });
    if (i === 1) beat(s, () => gesture(s, friend(s, 'sam')));
    if (i === 2) beat(s, () => gesture(s, friend(s, 'merry')));
    if (i === 3)
      beat(s, async () => {
        const sam = friend(s, 'sam');
        for (let n = 0; n < 3; n++) {
          sfx.blip();
          await tween(s, sam, { angle: n % 2 ? -5 : 5 }, 220);
        }
        sam.setAngle(0);
      });
    if (i === 4) beat(s, () => gesture(s, friend(s, 'strider')));
  },
  road_glorfindel(s, i) {
    const r = s.road;
    if (i === 0)
      beat(s, async () => {
        const st = friend(s, 'strider');
        await go(s, st, AT.bridgeMeet, 80);
        if (st) {
          face(st, 'right');
          await gesture(s, st);
        }
      });
    if (i === 1)
      beat(s, async () => {
        r.glorfindel.setVisible(false);
        r.steed
          .setVisible(true)
          .setPosition(59 * TILE, 15 * TILE + 12)
          .play('steed-elf');
        focus(s, 46, 15);
        await tween(s, r.steed, { x: AT.elfSteed.x * TILE + 8 }, 1700);
        r.steed.setPosition(AT.elfSteed.x * TILE + 8, AT.elfSteed.y * TILE + 12).play('steed-idle');
        r.glorfindel.setVisible(true);
        sfx.jingle();
      });
    if (i === 2) beat(s, () => gesture(s, r.glorfindel));
    if (i === 3) beat(s, () => gesture(s, friend(s, 'strider')));
    if (i === 4) beat(s, () => gesture(s, r.glorfindel));
    if (i === 5) beat(s, () => gather(s));
  },
  road_ford(s, i) {
    const r = s.road;
    if (i === 0)
      beat(s, async () => {
        focus(s, 22, 11);
        await pause(s, 1100);
      });
    if (i === 1) beat(s, () => gesture(s, r.glorfindel));
    if (i === 2)
      beat(
        s,
        async () => {
          await go(s, s.player, AT.mountSpot, 60);
          s.player.setAlpha(0);
          r.steed.anims.stop();
          r.steed.setFrame(0);
          sfx.confirm();
        },
        'Mount Asfaloth',
      );
    if (i === 3)
      beat(s, async () => {
        await gesture(s, r.glorfindel);
        s.cameras.main.startFollow(r.steed, true, 0.08, 0.08);
      });
    if (i === 4)
      beat(s, async () => {
        r.chase = [9, 10, 11, 12, 13, 11, 10, 12, 11].map((y, n) =>
          makeRider(s, -3 - (n % 3) * 2, y, false),
        );
        sfx.sting();
        r.steed.play('steed-frodo');
        await Promise.all([
          tween(s, r.steed, { x: 20 * TILE }, 1700),
          ...r.chase.map((p, n) => tween(s, p, { x: (8 + (n % 3)) * TILE }, 1900)),
        ]);
      });
    if (i === 5)
      beat(s, async () => {
        await Promise.all([
          tween(s, r.steed, { x: RIDE.water * TILE }, 1300),
          ...r.chase.map((p, n) => tween(s, p, { x: (17 + (n % 3)) * TILE }, 1400)),
        ]);
      });
    if (i === 6)
      beat(s, async () => {
        s.followers.forEach((p) => p.setVisible(false));
        r.glorfindel.setVisible(false);
        await Promise.all([
          tween(s, r.steed, { x: RIDE.across * TILE + 8 }, 1800),
          ...r.chase.map((p, n) => {
            const [x, y] = RIDERS_AT[n];
            return tween(s, p, { x: x * TILE + 8, y: y * TILE + 12 }, 1900);
          }),
        ]);
        r.chase.forEach((p) => p.anims.stop().setFrame(0));
        r.steed.anims.stop();
        r.steed.setFlipX(true).setFrame(0);
        s.player.setPosition(r.steed.x, RIDE.y * TILE);
        r.riders = r.chase;
        r.chase = null;
        // Continue must bring Frodo back on the eastern bank, not the western.
        s.entryKey = 'east';
        s.cameras.main.stopFollow();
        await pause(s, 500);
      });
  },
};

export function roadDialogue(s) {
  // Revisited pages carry no effects and no choreography.
  if (!s.dialogStage?.set || !s.road) return;
  SCENES[s.dialogKey]?.(s, s.dialogIndex);
}

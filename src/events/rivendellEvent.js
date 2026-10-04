import { gameState, setObjective } from '../state/GameState.js';
import {
  rvObjective,
  isRvBeat,
  skyFor,
  councilNow,
  winterNow,
} from '../state/rivendellProgress.js';
import { PAGE } from '../data/rivendellDialogues.js';
import { AT, WALKERS, FAREWELL } from './rivendellStaging.js';
import { drawRivendellScenery, turnToWinter } from '../art/rivendellScenery.js';
import { pause, face, gesture, focus, enter, leave } from './breeStoryMotion.js';
import { walk, tween } from './storyMotion.js';
import { runBeat, restoreParty, placeActor } from './storyFlow.js';
import { sfx, playMusic } from '../audio/sound.js';

// Chapter 6: the flood at the Ford, then the Last Homely House, the Council and
// the Company at the gate. Completed beats are flags; every tableau here is
// transient and rebuilt from those flags, so a reload never finds an animation
// half-way through. The Ring, the flood and the walkers' march are never saved.

const TILE = 16;
const beat = (s, run, prompt = '') => runBeat(s, s.rv, run, prompt);
const npcOf = (s, key) => s.npcs.find((n) => n.getData('key') === key);
const isRivendell = (s) => s.zoneKey.startsWith('rivendell');
/** The three Riders who ride into the water first, then the rest. */
const FRONT = [2, 5, 8];

/** A character that is part of this scene only; it fades out when its beat is over. */
function temp(s, beatKey, key, x, y, dir = 'down') {
  const p = placeActor(s, key, x, y, dir);
  p.setData('beat', beatKey);
  s.rv.temp.push(p);
  return p;
}
/** Draw the sprite exactly where an NPC of the same name would stand. */
const stand = (s, key, x, y, dir = 'down') =>
  placeActor(s, key, x, y + 6 / TILE, dir).setDepth(y * TILE + 6);

function stowParty(s) {
  s.followers.forEach((p) => p.setVisible(false).setData('held', true));
  s.trail = [{ x: s.player.x, y: s.player.y }];
}

/** Drop any NPC whose `when` no longer holds at its place, then admit new ones. */
function syncNpcs(s) {
  const f = gameState.flags;
  for (const n of [...s.npcs]) {
    const key = n.getData('key');
    const ok = s.zone.npcs.some(
      (d) =>
        d.key === key &&
        Math.abs(d.x * TILE + 8 - n.x) < 1 &&
        Math.abs(d.y * TILE + 6 - n.y) < 1 &&
        (!d.when || d.when(f)),
    );
    if (!ok) {
      n.destroy();
      s.npcs.splice(s.npcs.indexOf(n), 1);
    }
  }
  s.refreshSpawns();
}

/** Where Continue should bring the party back to: the story, not the door they came in by. */
function homeEntry(s, f) {
  switch (s.zoneKey) {
    case 'rivendellroom':
      return f.rivendellWoke && s.entryKey === 'bed' ? 'fromHall' : null;
    case 'rivendellhall':
      return f.feastHeld && !f.hallOfFire ? 'hearth' : null;
    case 'rivendell':
      return f.chapter6Complete ? 'gate' : councilNow(f) ? 'porch' : null;
    default:
      return null;
  }
}

function refresh(s) {
  const r = s.rv,
    f = gameState.flags;
  if (!f.chapter5Complete) return;
  if (r.active) restoreParty(s, r);
  stowParty(s);
  setObjective(rvObjective(f));
  for (const { p, dot } of s.interactionMarks) dot.setVisible(!p.when || p.when(f));
  const sky = skyFor(f, s.zoneKey);
  r.sky.setFillStyle(sky?.color ?? 0, 1).setAlpha(sky?.alpha ?? 0);
  for (const t of [...r.temp]) {
    if (isRvBeat(f, t.getData('beat'))) continue;
    r.temp.splice(r.temp.indexOf(t), 1);
    s.tweens.add({ targets: t, alpha: 0, duration: 500, onComplete: () => t.destroy() });
  }
  if (isRivendell(s)) {
    syncNpcs(s);
    const home = homeEntry(s, f);
    if (home && s.entryKey !== home) s.checkpoint(home);
  }
  if (s.zoneKey === 'rivendell') {
    // The Council's relics belong to the Council alone; the Ring itself is never drawn from a flag.
    r.shards?.setVisible(!!f.councilTales && !f.ringBearerChosen);
    if (winterNow(f)) turnToWinter(s, r.fx);
    if (r.walk) for (const p of Object.values(r.walk)) p.setVisible(!!f.chapter6Complete);
  }
}

export function rvCreate(s) {
  s.rv = {
    active: false,
    releaseTrail: null,
    lastState: -1,
    temp: [],
    walk: null,
    born: s.time.now,
  };
  const r = s.rv,
    f = gameState.flags;
  r.sky = s.add
    .rectangle(480, 360, 320, 240, 0x000000, 1)
    .setAlpha(0)
    .setScrollFactor(0)
    .setDepth(848);
  r.fx = drawRivendellScenery(s);
  if (!f.chapter5Complete) return;
  if (s.zoneKey === 'rivendellroom' && isRvBeat(f, 'rv_wake')) {
    r.gandalf = temp(s, 'rv_wake', 'gandalfrv', AT.gandalfChair.x, AT.gandalfChair.y, 'left');
  }
  if (s.zoneKey === 'rivendell') {
    // The hobbits stand at the gate with the rest once the chapter is done.
    r.walk = {};
    for (const w of WALKERS.filter((w) => w.kind === 'actor'))
      r.walk[w.key] = stand(s, w.key, w.x, w.y, w.dir).setVisible(!!f.chapter6Complete);
    r.shards = s.add.graphics({ x: 48 * TILE + 8, y: 20 * TILE + 8 }).setDepth(20 * TILE + 8);
    r.shards.fillStyle(0xaeb4bc).fillRect(-6, -1, 5, 2).fillRect(-1, 1, 6, 2).fillRect(2, -2, 4, 2);
    r.shards.fillStyle(0xe8ecf0).fillRect(-6, -1, 5, 1).fillRect(-1, 1, 6, 1);
    r.shards.setVisible(false);
    if (f.chapter6Complete) playMusic('parting');
    else if (f.councilOpened && !f.weeksPassed) playMusic('council');
  }
  refresh(s);
}

export function rvUpdate(s) {
  const r = s.rv;
  if (!r || s.dialogActive || s.transitioning) return;
  const f = gameState.flags;
  if (!f.chapter5Complete) return;
  const state = Object.keys(f).length;
  if (state !== r.lastState || r.active) {
    r.lastState = state;
    refresh(s);
  }
  // The flood ends in darkness, and then in a bed in the house of Elrond.
  if (s.zoneKey === 'bruinen' && f.fordFlooded && !f.rivendellWoke && !r.leaving) {
    r.leaving = true;
    s.goToZone('rivendellroom', 'bed');
    return;
  }
  // Waking is not something the player does; it begins by itself.
  if (
    s.zoneKey === 'rivendellroom' &&
    isRvBeat(f, 'rv_wake') &&
    !s.storyBeat &&
    s.time.now - r.born > 900
  )
    s.startDialogue('rv_wake');
}

/** A rider at the Ford, by index into the nine standing on the western bank. */
const rider = (s, n) => s.road?.riders?.[n];

/** A horse of foam with a pale rider, drawn once and sent down the channel. */
function waveHorse(s, x, y) {
  const g = s.add.graphics({ x, y }).setDepth(700);
  g.fillStyle(0xeaf6ff, 0.95)
    .fillEllipse(0, 0, 18, 9)
    .fillEllipse(8, -5, 7, 5)
    .fillRect(-8, 3, 3, 6)
    .fillRect(3, 3, 3, 6);
  g.fillStyle(0xffffff).fillRect(-3, -11, 5, 8);
  g.fillStyle(0xcfe4f8).fillRect(-2, -14, 3, 3);
  return g;
}

const act = (s, id, key) => PAGE[key][id];

const SCENES = {
  rv_flood(s, i) {
    const r = s.rv;
    const at = (id) => act(s, id, 'rv_flood');
    if (i === at('turn'))
      beat(s, async () => {
        face(s.player, 'left');
        focus(s, 29, 11);
        await pause(s, 1100);
      });
    if (i === at('enter'))
      beat(s, async () => {
        sfx.sting();
        await Promise.all(
          FRONT.map((n, k) =>
            rider(s, n) ? tween(s, rider(s, n), { x: (29.4 + k * 0.5) * TILE }, 1500) : 0,
          ),
        );
      });
    if (i === at('sword'))
      beat(
        s,
        async () => {
          const blade = s.add
            .rectangle(s.player.x - 8, s.player.y - 8, 9, 1, 0xdfeefa)
            .setDepth(900);
          const x0 = s.player.x;
          await tween(s, s.player, { x: x0 - 2 }, 160);
          sfx.confirm();
          await tween(s, s.player, { x: x0 }, 160);
          await tween(s, blade, { alpha: 0.2 }, 320);
          blade.destroy();
        },
        'Draw your sword',
      );
    if (i === at('ride'))
      beat(s, async () => {
        await Promise.all([
          ...FRONT.map((n, k) =>
            rider(s, n) ? tween(s, rider(s, n), { x: (31.2 + k * 0.4) * TILE }, 1200) : 0,
          ),
          ...[0, 1, 3, 4, 6, 7].map((n) =>
            rider(s, n) ? tween(s, rider(s, n), { x: 27.4 * TILE }, 1300) : 0,
          ),
        ]);
      });
    if (i === at('roar'))
      beat(s, async () => {
        sfx.sting();
        s.cameras.main.shake(900, 0.004);
        r.rise = s.add
          .rectangle(30.5 * TILE, 11.5 * TILE, 6 * TILE, 22 * TILE, 0xcfe8f6, 0)
          .setDepth(5);
        await tween(s, r.rise, { alpha: 0.5 }, 1300);
      });
    if (i === at('horses'))
      beat(s, async () => {
        const horses = [0, 1, 2, 3, 4, 5].map((n) =>
          waveHorse(s, (28.8 + (n % 3) * 1.9) * TILE, (n < 3 ? 0 : -3) * TILE),
        );
        const swept = (p, k) =>
          p ? tween(s, p, { y: p.y + 140 + k * 8, alpha: 0, angle: 80 }, 1700) : 0;
        await Promise.all([
          ...horses.map((g, n) => tween(s, g, { y: 24 * TILE }, 2100 + (n % 3) * 160)),
          ...(s.road?.riders ?? []).map(swept),
        ]);
        horses.forEach((g) => g.destroy());
      });
    if (i === at('dark'))
      beat(s, async () => {
        s.cameras.main.flash(300, 255, 255, 255);
        sfx.sting();
        r.black = s.add
          .rectangle(480, 360, 320, 240, 0x000000, 1)
          .setAlpha(0)
          .setScrollFactor(0)
          .setDepth(860);
        await Promise.all([
          tween(s, s.player, { angle: 90 }, 700),
          tween(s, r.black, { alpha: 1 }, 1500),
        ]);
      });
  },
  rv_wake(s, i) {
    const r = s.rv;
    const at = (id) => act(s, id, 'rv_wake');
    if (i === at('open'))
      beat(s, async () => {
        s.player.setAngle(90);
        await pause(s, 900);
      });
    if (i === at('sit')) beat(s, () => tween(s, s.player, { angle: 0 }, 700));
    if (i === at('gandalf')) beat(s, () => gesture(s, r.gandalf));
    if (i === at('sam'))
      beat(s, async () => {
        r.sam = temp(s, 'rv_wake', 'sam', AT.samDoor.x, AT.samDoor.y, 'left');
        await enter(s, r.sam, AT.samBedside.x, AT.samBedside.y, AT.samDoor.x, AT.samDoor.y);
        face(r.sam, 'left');
        await gesture(s, r.sam);
      });
    if (i === at('rest'))
      beat(s, async () => {
        await Promise.all([
          leave(s, r.gandalf, AT.samDoor.x, AT.samDoor.y),
          r.sam ? leave(s, r.sam, AT.samDoor.x, AT.samDoor.y) : 0,
        ]);
      });
  },
  rv_feast(s, i) {
    const at = (id) => act(s, id, 'rv_feast');
    if (i === at('hall'))
      beat(s, async () => {
        focus(s, 15, 5);
        await pause(s, 1200);
      });
    if (i === at('welcome')) beat(s, () => gesture(s, npcOf(s, 'elrond')));
    if (i === at('arwen'))
      beat(s, async () => {
        focus(s, 17, 5);
        await pause(s, 900);
      });
    if (i === at('gloin')) beat(s, () => gesture(s, npcOf(s, 'gloin')));
    if (i === at('strider'))
      beat(s, async () => {
        focus(s, 19, 5);
        await pause(s, 900);
      });
    if (i === at('bilbo')) beat(s, () => gesture(s, npcOf(s, 'bilboelder')));
    if (i === at('end')) beat(s, () => gesture(s, npcOf(s, 'gandalfrv')));
  },
  rv_song(s, i) {
    const r = s.rv;
    const at = (id) => act(s, id, 'rv_song');
    if (i === at('fire')) {
      // Continue brings the party back to the hearth, not the door.
      s.entryKey = 'hearth';
      beat(s, async () => {
        focus(s, 3, 14);
        await pause(s, 1200);
      });
    }
    if (i === at('recite'))
      beat(s, async () => {
        const bilbo = npcOf(s, 'bilboelder');
        await gesture(s, bilbo);
        // Notes of the song rise from the old hobbit and are gone.
        const notes = [-8, -2, 6, 12].map((dx, n) =>
          s.add.circle(bilbo.x + dx, bilbo.y - 10, 2, 0xf0d070, 0.8).setDepth(bilbo.y + 40 + n),
        );
        sfx.jingle();
        await Promise.all(
          notes.map((p, n) => tween(s, p, { y: p.y - 26 - n * 4, alpha: 0 }, 1800)),
        );
        notes.forEach((p) => p.destroy());
      });
    if (i === at('lindir')) beat(s, () => gesture(s, npcOf(s, 'lindir')));
    if (i === at('peep')) beat(s, () => pause(s, 500));
    if (i === at('shadow'))
      beat(s, async () => {
        const bilbo = npcOf(s, 'bilboelder');
        r.shade = s.add.rectangle(480, 360, 320, 240, 0x101018, 0).setScrollFactor(0).setDepth(851);
        sfx.sting();
        bilbo.setTint(0x6a5a50);
        await tween(s, r.shade, { alpha: 0.4 }, 500);
        await pause(s, 500);
        bilbo.clearTint();
        await tween(s, r.shade, { alpha: 0 }, 700);
        r.shade.destroy();
      });
    if (i === at('sleep'))
      beat(s, async () => {
        const bilbo = npcOf(s, 'bilboelder');
        await tween(s, bilbo, { angle: 14 }, 900);
        const g = temp(s, 'rv_song', 'gandalfrv', 15, 20, 'up');
        await enter(s, g, 9, 15, 15, 20);
        face(g, 'left');
      });
  },
  rv_council1(s, i) {
    const at = (id) => act(s, id, 'rv_council1');
    if (i === at('dawn')) {
      playMusic('council');
      beat(s, async () => {
        focus(s, 48, 20);
        await pause(s, 1300);
      });
    }
    if (i === at('gloin')) beat(s, () => gesture(s, npcOf(s, 'gloin')));
    if (i === at('history')) beat(s, () => gesture(s, npcOf(s, 'elrond')));
    if (i === at('boromir'))
      beat(s, async () => {
        focus(s, 51, 21);
        await gesture(s, npcOf(s, 'boromir'));
      });
  },
  rv_council2(s, i) {
    const r = s.rv;
    const at = (id) => act(s, id, 'rv_council2');
    if (i === at('boromir')) beat(s, () => gesture(s, npcOf(s, 'boromir')));
    if (i === at('aragorn'))
      beat(s, async () => {
        r.shards?.setVisible(true);
        sfx.jingle();
        await gesture(s, npcOf(s, 'dunadan'));
      });
    if (i === at('bilbo')) beat(s, () => gesture(s, npcOf(s, 'bilboelder')));
    if (i === at('ring'))
      beat(s, async () => {
        // Transient: the Ring lies on the stone for this page alone.
        r.ring = s.add
          .circle(48 * TILE + 8, 20 * TILE + 4, 3, 0xf0c850, 1)
          .setDepth(20 * TILE + 12);
        sfx.sting();
        await tween(s, r.ring, { scale: 1.5 }, 700);
        await pause(s, 600);
      });
    if (i === at('saruman'))
      beat(s, async () => {
        if (r.ring) {
          await tween(s, r.ring, { alpha: 0 }, 600);
          r.ring.destroy();
          r.ring = null;
        }
        await gesture(s, npcOf(s, 'gandalfrv'));
      });
    if (i === at('legolas')) beat(s, () => gesture(s, npcOf(s, 'legolas')));
  },
  rv_council3(s, i) {
    const r = s.rv;
    const at = (id) => act(s, id, 'rv_council3');
    if (i === at('debate')) beat(s, () => pause(s, 400));
    if (i === at('silence'))
      beat(s, async () => {
        r.hush = s.add.rectangle(480, 360, 320, 240, 0x101820, 0).setScrollFactor(0).setDepth(851);
        await tween(s, r.hush, { alpha: 0.3 }, 1500);
      });
    if (i === at('speak'))
      beat(
        s,
        async () => {
          sfx.confirm();
          const y0 = s.player.y;
          await tween(s, s.player, { y: y0 - 3 }, 200);
          await Promise.all([
            tween(s, s.player, { y: y0 }, 200),
            tween(s, r.hush, { alpha: 0 }, 900),
          ]);
          r.hush.destroy();
        },
        'Rise and speak',
      );
    if (i === at('sam'))
      beat(s, async () => {
        r.sam = temp(s, 'rv_council3', 'sam', 47, 27, 'up');
        r.sam.setAlpha(1);
        await walk(s, r.sam, 47, 22, 85);
        await gesture(s, r.sam);
      });
    if (i === at('end')) beat(s, () => gesture(s, npcOf(s, 'elrond')));
  },
  rv_weeks(s, i) {
    const r = s.rv;
    const at = (id) => act(s, id, 'rv_weeks');
    if (i === at('fall'))
      beat(s, async () => {
        playMusic('rivendell');
        await tween(s, r.sky, { alpha: 0.3 }, 1600);
      });
    if (i === at('scouts'))
      beat(s, async () => {
        focus(s, 30, 38);
        await pause(s, 1300);
      });
    if (i === at('hobbits'))
      beat(s, async () => {
        const m = temp(s, 'rv_weeks', 'merry', AT.hobbitsFrom.x, AT.hobbitsFrom.y, 'right');
        const p = temp(s, 'rv_weeks', 'pippin', AT.hobbitsFrom.x - 1, AT.hobbitsFrom.y, 'right');
        s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
        await Promise.all([
          walk(s, m, AT.hobbitsTo.x, AT.hobbitsTo.y, 70),
          walk(s, p, AT.hobbitsTo.x - 1, AT.hobbitsTo.y + 1, 70),
        ]);
        face(m, 'left');
        face(p, 'left');
        await gesture(s, p);
      });
    if (i === at('snow'))
      beat(s, async () => {
        await tween(s, r.sky, { alpha: 0.16 }, 1500);
      });
  },
  rv_gifts(s, i) {
    const at = (id) => act(s, id, 'rv_gifts');
    if (i === at('room'))
      beat(s, async () => {
        focus(s, 19, 6);
        await pause(s, 1000);
      });
    if (i === at('sting'))
      beat(s, async () => {
        const blade = s.add
          .rectangle(21 * TILE + 8, 5 * TILE + 4, 10, 2, 0xcfe4f4)
          .setDepth(5 * TILE + 12);
        s.rv.prop = blade;
        sfx.jingle();
        await gesture(s, npcOf(s, 'bilboelder'));
      });
    if (i === at('mail'))
      beat(s, async () => {
        const sparkle = [0, 1, 2].map((n) =>
          s.add
            .rectangle(21 * TILE + 3 + n * 5, 5 * TILE - 2, 2, 2, 0xffffff)
            .setDepth(5 * TILE + 20),
        );
        await Promise.all(
          sparkle.map((p, n) => tween(s, p, { y: p.y - 10, alpha: 0 }, 900 + n * 100)),
        );
        sparkle.forEach((p) => p.destroy());
        s.rv.prop?.destroy();
        s.rv.prop = null;
      });
    if (i === at('snow'))
      beat(s, async () => {
        const flakes = Array.from({ length: 10 }, (_, n) =>
          s.add
            .rectangle((20 + (n % 4) * 0.6) * TILE, 3 * TILE + n, 2, 2, 0xffffff, 0.9)
            .setDepth(4 * TILE),
        );
        await Promise.all(
          flakes.map((p, n) => tween(s, p, { y: p.y + 20, alpha: 0 }, 1400 + n * 80)),
        );
        flakes.forEach((p) => p.destroy());
      });
  },
  rv_company(s, i) {
    const r = s.rv;
    const at = (id) => act(s, id, 'rv_company');
    if (i === at('gather'))
      beat(s, async () => {
        playMusic('parting');
        const from = AT.walkersFrom;
        const walkers = [...WALKERS, ...FAREWELL];
        await Promise.all(
          walkers.map(async (w, n) => {
            const key = w.key;
            const known = r.walk?.[key];
            const sprite = known
              ? known
                  .setVisible(true)
                  .setPosition(from.x * TILE + 8, from.y * TILE)
                  .setAlpha(1)
              : temp(s, 'rv_company', key, from.x, from.y, 'down');
            sprite.setAlpha(1);
            await pause(s, n * 180);
            await walk(s, sprite, w.x, w.y, 70);
            // Stand exactly where the same character stands after a reload.
            sprite.setY(w.y * TILE + 6).setDepth(w.y * TILE + 6);
            face(sprite, w.dir ?? 'down');
          }),
        );
        face(s.player, 'down');
      });
    if (i === at('names'))
      beat(s, () =>
        gesture(
          s,
          r.temp.find((t) => t.texture.key === 'elrond'),
        ),
      );
    if (i === at('sword'))
      beat(s, () =>
        gesture(
          s,
          r.temp.find((t) => t.texture.key === 'dunadan'),
        ),
      );
    if (i === at('depart'))
      beat(s, async () => {
        focus(s, 30, 41);
        await tween(s, r.sky, { alpha: 0.4 }, 1800);
      });
  },
};

export function rvDialogue(s) {
  // Revisited pages carry no effects and no choreography.
  if (!s.dialogStage?.set || !s.rv) return;
  SCENES[s.dialogKey]?.(s, s.dialogIndex);
}

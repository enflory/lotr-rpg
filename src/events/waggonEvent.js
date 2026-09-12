// "You shouldn't be walking the lanes at night." — Farmer Maggot drives the
// hobbits from Bamfurlong down to the Bucklebury Ferry, as he does at the end
// of "A Shortcut to Mushrooms": in the dark, with the river fog coming up, and
// with one halt on the road when hoofs are heard behind them. The light that
// answers out of the mist is Merry's lantern, not a Rider.
//
// The ride is a watched scene, not a fade to black. It ends with the party
// standing at the lamplit landing — the same spot the old fade-teleport left
// them — so everything downstream of `rodeWaggon` is unchanged.

import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag, setFlag, setObjective } from '../state/GameState.js';
import { sfx } from '../audio/sound.js';
import { makeWaggon } from '../art/waggon.js';
import { raiseNight } from '../art/marishNight.js';
import { PIER_X, LANE_ROW } from '../data/zones/marish.js';
import { tween } from './storyMotion.js';

// The lane, in pixels, from Maggot's gate to the landing. The two straights
// are joined where the lane itself bends, so the waggon never leaves the road.
// Built on demand: the Marish zone pulls this module in, so reading its lane
// constants at module load would read them before the zone has defined them.
const GATE_ROW = 11;
export function route() {
  // The turn is taken at x=30. The lane is carved two cells wide through the
  // bend, but Bamfurlong's east fence stands in the western one of them, so
  // the cart drops down the eastern one or it drives through a fence.
  const BEND = 30;
  return [
    { x: 25 * TILE_SIZE, y: GATE_ROW * TILE_SIZE + 8 },
    { x: BEND * TILE_SIZE + 8, y: GATE_ROW * TILE_SIZE + 8 },
    { x: BEND * TILE_SIZE + 8, y: (LANE_ROW + 1) * TILE_SIZE + 8 },
    { x: 40 * TILE_SIZE, y: (LANE_ROW + 1) * TILE_SIZE + 8 },
    { x: 44 * TILE_SIZE, y: (LANE_ROW + 1) * TILE_SIZE + 8 },
  ];
}
const HALT_AT = 3; // the leg that ends with hoofs on the road behind
const SPEED = 62; // px/sec — a laden farm cart, trotting in the dark

// Where each rider sits, measured from the waggon's own origin.
export const SEATS = [
  { key: 'maggot', x: 13, y: -27 },
  { key: 'player', x: -2, y: -23 },
  { key: 'sam', x: -11, y: -21 },
  { key: 'pippin', x: -19, y: -19 },
];

const pause = (s, ms) => new Promise((resolve) => s.time.delayedCall(ms, resolve));

function freeze(s) {
  s.player.setVelocity(0);
  s.player.body.enable = false;
  s.player.setData('held', true);
  s.hintIcon.setVisible(false);
  for (const p of s.followers) p.setData('held', true);
  s.storyBeat = { busy: true };
}

function unfreeze(s) {
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  s.player.setData('held', false);
  for (const p of s.followers) p.setData('held', false);
  s.storyBeat = null;
  s.trail = [s.player, ...s.followers].map((p) => ({ x: p.x, y: p.y }));
  s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
}

/** The sprite for each seat, in seating order, skipping anyone not present. */
function crew(s, maggot) {
  return SEATS.map(({ key, x, y }) => {
    const sprite =
      key === 'maggot'
        ? maggot
        : key === 'player'
          ? s.player
          : s.followers.find((p) => p.getData('key') === key);
    return sprite && { sprite, x, y };
  }).filter(Boolean);
}

function seat(waggon, riders, wx, wy) {
  waggon.place(wx, wy);
  for (const { sprite, x, y } of riders) {
    sprite.setPosition(wx + x, wy + y);
    sprite.setDepth(wy + 4 - x / 8);
  }
}

/** One leg of the lane, with everyone aboard riding along with the cart. */
async function roll(s, waggon, riders, from, to) {
  const at = { x: from.x, y: from.y };
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  for (const { sprite } of riders) {
    const dir = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y) ? 'right' : 'down';
    sprite.anims.play(`${sprite.getData('key') || sprite.texture.key}-idle-${dir}`, true);
  }
  await tween(
    s,
    at,
    { x: to.x, y: to.y, ease: 'Linear', onUpdate: () => seat(waggon, riders, at.x, at.y) },
    Math.max(150, (distance / SPEED) * 1000),
  );
  seat(waggon, riders, to.x, to.y);
}

export async function startWaggonRide(s) {
  if (s.waggonRide) return;
  s.waggonRide = true;
  freeze(s);

  // Maggot leaves his gate and climbs up on the seat.
  const maggot = s.npcs.find((n) => n.getData('key') === 'maggot');
  const driver = s.add.sprite(0, 0, 'maggot', 7).setData('key', 'maggot');
  if (maggot) s.removeNpc('maggot');

  const ROUTE = route();
  const waggon = makeWaggon(s);
  const riders = crew(s, driver);
  seat(waggon, riders, ROUTE[0].x, ROUTE[0].y);
  s.cameras.main.startFollow(waggon.body, true, 0.09, 0.09);

  raiseNight(s, s.marishNight, 1800);
  s.showBanner('Night comes down\non the Marish.');
  await pause(s, 1500);
  sfx.door(); // the cart creaking out of the yard

  for (let i = 1; i < ROUTE.length; i++) {
    await roll(s, waggon, riders, ROUTE[i - 1], ROUTE[i]);
    if (i !== HALT_AT) continue;

    // The halt. In the book Maggot stops the waggon dead and they all sit
    // still in the dark, and what comes out of the fog is a friend.
    sfx.sting();
    s.showBanner('Hoofs on the road\nbehind you. Maggot halts.');
    await pause(s, 1800);
    const lamp = s.add
      .ellipse(ROUTE[i].x + 150, ROUTE[i].y - 6, 10, 8, 0xffc46a, 0.9)
      .setDepth(ROUTE[i].y + 8)
      .setBlendMode('ADD');
    await tween(s, lamp, { x: ROUTE[i].x + 58, scaleX: 4, scaleY: 4, alpha: 0.5 }, 1300);
    s.showBanner('A lantern swings out of\nthe fog. Only a friend.');
    await pause(s, 1500);
    await tween(s, lamp, { alpha: 0 }, 500);
    lamp.destroy();
  }

  // Down at the landing. Maggot puts them off, wishes them good night, and
  // turns the waggon for home.
  s.showBanner('"Good night to you,\nMr. Baggins!"');
  await pause(s, 1500);

  const landing = s.zone.spawns.landing;
  s.player.setPosition(landing.x * TILE_SIZE + 8, landing.y * TILE_SIZE + 8);
  s.player.setDepth(s.player.y);
  s.snapFollower();
  driver.setPosition(ROUTE[ROUTE.length - 1].x + 13, ROUTE[ROUTE.length - 1].y - 27);
  s.spawnNpc({ key: 'merry', x: PIER_X - 2, y: LANE_ROW - 1, dir: 'down' });

  setFlag('rodeWaggon');
  setObjective('Cross the Brandywine with Merry');
  s.checkpoint?.('landing');
  unfreeze(s);

  // The cart rolls back the way it came while the player has the run of the
  // landing again — nothing below depends on it, so it is not awaited.
  const home = { x: ROUTE[ROUTE.length - 1].x, y: ROUTE[ROUTE.length - 1].y };
  s.tweens.add({
    targets: home,
    x: ROUTE[2].x,
    duration: 9000,
    ease: 'Linear',
    onUpdate: () => {
      waggon.place(home.x, home.y);
      driver.setPosition(home.x + 13, home.y - 27).setDepth(home.y + 4);
    },
    onComplete: () => {
      waggon.destroy();
      driver.destroy();
    },
  });
}

/** zone.onUpdate — the ride begins the moment Maggot's offer is accepted. */
export function waggonEventUpdate(s) {
  if (!hasFlag('maggotRide') || hasFlag('rodeWaggon') || s.waggonRide) return;
  startWaggonRide(s);
}

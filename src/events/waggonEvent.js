// "You shouldn't be walking the lanes at night." — Farmer Maggot drives the
// hobbits from Bamfurlong down to the Bucklebury Ferry, as he does at the end
// of "A Shortcut to Mushrooms": in the dark, with the river fog coming up, and
// with one halt on the road when someone approaches through the fog. The
// light that answers out of the mist is Merry's lantern, not a Rider.
//
// The ride runs east along the causeway and nowhere else. The lane turns a
// right angle at the farm, and a cart drawn from the side cannot turn a right
// angle — it can only slide down the corner looking like it is on ice — so
// climbing aboard is covered by a short fade and the whole of the drive is
// straight. It ends with the party standing at the lamplit landing, the same
// spot the old fade-teleport left them, so everything downstream of
// `rodeWaggon` is unchanged.

import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag, setFlag, setObjective } from '../state/GameState.js';
import { sfx } from '../audio/sound.js';
import { makeWaggon } from '../art/waggon.js';
import { raiseNight } from '../art/marishNight.js';
import { PIER_X, LANE_ROW } from '../data/zones/marish.js';
import { tween } from './storyMotion.js';

// Built on demand: the Marish zone pulls this module in, so reading its lane
// constants at module load would read them before the zone has defined them.
export function route() {
  const y = (LANE_ROW + 1) * TILE_SIZE + 8;
  return [
    { x: 30 * TILE_SIZE, y }, // on the causeway, past the turn
    { x: 37 * TILE_SIZE, y }, // where the hoofs are heard
    { x: 41 * TILE_SIZE, y }, // drawn up short of the landing
  ];
}
const HALT_AT = 1; // the leg that ends with someone approaching through the fog
const SPEED = 32; // px/sec — a laden farm cart, walking pace, in the dark

// Where each rider sits, measured from the waggon's own origin.
export const SEATS = [
  { key: 'maggot', x: 13, y: -27 },
  { key: 'player', x: -2, y: -23 },
  { key: 'sam', x: -11, y: -21 },
  { key: 'pippin', x: -19, y: -19 },
];

const pause = (s, ms) => new Promise((resolve) => s.time.delayedCall(ms, resolve));
const fade = (s, out, ms) =>
  new Promise((resolve) => {
    s.cameras.main[out ? 'fadeOut' : 'fadeIn'](ms, 0, 0, 0);
    s.cameras.main.once(out ? 'camerafadeoutcomplete' : 'camerafadeincomplete', resolve);
  });

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

// Everyone aboard rides with the cart, rumble included.
function seat(waggon, riders, wx, wy) {
  const bob = waggon.place(wx, wy);
  for (const { sprite, x, y } of riders) {
    sprite.setPosition(wx + x, wy + y + bob);
    sprite.setDepth(wy + 4 - x / 8);
  }
}

/**
 * One leg of the causeway. Eased at both ends: a cart pulls away and draws up,
 * it does not snap to a constant speed and then stop dead.
 */
async function roll(s, waggon, riders, from, to) {
  const at = { x: from.x, y: from.y };
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  for (const { sprite } of riders) {
    sprite.anims.play(`${sprite.getData('key') || sprite.texture.key}-idle-right`, true);
  }
  await tween(
    s,
    at,
    { x: to.x, y: to.y, onUpdate: () => seat(waggon, riders, at.x, at.y) },
    Math.max(150, (distance / SPEED) * 1000),
  );
  seat(waggon, riders, to.x, to.y);
}

/**
 * Merry comes up the road out of the fog with a lantern, rather than a glow
 * growing out of nothing and an NPC appearing at the landing afterwards.
 */
function lanternBearer(s, x, y) {
  const sprite = s.add
    .sprite(x, y - 10, 'merry', 4)
    .setDepth(y + 6)
    .setAlpha(0);
  const lamp = s.add
    .ellipse(x + 8, y - 2, 46, 32, 0xffc46a, 0.38)
    .setDepth(y + 5)
    .setBlendMode('ADD')
    .setAlpha(0);
  const at = { x, y: y - 10 };
  const put = () => {
    sprite.setPosition(at.x, at.y).setDepth(at.y);
    lamp.setPosition(at.x + 8, at.y + 8).setDepth(at.y - 1);
  };
  return {
    sprite,
    lamp,
    at,
    put,
    show: (ms) => {
      s.tweens.add({ targets: sprite, alpha: 1, duration: ms });
      s.tweens.add({ targets: lamp, alpha: 0.38, duration: ms });
    },
    walk: (to, ms, dir) => {
      sprite.anims.play(`merry-walk-${dir}`, true);
      return tween(s, at, { ...to, onUpdate: put }, ms).then(() => {
        sprite.anims.play(`merry-idle-${dir}`, true);
      });
    },
    destroy: () => {
      sprite.destroy();
      lamp.destroy();
    },
  };
}

export async function startWaggonRide(s) {
  if (s.waggonRide) return;
  s.waggonRide = true;
  freeze(s);

  const ROUTE = route();
  const landing = s.zone.spawns.landing;

  // Climbing up beside him, and the turn out of the farm lane, happen behind a
  // short fade. What the ride itself is worth watching for starts on the road.
  await fade(s, true, 450);
  const maggot = s.npcs.find((n) => n.getData('key') === 'maggot');
  if (maggot) s.removeNpc('maggot');
  const driver = s.add.sprite(0, 0, 'maggot', 7).setData('key', 'maggot');
  const waggon = makeWaggon(s);
  const riders = crew(s, driver);
  seat(waggon, riders, ROUTE[0].x, ROUTE[0].y);
  s.cameras.main.startFollow(waggon.body, true, 0.09, 0.09);
  raiseNight(s, s.marishNight, 0);
  await fade(s, false, 700);
  s.showBanner('Night comes down\non the Marish.');
  sfx.door(); // the cart creaking onto the causeway
  await pause(s, 1200);

  let merryAtLanding = Promise.resolve();
  for (let i = 1; i < ROUTE.length; i++) {
    await roll(s, waggon, riders, ROUTE[i - 1], ROUTE[i]);
    if (i !== HALT_AT) continue;

    // The halt. In the book Maggot stops the waggon dead and they all sit
    // still in the dark, and what comes out of the fog is a friend.
    sfx.sting();
    s.showBanner('A sound in the fog\nahead. Maggot halts.');
    await pause(s, 1600);

    // Come from the pier, not the water beyond it.
    const merry = lanternBearer(s, PIER_X * TILE_SIZE + 8, ROUTE[i].y);
    merry.show(900);
    await merry.walk({ x: ROUTE[i].x + 72 }, 2600, 'left');
    s.showBanner('A lantern out of the fog --\nand Merry Brandybuck\nbehind it.');
    await pause(s, 1700);
    // He turns and leads them down to the landing, keeping ahead of the cart.
    const landingNpc = s.zone.npcs.find((n) => n.key === 'merry' && n.x < PIER_X);
    merryAtLanding = (async () => {
      await merry.walk({ x: landingNpc.x * TILE_SIZE + 8 }, 2800, 'right');
      await merry.walk({ y: landingNpc.y * TILE_SIZE + 6 }, 900, 'up');
      merry.destroy();
      s.spawnNpc(landingNpc);
    })();
  }

  // Down at the landing. Maggot puts them off and wishes them good night.
  s.showBanner('"Good night to you,\nMr. Baggins!"');
  await pause(s, 1200);

  // Step down off the cart and walk on past its nose to the landing, rather
  // than blinking onto the lane. Everyone ends up east of the cart, so it can
  // turn for home without driving straight through the party.
  const ground = landing.y * TILE_SIZE + 8;
  await Promise.all(
    [s.player, ...s.followers].map((sprite, i) => {
      const to = { x: (landing.x + i * 0.9) * TILE_SIZE + 8, y: ground };
      sprite.anims.play(`${sprite.getData('key') || 'frodo'}-walk-right`, true);
      return tween(s, sprite, { ...to, onUpdate: () => sprite.setDepth(sprite.y) }, 900).then(() =>
        sprite.anims.play(`${sprite.getData('key') || 'frodo'}-idle-down`, true),
      );
    }),
  );
  s.player.setDepth(s.player.y);

  // Finish the actor-to-NPC handoff before conversations can refresh spawns.
  await merryAtLanding;
  setFlag('rodeWaggon');
  setObjective('Cross the Brandywine with Merry');
  s.checkpoint?.('landing');
  unfreeze(s);

  // The cart turns for home. It is drawn facing east, so it has to be flipped
  // or it reverses the whole way back up the lane. Nothing below waits on it.
  await pause(s, 900);
  waggon.setFacing(-1);
  driver.setFrame(4);
  const home = { x: ROUTE[ROUTE.length - 1].x, y: ROUTE[ROUTE.length - 1].y };
  s.tweens.add({
    targets: home,
    x: ROUTE[0].x - 40,
    duration: 8000,
    ease: 'Sine.easeIn',
    onUpdate: () => {
      const bob = waggon.place(home.x, home.y);
      driver.setPosition(home.x - 13, home.y - 27 + bob).setDepth(home.y + 4);
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

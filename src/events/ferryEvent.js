// The Marish set pieces: Farmer Maggot's waggon ride to the ferry
// landing, and the raft crossing of the Brandywine — with a Black
// Rider halting on the bank behind, as in the book.
//
// The raft is moored beside the pier from the moment the zone builds
// (ferryZoneCreate); the crossing machine floats it over. Phases:
// idle → riding (fade-teleport to the landing) → armed → crossing →
// done. Inert once `crossedFerry`.

import { T, TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag, setFlag, setObjective } from '../state/GameState.js';
import { sfx } from '../audio/sound.js';
import { PIER_X, LANE_ROW, RAFT_X, BANK_LAND_X, RIDER_START_X } from '../data/zones/marish.js';

const CROSS_MS = 6000;
const CROSS_PX = 3 * TILE_SIZE; // raft travel — it stops in the shallows,
// never overlapping the grass bank (the deck art has water edges)
const RIDER_SPEED = 96; // px/sec, hard gallop down the lane

// zone.onCreate — moor the raft: west of the river before the
// crossing, in the eastern shallows after it.
export function ferryZoneCreate(scene) {
  const rx = (hasFlag('crossedFerry') ? RAFT_X + 3 : RAFT_X) * TILE_SIZE;
  const ry = LANE_ROW * TILE_SIZE;
  scene.ferryRaft = [];
  for (const [dx, dy, frame] of [
    [0, 0, T.DOCK],
    [1, 0, T.DOCK],
    [0, 1, T.DOCK_S],
    [1, 1, T.DOCK_S],
  ]) {
    const img = scene.add.image(rx + dx * TILE_SIZE + 8, ry + dy * TILE_SIZE + 8, 'tileset', frame);
    img.setDepth(ry + dy * TILE_SIZE - 4);
    scene.ferryRaft.push(img);
  }
}

export function ferryEventUpdate(scene, delta) {
  if (hasFlag('crossedFerry')) return;

  let ev = scene.ferryEvent;
  if (!ev) {
    ev = scene.ferryEvent = {
      phase: 'idle',
      crossT: 0,
      crew: [],
      rider: null,
      riderHalted: false,
    };
  }

  if (ev.phase === 'idle') {
    if (hasFlag('rodeWaggon')) {
      ev.phase = 'armed'; // re-entered the zone after the ride
      return;
    }
    if (hasFlag('maggotRide')) {
      // Maggot drives them through the dusk — fade out at the farm,
      // fade in at the lamplit landing.
      ev.phase = 'riding';
      scene.inputLocked = true;
      scene.cameras.main.fadeOut(700, 0, 0, 0);
      scene.cameras.main.once('camerafadeoutcomplete', () => {
        setFlag('rodeWaggon');
        scene.removeNpc('maggot');
        const s = scene.zone.spawns.landing;
        scene.player.setPosition(s.x * TILE_SIZE + 8, s.y * TILE_SIZE + 8);
        scene.snapFollower();
        scene.spawnNpc({ key: 'merry', x: PIER_X - 2, y: LANE_ROW - 1, dir: 'down' });
        scene.inputLocked = false;
        scene.cameras.main.fadeIn(700, 0, 0, 0);
        scene.showBanner("Maggot's waggon rattles on\nthrough the dusk...");
        ev.phase = 'armed';
      });
    }
    return;
  }

  if (ev.phase === 'armed') {
    if (!hasFlag('merryMet')) return;
    const tx = Math.floor(scene.player.x / TILE_SIZE);
    if (tx < PIER_X) return;

    // ── board the moored raft ──────────────────────────
    ev.phase = 'crossing';
    ev.crossT = 0;
    scene.inputLocked = true;
    scene.player.body.enable = false; // the river is solid tiles

    const rx = RAFT_X * TILE_SIZE;
    const ry = LANE_ROW * TILE_SIZE;
    // Crew aboard: Frodo, Sam and Pippin behind, Merry at the pole
    ev.crew = [];
    const aboard = (sprite, ox, oy) => {
      if (!sprite) return;
      sprite.setPosition(rx + ox, ry + oy);
      ev.crew.push({ sprite, ox, oy });
    };
    aboard(scene.player, 8, 6);
    const companions = scene.followers ?? [scene.follower].filter(Boolean);
    companions.forEach((sprite, i) => aboard(sprite, i === 0 ? 22 : 8, 20));
    const merry = scene.npcs.find((n) => n.getData('key') === 'merry');
    aboard(merry, 24, 2);
    sfx.door(); // creak of the raft pushing off
    return;
  }

  if (ev.phase === 'crossing') {
    ev.crossT += delta;
    const p = Math.min(1, ev.crossT / CROSS_MS);
    const off = p * CROSS_PX;
    const rx = RAFT_X * TILE_SIZE + off;
    const ry = LANE_ROW * TILE_SIZE;
    (scene.ferryRaft || []).forEach((img, i) => {
      img.setPosition(rx + (i % 2) * TILE_SIZE + 8, ry + Math.floor(i / 2) * TILE_SIZE + 8);
    });
    for (const { sprite, ox, oy } of ev.crew) {
      sprite.setPosition(rx + ox, ry + oy);
      if (sprite.setDepth) sprite.setDepth(sprite.y);
    }

    // Midstream, hoofbeats: a Rider sweeps down to the landing and
    // halts at the water's edge
    if (!ev.rider && p > 0.35) {
      ev.rider = scene.add.sprite(RIDER_START_X * TILE_SIZE, LANE_ROW * TILE_SIZE + 8, 'rider');
      ev.rider.play('rider-gallop');
      ev.rider.setDepth(ev.rider.y + 8);
      sfx.sting();
    }
    if (ev.rider && !ev.riderHalted) {
      const stopX = (PIER_X - 1) * TILE_SIZE + 4;
      ev.rider.x += (RIDER_SPEED * delta) / 1000;
      if (ev.rider.x >= stopX) {
        ev.rider.x = stopX;
        ev.riderHalted = true;
        ev.rider.anims.pause();
        scene.cameras.main.flash(300, 120, 0, 0);
        scene.showBanner("A dark figure halts at\nthe water's edge...");
      }
    }

    if (p >= 1) {
      // ── the Buckland shore ───────────────────────────
      ev.phase = 'done';
      scene.player.setPosition(BANK_LAND_X * TILE_SIZE + 8, LANE_ROW * TILE_SIZE + 8);
      scene.player.body.enable = true;
      scene.snapFollower();
      const merry = scene.npcs.find((n) => n.getData('key') === 'merry');
      if (merry) merry.setPosition(BANK_LAND_X * TILE_SIZE + 8, (LANE_ROW - 1) * TILE_SIZE + 6);
      scene.inputLocked = false;
      setFlag('crossedFerry');
      setObjective('Follow Merry east to Crickhollow');
      scene.checkpoint?.('buckland');
      sfx.jingle();
      scene.showBanner('You have crossed\nthe Brandywine.');
    }
  }
}

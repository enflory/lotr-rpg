// The Black Rider encounter in the Woody End.
//
// Crossing a trigger point on the road summons a Black Rider galloping
// up from behind (the west). The player must stand in a fern brake off
// the road when he draws level, or be caught and thrown back to the
// zone entrance. Book-faithful: the Rider stops, sniffs, and moves on.

import { T, TILE_SIZE } from '../data/tileTypes.js';
import { setFlag, hasFlag, setObjective } from '../state/GameState.js';
import { ROAD_Y, RIDER_EXIT_X, GILDOR_SPOT, ELF_SPOTS } from '../data/zones/woodyend.js';
import { sfx } from '../audio/sound.js';

const RIDER_SPEED = 88; // px/sec — faster than the player's 72
const TRIGGER_TILE_X = 11;
const CATCH_RANGE = 22; // px, horizontal

function roadCenterY(x) {
  const tx = Math.min(ROAD_Y.length - 1, Math.max(0, Math.floor(x / TILE_SIZE)));
  return ROAD_Y[tx] * TILE_SIZE + TILE_SIZE; // seam between the two road rows
}

function hidden(scene, sprite) {
  const tx = Math.floor(sprite.x / TILE_SIZE);
  const ty = Math.floor((sprite.y + 8) / TILE_SIZE); // feet
  const row = scene.zone.map[ty];
  return row !== undefined && row[tx] === T.FERN;
}

export function riderEventUpdate(scene, delta) {
  if (hasFlag('escapedRider')) return;
  const party = [scene.player, ...(scene.followers ?? [])];
  const partyHidden = () => party.every((sprite) => hidden(scene, sprite));

  let ev = scene.riderEvent;
  if (!ev) ev = scene.riderEvent = { phase: 'armed', rider: null, sniffed: false, sniffTimer: 0 };

  if (ev.phase === 'armed') {
    const tx = Math.floor(scene.player.x / TILE_SIZE);
    if (tx >= TRIGGER_TILE_X) {
      ev.phase = 'riding';
      ev.sniffed = false;
      sfx.sting();
      scene.showBanner('You hear hoofbeats behind you...\nHIDE IN THE FERNS!');
      const startX = Math.max(24, scene.player.x - 160);
      ev.rider = scene.add.sprite(startX, roadCenterY(startX) - 8, 'rider');
      ev.rider.play('rider-gallop');
      ev.rider.setDepth(ev.rider.y + 8);
    }
    return;
  }

  if (ev.phase === 'riding') {
    const r = ev.rider;
    r.x += (RIDER_SPEED * delta) / 1000;
    // Follow the road's bends
    const targetY = roadCenterY(r.x) - 8;
    r.y += Math.sign(targetY - r.y) * Math.min(Math.abs(targetY - r.y), (60 * delta) / 1000);
    r.setDepth(r.y + 8);

    const dx = r.x - scene.player.x;

    // Pause to sniff as he passes the player's hiding spot
    if (!ev.sniffed && Math.abs(dx) < 6 && partyHidden()) {
      ev.sniffed = true;
      ev.phase = 'sniffing';
      ev.sniffTimer = 1600;
      r.anims.pause();
      return;
    }

    if (
      party.some(
        (sprite) =>
          !hidden(scene, sprite) &&
          Math.abs(r.x - sprite.x) < CATCH_RANGE &&
          Math.abs(r.y - sprite.y) < 40,
      )
    ) {
      ev.phase = 'caught';
      scene.cameras.main.flash(300, 120, 0, 0);
      scene.showBanner('The Black Rider saw you!');
      scene.inputLocked = true;
      scene.time.delayedCall(900, () => {
        scene.cameras.main.fadeOut(500, 0, 0, 0);
        scene.cameras.main.once('camerafadeoutcomplete', () => {
          r.destroy();
          ev.rider = null;
          ev.phase = 'armed';
          const s = scene.zone.spawns.west;
          scene.player.setPosition(s.x * TILE_SIZE + 8, s.y * TILE_SIZE + 8);
          scene.snapFollower();
          scene.inputLocked = false;
          scene.cameras.main.fadeIn(500, 0, 0, 0);
          scene.showBanner('He nearly had you.\nStay hidden as he passes!');
        });
      });
      return;
    }

    // Safely past — he gives up the scent and gallops on
    // (vanishing into the trees before the riverbank)
    if (dx > 110 || r.x > RIDER_EXIT_X * TILE_SIZE) {
      r.destroy();
      ev.rider = null;
      ev.phase = 'done';
      setFlag('escapedRider');
      setObjective('Speak with the Elf in the clearing');
      sfx.jingle();
      scene.showBanner('The hoofbeats fade away...');
      // Gildor's company arrives, as in the book — Elves drive off the Rider
      scene.spawnNpc({ key: 'gildor', ...GILDOR_SPOT, dir: 'down' });
      for (const spot of ELF_SPOTS) scene.spawnNpc(spot);
    }
    return;
  }

  if (ev.phase === 'sniffing') {
    ev.sniffTimer -= delta;
    if (ev.sniffTimer <= 0) {
      ev.rider.anims.resume();
      ev.phase = 'riding';
    }
    // Creeping out of cover while he sniffs is fatal too
    if (!partyHidden()) {
      ev.rider.anims.resume();
      ev.phase = 'riding';
    }
  }
}

// The Marish set-piece machine: waggon ride (fade-teleport to the
// landing) and the Brandywine raft crossing with the Rider on the
// bank. Driven through a fake Phaser scene.

import { describe, it, expect, beforeEach } from 'vitest';
import { ferryEventUpdate, ferryZoneCreate } from '../src/events/ferryEvent.js';
import { gameState } from '../src/state/GameState.js';
import { TILE_SIZE } from '../src/data/tileTypes.js';
import { PIER_X, LANE_ROW, RAFT_X, BANK_LAND_X } from '../src/data/zones/marish.js';

function makeSprite(key, x = 0, y = 0) {
  return {
    key,
    x,
    y,
    setPosition(nx, ny) {
      this.x = nx;
      this.y = ny;
    },
    setDepth() {
      return this;
    },
    getData() {
      return this.key;
    },
    play() {},
    anims: {
      paused: false,
      pause() {
        this.paused = true;
      },
    },
  };
}

function makeScene() {
  const scene = {
    ferryEvent: null,
    inputLocked: false,
    zone: { spawns: { landing: { x: PIER_X - 4, y: LANE_ROW } } },
    player: {
      ...makeSprite('frodo', (PIER_X - 4) * TILE_SIZE, LANE_ROW * TILE_SIZE),
      body: { enable: true },
    },
    follower: makeSprite('sam'),
    npcs: [],
    banners: [],
    showBanner(t) {
      this.banners.push(t);
    },
    removed: [],
    removeNpc(k) {
      this.removed.push(k);
    },
    spawned: [],
    spawnNpc(def) {
      const npc = makeSprite(def.key, def.x * TILE_SIZE, def.y * TILE_SIZE);
      this.npcs.push(npc);
      this.spawned.push(def.key);
      return npc;
    },
    snapFollower() {},
    images: [],
    sprites: [],
    add: {
      image: (x, y, tex, frame) => {
        const img = {
          x,
          y,
          tex,
          frame,
          setPosition(nx, ny) {
            img.x = nx;
            img.y = ny;
          },
          setDepth() {
            return img;
          },
        };
        scene.images.push(img);
        return img;
      },
      sprite: (x, y, tex) => {
        const spr = makeSprite(tex, x, y);
        scene.sprites.push(spr);
        return spr;
      },
    },
    cameras: {
      main: {
        flashes: [],
        flash(...a) {
          this.flashes.push(a);
        },
        fadedOut: false,
        fadeOut() {
          this.fadedOut = true;
        },
        fadeIn() {},
        once(evt, cb) {
          cb();
        },
      },
    },
  };
  return scene;
}

beforeEach(() => {
  gameState.flags = {};
  gameState.objective = '';
});

describe('the waggon ride', () => {
  it('waits at the farm until Maggot offers the lift', () => {
    const scene = makeScene();
    ferryEventUpdate(scene, 16);
    expect(scene.ferryEvent.phase).toBe('idle');
    expect(scene.inputLocked).toBe(false);
  });

  it('fades to the landing, spawns Merry, and fires only once', () => {
    const scene = makeScene();
    gameState.flags.maggotRide = true;
    ferryEventUpdate(scene, 16); // fade fires synchronously in the fake

    expect(gameState.flags.rodeWaggon).toBe(true);
    expect(scene.removed).toEqual(['maggot']);
    expect(scene.spawned).toEqual(['merry']);
    expect(scene.player.x).toBe((PIER_X - 4) * TILE_SIZE + 8);
    expect(scene.ferryEvent.phase).toBe('armed');
    expect(scene.inputLocked).toBe(false);

    ferryEventUpdate(scene, 16); // no double-teleport
    expect(scene.removed).toEqual(['maggot']);
  });

  it('re-arms without a ride when the zone is re-entered later', () => {
    const scene = makeScene();
    gameState.flags.maggotRide = true;
    gameState.flags.rodeWaggon = true;
    ferryEventUpdate(scene, 16);
    expect(scene.ferryEvent.phase).toBe('armed');
    expect(scene.spawned).toEqual([]);
  });
});

describe('the moored raft', () => {
  it('waits beside the pier from zone creation, and in the shallows after', () => {
    const scene = makeScene();
    ferryZoneCreate(scene);
    expect(scene.images.length).toBe(4); // 2×2 raft, present before Merry
    expect(scene.images[0].x).toBe(RAFT_X * TILE_SIZE + 8);

    const after = makeScene();
    gameState.flags.crossedFerry = true;
    ferryZoneCreate(after);
    expect(after.images[0].x).toBe((RAFT_X + 3) * TILE_SIZE + 8); // eastern shallows
  });
});

describe('the ferry crossing', () => {
  function boardedScene() {
    const scene = makeScene();
    gameState.flags.maggotRide = true;
    gameState.flags.rodeWaggon = true;
    gameState.flags.merryMet = true;
    ferryZoneCreate(scene);
    ferryEventUpdate(scene, 16); // idle → armed
    scene.npcs.push(makeSprite('merry', (PIER_X - 2) * TILE_SIZE, (LANE_ROW - 1) * TILE_SIZE));
    scene.player.x = PIER_X * TILE_SIZE + 8; // step onto the pier
    return scene;
  }

  it('does not board before Merry readies the raft', () => {
    const scene = boardedScene();
    gameState.flags.merryMet = false;
    ferryEventUpdate(scene, 16);
    expect(scene.ferryEvent.phase).toBe('armed');
  });

  it('boards from the pier: locks input, disables the body, mans the raft', () => {
    const scene = boardedScene();
    scene.followers = [scene.follower, makeSprite('pippin')];
    ferryEventUpdate(scene, 16);
    expect(scene.ferryEvent.phase).toBe('crossing');
    expect(scene.inputLocked).toBe(true);
    expect(scene.player.body.enable).toBe(false);
    expect(scene.ferryEvent.crew.map(({ sprite }) => sprite.getData())).toEqual([
      'frodo',
      'sam',
      'pippin',
      'merry',
    ]);
  });

  it('keeps the raft over water for the whole crossing', () => {
    const scene = boardedScene();
    ferryEventUpdate(scene, 16); // board
    ferryEventUpdate(scene, 60_000); // run the tween to its end
    // Raft columns 38-39 at journey's end — the bank starts at 40
    const rightmost = Math.max(...scene.images.map((i) => i.x));
    expect(rightmost).toBeLessThan(BANK_LAND_X * TILE_SIZE);
  });

  it('summons the Rider midstream and halts him at the bank', () => {
    const scene = boardedScene();
    ferryEventUpdate(scene, 16); // board
    ferryEventUpdate(scene, 2600); // p ≈ 0.43 → rider spawns
    expect(scene.sprites.length).toBe(1);
    ferryEventUpdate(scene, 1500); // rider gallops to the water's edge
    expect(scene.ferryEvent.riderHalted).toBe(true);
    expect(scene.sprites[0].anims.paused).toBe(true);
    expect(scene.cameras.main.flashes.length).toBe(1);
  });

  it('lands on the Buckland shore and closes the chapter', () => {
    const scene = boardedScene();
    ferryEventUpdate(scene, 16);
    ferryEventUpdate(scene, 2600);
    ferryEventUpdate(scene, 1500);
    ferryEventUpdate(scene, 2500); // past CROSS_MS → landed

    expect(gameState.flags.crossedFerry).toBe(true);
    expect(gameState.objective).toMatch(/Chapter Two/);
    expect(scene.player.body.enable).toBe(true);
    expect(scene.player.x).toBe(BANK_LAND_X * TILE_SIZE + 8);
    expect(scene.inputLocked).toBe(false);

    ferryEventUpdate(scene, 16); // machine is now inert
    expect(scene.ferryEvent.phase).toBe('done');
  });
});

// The Black Rider state machine (armed → riding → sniffing → done/caught),
// driven through a fake Phaser scene. Positions use the real ROAD_Y so
// roadCenterY() lines up with where the test places the rider.

import { describe, it, expect, beforeEach } from 'vitest';
import { riderEventUpdate } from '../src/events/riderEvent.js';
import { gameState } from '../src/state/GameState.js';
import { T, TILE_SIZE } from '../src/data/tileTypes.js';
import { RIDER_EXIT_X } from '../src/data/zones/woodyend.js';

const WIDTH = 40,
  HEIGHT = 24;

function makeScene({ fernAt = [] } = {}) {
  const map = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(T.GRASS));
  for (const [x, y] of fernAt) map[y][x] = T.FERN;

  const scene = {
    zone: { map, spawns: { west: { x: 1, y: 12 } } },
    player: {
      x: 8,
      y: 8,
      setPosition(x, y) {
        this.x = x;
        this.y = y;
      },
    },
    banners: [],
    showBanner(text) {
      this.banners.push(text);
    },
    add: {
      sprite(x, y, key) {
        return {
          x,
          y,
          key,
          destroyed: false,
          play() {},
          setDepth() {},
          destroy() {
            this.destroyed = true;
          },
          anims: {
            paused: false,
            pause() {
              this.paused = true;
            },
            resume() {
              this.paused = false;
            },
          },
        };
      },
    },
    cameras: {
      main: {
        flash() {},
        fadeIn() {},
        fadeOut() {},
        once(event, cb) {
          scene._fadeCb = cb;
        },
      },
    },
    time: {
      delayedCall(ms, cb) {
        scene._delayedCb = cb;
      },
    },
    npcsSpawned: [],
    spawnNpc(def) {
      this.npcsSpawned.push(def);
    },
    snapFollower() {},
    inputLocked: false,
  };
  return scene;
}

// Position the player's feet on tile (tx, ty)
function placePlayer(scene, tx, ty) {
  scene.player.x = tx * TILE_SIZE + 8;
  scene.player.y = ty * TILE_SIZE + 4;
}

beforeEach(() => {
  gameState.flags = {};
});

describe('arming and trigger', () => {
  it('stays armed while the player is west of the trigger', () => {
    const scene = makeScene();
    placePlayer(scene, 5, 13);
    riderEventUpdate(scene, 16);
    expect(scene.riderEvent.phase).toBe('armed');
    expect(scene.riderEvent.rider).toBeNull();
  });

  it('summons the Rider behind the player at the trigger column', () => {
    const scene = makeScene();
    placePlayer(scene, 11, 13);
    riderEventUpdate(scene, 16);
    expect(scene.riderEvent.phase).toBe('riding');
    expect(scene.riderEvent.rider.x).toBeLessThan(scene.player.x);
    expect(scene.banners[0]).toMatch(/HIDE IN THE FERNS/);
  });

  it('does nothing once the Rider has been escaped', () => {
    gameState.flags.escapedRider = true;
    const scene = makeScene();
    placePlayer(scene, 20, 13);
    riderEventUpdate(scene, 16);
    expect(scene.riderEvent).toBeUndefined();
  });
});

describe('riding', () => {
  function riding(fernAt) {
    const scene = makeScene({ fernAt });
    placePlayer(scene, 11, 13);
    riderEventUpdate(scene, 16); // trigger
    return scene;
  }

  it('the Rider gallops east over time', () => {
    const scene = riding();
    const x0 = scene.riderEvent.rider.x;
    riderEventUpdate(scene, 1000);
    expect(scene.riderEvent.rider.x).toBeCloseTo(x0 + 88, 0);
  });

  it('pauses to sniff when passing a hidden player', () => {
    // ROAD_Y[13] is 15, so the fern above the road is (13, 13)
    const scene = riding([[13, 13]]);
    placePlayer(scene, 13, 13);
    scene.riderEvent.rider.x = scene.player.x - 2;
    riderEventUpdate(scene, 0);
    expect(scene.riderEvent.phase).toBe('sniffing');
    expect(scene.riderEvent.rider.anims.paused).toBe(true);
  });

  it('catches an unhidden player at close range', () => {
    const scene = riding();
    scene.riderEvent.rider.x = scene.player.x - 10;
    scene.riderEvent.rider.y = scene.player.y;
    riderEventUpdate(scene, 0);
    expect(scene.riderEvent.phase).toBe('caught');
    expect(scene.inputLocked).toBe(true);
    expect(scene.banners.at(-1)).toMatch(/saw you/);
  });

  it('being caught resets the player to the west spawn and re-arms', () => {
    const scene = riding();
    scene.riderEvent.rider.x = scene.player.x - 10;
    scene.riderEvent.rider.y = scene.player.y;
    riderEventUpdate(scene, 0);

    scene._delayedCb(); // the 900ms dramatic pause
    scene._fadeCb(); // fade-out complete
    expect(scene.player.x).toBe(1 * TILE_SIZE + 8);
    expect(scene.player.y).toBe(12 * TILE_SIZE + 8);
    expect(scene.riderEvent.phase).toBe('armed');
    expect(scene.inputLocked).toBe(false);
  });

  it('a hidden player at close range is safe (not caught)', () => {
    const scene = riding([[13, 13]]);
    placePlayer(scene, 13, 13);
    scene.riderEvent.rider.x = scene.player.x - 10;
    scene.riderEvent.rider.y = scene.player.y;
    riderEventUpdate(scene, 0);
    expect(scene.riderEvent.phase).toBe('riding');
  });

  it('once well past, he gives up: flag set, Gildor spawns', () => {
    const scene = riding();
    scene.riderEvent.rider.x = scene.player.x + 120;
    riderEventUpdate(scene, 0);
    expect(scene.riderEvent.phase).toBe('done');
    expect(gameState.flags.escapedRider).toBe(true);
    expect(gameState.objective).toMatch(/Elf/);
    expect(scene.npcsSpawned.map((n) => n.key)).toContain('gildor');
  });

  it('gives up once past RIDER_EXIT_X even at close range', () => {
    const scene = riding();
    scene.riderEvent.rider.x = RIDER_EXIT_X * TILE_SIZE + 4; // player is at tile 11, so dx is small
    riderEventUpdate(scene, 0);
    expect(scene.riderEvent.phase).toBe('done');
    expect(gameState.flags.escapedRider).toBe(true);
  });
});

describe('sniffing', () => {
  function sniffing() {
    const scene = makeScene({ fernAt: [[13, 13]] });
    placePlayer(scene, 11, 13);
    riderEventUpdate(scene, 16); // trigger
    placePlayer(scene, 13, 13);
    scene.riderEvent.rider.x = scene.player.x - 2;
    riderEventUpdate(scene, 0); // → sniffing
    expect(scene.riderEvent.phase).toBe('sniffing');
    return scene;
  }

  it('resumes riding after the sniff timer runs out', () => {
    const scene = sniffing();
    riderEventUpdate(scene, 1700); // > 1600ms sniff
    expect(scene.riderEvent.phase).toBe('riding');
    expect(scene.riderEvent.rider.anims.paused).toBe(false);
  });

  it('stays sniffing while the timer runs and the player hides', () => {
    const scene = sniffing();
    riderEventUpdate(scene, 500);
    expect(scene.riderEvent.phase).toBe('sniffing');
  });

  it('creeping out of cover mid-sniff resumes the hunt at once', () => {
    const scene = sniffing();
    placePlayer(scene, 15, 13); // off the fern (plain grass)
    riderEventUpdate(scene, 100);
    expect(scene.riderEvent.phase).toBe('riding');
    expect(scene.riderEvent.rider.anims.paused).toBe(false);
  });

  it('does not sniff twice at the same hiding player', () => {
    const scene = sniffing();
    riderEventUpdate(scene, 1700); // resume riding
    riderEventUpdate(scene, 0); // still beside the hidden player
    expect(scene.riderEvent.phase).toBe('riding');
  });
});

describe('three hobbits hiding', () => {
  it('catches an exposed companion even when Frodo is hidden', () => {
    const scene = makeScene({ fernAt: [[13, 14]] });
    placePlayer(scene, 13, 14);
    scene.followers = [
      { x: 11 * 16 + 8, y: 15 * 16 + 4 },
      { x: 12 * 16 + 8, y: 15 * 16 + 4 },
    ];
    riderEventUpdate(scene, 0);
    scene.riderEvent.rider.x = scene.followers[0].x - 10;
    scene.riderEvent.rider.y = scene.followers[0].y;
    riderEventUpdate(scene, 0);
    expect(scene.riderEvent.phase).toBe('caught');
  });

  it('lets all three survive together on separate fern tiles', () => {
    const scene = makeScene({
      fernAt: [
        [11, 14],
        [12, 14],
        [13, 14],
      ],
    });
    placePlayer(scene, 13, 14);
    scene.followers = [
      { x: 12 * 16 + 8, y: 14 * 16 + 4 },
      { x: 11 * 16 + 8, y: 14 * 16 + 4 },
    ];
    riderEventUpdate(scene, 0);
    scene.riderEvent.rider.x = scene.player.x - 2;
    riderEventUpdate(scene, 0);
    expect(scene.riderEvent.phase).toBe('sniffing');
    riderEventUpdate(scene, 1700);
    scene.riderEvent.rider.x = scene.player.x + 120;
    riderEventUpdate(scene, 0);
    expect(gameState.flags.escapedRider).toBe(true);
  });
});

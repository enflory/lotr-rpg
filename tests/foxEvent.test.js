// The fox-of-the-Woody-End one-shot event, driven through a fake Phaser
// scene in the style of riderEvent.test.js. HOLLOW comes from the real
// woodyend zone so the trigger bounds match production.

import { describe, it, expect, beforeEach } from 'vitest';
import { foxEventUpdate } from '../src/events/foxEvent.js';
import { gameState } from '../src/state/GameState.js';
import { TILE_SIZE } from '../src/data/tileTypes.js';
import { HOLLOW } from '../src/data/zones/woodyend.js';

function makeScene() {
  const scene = {
    zone: {},
    player: { x: 0, y: 0 },
    spritesAdded: [],
    add: {
      sprite(x, y, key, frame) {
        const sprite = {
          x,
          y,
          key,
          frame,
          destroyed: false,
          setDepth() {
            return sprite;
          },
          anims: {
            plays: [],
            play(key) {
              this.plays.push(key);
            },
          },
          destroy() {
            this.destroyed = true;
          },
        };
        scene.spritesAdded.push(sprite);
        return sprite;
      },
    },
    tweenChains: [],
    tweens: {
      chain(cfg) {
        scene.tweenChains.push(cfg);
      },
    },
    time: {
      delayedCall(ms, cb) {
        scene._delayedCb = cb;
      },
    },
    dialogues: [],
    startDialogue(key) {
      this.dialogues.push(key);
    },
  };
  return scene;
}

// Position the player at the raw tile center (foxEvent uses Math.floor on
// the raw x/y, no feet offset).
function placePlayer(scene, tx, ty) {
  scene.player.x = tx * TILE_SIZE + 8;
  scene.player.y = ty * TILE_SIZE + 8;
}

beforeEach(() => {
  gameState.flags = {};
});

describe('foxEventUpdate', () => {
  it('does nothing while the player is outside the hollow', () => {
    const scene = makeScene();
    placePlayer(scene, HOLLOW.x0 - 5, HOLLOW.y0 - 5);
    foxEventUpdate(scene);
    expect(scene.spritesAdded).toHaveLength(0);
    expect(gameState.flags.foxSeen).toBeUndefined();
    expect(scene.foxEvent).toBeUndefined();
  });

  it('spawns the fox and sets foxSeen when the player steps into the hollow', () => {
    const scene = makeScene();
    placePlayer(scene, HOLLOW.x0 + 2, HOLLOW.y0 + 2);
    foxEventUpdate(scene);

    expect(gameState.flags.foxSeen).toBe(true);
    expect(scene.spritesAdded).toHaveLength(1);
    expect(scene.spritesAdded[0].key).toBe('fox');
    expect(scene.spritesAdded[0].frame).toBe(7);
    expect(scene.foxEvent).toBe(scene.spritesAdded[0]);
    expect(scene.tweenChains).toHaveLength(1);
  });

  it('does not spawn a second fox on subsequent updates', () => {
    const scene = makeScene();
    placePlayer(scene, HOLLOW.x0 + 2, HOLLOW.y0 + 2);
    foxEventUpdate(scene);
    foxEventUpdate(scene);
    foxEventUpdate(scene);

    expect(scene.spritesAdded).toHaveLength(1);
    expect(scene.tweenChains).toHaveLength(1);
  });

  it('does not re-trigger once foxSeen is already set, even outside a live event', () => {
    gameState.flags.foxSeen = true;
    const scene = makeScene();
    placePlayer(scene, HOLLOW.x0 + 2, HOLLOW.y0 + 2);
    foxEventUpdate(scene);
    expect(scene.spritesAdded).toHaveLength(0);
  });
});

// The fox-of-the-Woody-End one-shot event, driven through a fake Phaser
// scene in the style of riderEvent.test.js. HOLLOW comes from the real
// woodyend zone so the trigger bounds match production.

import { describe, it, expect, beforeEach } from 'vitest';
import { foxEventUpdate } from '../src/events/foxEvent.js';
import { gameState } from '../src/state/GameState.js';
import { TILE_SIZE } from '../src/data/tileTypes.js';
import { HOLLOW, FOX_REST, FOX_ROUTE } from '../src/data/zones/woodyend.js';

function makeScene() {
  const scene = {
    zone: {},
    player: { x: 0, y: 0 },
    dialogActive: false,
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
    tweensAdded: [],
    tweens: {
      add(cfg) {
        scene.tweensAdded.push(cfg);
      },
    },
    dialogues: [],
    startDialogue(key) {
      this.dialogues.push(key);
      this.dialogActive = true;
    },
  };
  return scene;
}

// Position the feet at the tile center, matching navigation and the trigger.
function placePlayer(scene, tx, ty) {
  scene.player.x = tx * TILE_SIZE + 8;
  scene.player.y = ty * TILE_SIZE;
}

beforeEach(() => {
  gameState.flags = {};
});

describe('foxEventUpdate', () => {
  it('does not trigger on the southern crossing lane', () => {
    const scene = makeScene();
    placePlayer(scene, 23, 22);
    foxEventUpdate(scene);
    expect(scene.spritesAdded).toHaveLength(0);
  });

  it('keeps the resting party clear of the fox and locked through its departure', () => {
    const scene = makeScene();
    placePlayer(scene, 23, 20);
    scene.followers = [{ x: scene.player.x, y: scene.player.y - 18 }];
    foxEventUpdate(scene);
    expect(scene.inputLocked).toBe(true);
    for (const hobbit of [scene.player, ...scene.followers]) {
      expect(Math.abs(hobbit.y - scene.foxEvent.fox.y)).toBeGreaterThanOrEqual(24);
    }
    scene.tweensAdded[0].onComplete();
    foxEventUpdate(scene);
    scene.dialogActive = false;
    foxEventUpdate(scene);
    expect(scene.inputLocked).toBe(true);
    scene.tweensAdded[1].onComplete();
    expect(scene.inputLocked).toBe(false);
  });

  it('waits if a companion is still in the crossing lane', () => {
    const scene = makeScene();
    placePlayer(scene, 23, 20);
    scene.followers = [{ x: 24 * TILE_SIZE + 8, y: 22 * TILE_SIZE }];
    foxEventUpdate(scene);
    expect(scene.spritesAdded).toHaveLength(0);
    expect(gameState.flags.foxSeen).toBeUndefined();
  });

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
    placePlayer(scene, FOX_REST.x, FOX_REST.y);
    foxEventUpdate(scene);

    expect(gameState.flags.foxSeen).toBe(true);
    expect(scene.spritesAdded).toHaveLength(1);
    expect(scene.spritesAdded[0].key).toBe('fox');
    expect(scene.spritesAdded[0].frame).toBe(7);
    expect(scene.foxEvent.fox).toBe(scene.spritesAdded[0]);
    expect(scene.tweensAdded).toHaveLength(1);
  });

  it('does not spawn a second fox on subsequent updates', () => {
    const scene = makeScene();
    placePlayer(scene, FOX_REST.x, FOX_REST.y);
    foxEventUpdate(scene);
    foxEventUpdate(scene);
    foxEventUpdate(scene);

    expect(scene.spritesAdded).toHaveLength(1);
    expect(scene.tweensAdded).toHaveLength(1);
  });

  it('does not re-trigger once foxSeen is already set, even outside a live event', () => {
    gameState.flags.foxSeen = true;
    const scene = makeScene();
    placePlayer(scene, FOX_REST.x, FOX_REST.y);
    foxEventUpdate(scene);
    expect(scene.spritesAdded).toHaveLength(0);
  });

  it('holds its thought until the walk-in finishes, then starts the dialogue', () => {
    const scene = makeScene();
    placePlayer(scene, FOX_REST.x, FOX_REST.y);
    foxEventUpdate(scene);

    // Still walking in — no dialogue yet.
    foxEventUpdate(scene);
    expect(scene.dialogues).toHaveLength(0);

    scene.tweensAdded[0].onComplete(); // walk-in arrives
    const fox = scene.foxEvent.fox;
    expect(fox.anims.plays).toContain('fox-idle-right');

    foxEventUpdate(scene);
    expect(scene.dialogues).toEqual(['fox_thought']);
  });

  it('stays put through the dialogue and only walks away once it closes', () => {
    const scene = makeScene();
    placePlayer(scene, FOX_REST.x, FOX_REST.y);
    foxEventUpdate(scene);
    scene.tweensAdded[0].onComplete();
    foxEventUpdate(scene); // starts fox_thought, dialogActive = true

    // Dialogue open — no exit tween appears.
    expect(scene.tweensAdded).toHaveLength(1);

    scene.dialogActive = false; // player spaced through the last line
    foxEventUpdate(scene);
    expect(scene.tweensAdded).toHaveLength(2);
    const exit = scene.tweensAdded[1];
    expect(exit.x).toBe(FOX_ROUTE.x1 * TILE_SIZE + 8);

    const fox = scene.foxEvent.fox;
    expect(fox.anims.plays.at(-1)).toBe('fox-walk-right');
    exit.onComplete();
    expect(fox.destroyed).toBe(true);

    // Event is spent — further updates change nothing.
    foxEventUpdate(scene);
    expect(scene.tweensAdded).toHaveLength(2);
    expect(scene.dialogues).toHaveLength(1);
  });
});

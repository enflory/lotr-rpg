// Grip, Fang and Wolf run home once found, driven through a fake Phaser
// scene in the style of foxEvent.test.js. FARM comes from the real marish
// zone so the target coordinates match production.

import { describe, it, expect, beforeEach } from 'vitest';
import { dogsEventUpdate } from '../src/events/dogsEvent.js';
import { gameState } from '../src/state/GameState.js';
import { TILE_SIZE } from '../src/data/tileTypes.js';
import { FARM } from '../src/data/zones/marish.js';

function makeNpc(key) {
  const data = { key };
  return {
    getData(k) {
      return data[k];
    },
    setData(k, v) {
      data[k] = v;
    },
  };
}

function makeScene() {
  const scene = {
    npcs: [],
    tweenCfgs: [],
    tweens: {
      add(cfg) {
        scene.tweenCfgs.push(cfg);
        return cfg;
      },
    },
    removed: [],
    removeNpc(key) {
      this.removed.push(key);
    },
  };
  return scene;
}

beforeEach(() => {
  gameState.flags = {};
});

describe('dogsEventUpdate', () => {
  it('does nothing when no dog flag is set', () => {
    const scene = makeScene();
    scene.npcs.push(makeNpc('grip'));
    dogsEventUpdate(scene);
    expect(scene.tweenCfgs).toHaveLength(0);
    expect(scene.removed).toHaveLength(0);
  });

  it('tweens a found dog toward the farm gate and removes it on completion', () => {
    gameState.flags.dogGrip = true;
    const scene = makeScene();
    scene.npcs.push(makeNpc('grip'));
    dogsEventUpdate(scene);

    expect(scene.tweenCfgs).toHaveLength(1);
    const cfg = scene.tweenCfgs[0];
    expect(cfg.x).toBe(FARM.gateX * TILE_SIZE + 8);
    expect(cfg.y).toBe((FARM.y0 + 2) * TILE_SIZE + 8);

    cfg.onComplete();
    expect(scene.removed).toEqual(['grip']);
  });

  it('does not add a second tween once the dog is already running home', () => {
    gameState.flags.dogGrip = true;
    const scene = makeScene();
    scene.npcs.push(makeNpc('grip'));
    dogsEventUpdate(scene);
    dogsEventUpdate(scene);

    expect(scene.tweenCfgs).toHaveLength(1);
  });
});

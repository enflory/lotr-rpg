// Gandalf leaves Hobbiton once he has given his last counsel, and the Bag End
// doorstep is empty from then on.

import { it, expect, beforeEach } from 'vitest';
import { gandalfEventUpdate } from '../src/events/gandalfEvent.js';
import { gameState } from '../src/state/GameState.js';
import { DIALOGUES } from '../src/data/dialogues.js';
import { shire } from '../src/data/zones/shire.js';

// The least of a Phaser sprite that storyMotion's walk actually touches.
const wizard = () => ({
  x: 19 * 16 + 8,
  y: 8 * 16 + 6,
  body: { enable: true },
  getData: () => 'gandalf',
  play() {},
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },
  setDepth() {
    return this;
  },
  anims: {},
});

function makeScene(npcs) {
  return {
    npcs,
    zone: shire,
    zoneKey: 'shire',
    inputLocked: false,
    banners: [],
    showBanner(text) {
      this.banners.push(text);
    },
    removed: [],
    removeNpc(key) {
      this.removed.push(key);
    },
    checkpoints: 0,
    checkpoint() {
      this.checkpoints++;
    },
    player: { x: 0, y: 0 },
    // Every leg of the walk lands the moment it is started, so a test can see
    // the far end of the departure without waiting on real tweens: the target
    // is moved to where the tween would have put it, then completed.
    tweens: {
      add: (config) => {
        const { targets, onUpdate, onComplete } = config;
        const props = Object.fromEntries(
          Object.entries(config).filter(
            ([key, value]) => typeof value === 'number' && key !== 'duration',
          ),
        );
        for (const target of [].concat(targets)) Object.assign(target, props);
        onUpdate?.();
        onComplete?.();
      },
    },
  };
}

beforeEach(() => {
  gameState.flags = {};
});

it('stays on the doorstep until his farewell has been heard', () => {
  const scene = makeScene([wizard()]);
  gandalfEventUpdate(scene);
  expect(scene.inputLocked).toBe(false);
  expect(scene.removed).toEqual([]);
});

it('sets out once, and takes his collision with him', async () => {
  const scene = makeScene([wizard()]);
  const npc = scene.npcs[0];
  gameState.flags.gandalfLeft = true;
  gandalfEventUpdate(scene);
  expect(scene.inputLocked).toBe(true);
  expect(npc.body.enable).toBe(false);

  gandalfEventUpdate(scene); // a second frame must not start a second walk
  expect(scene.removed).toEqual([]);

  // The walk is a chain of awaited legs; a macrotask flushes all of them.
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(npc.x).toBeGreaterThan(19 * 16 + 8); // he went east, down the lane
  expect(npc.y).toBeGreaterThan(8 * 16 + 6);
  expect(scene.removed).toEqual(['gandalf']);
  expect(gameState.flags.gandalfGone).toBe(true);
  expect(scene.inputLocked).toBe(false);
  expect(scene.checkpoints).toBe(1);
});

it('counts himself gone if a save is restored after the farewell', () => {
  const scene = makeScene([]);
  gameState.flags.gandalfLeft = true;
  gandalfEventUpdate(scene);
  expect(gameState.flags.gandalfGone).toBe(true);
  expect(scene.inputLocked).toBe(false);
});

it('does not stand outside Bag End once he has gone', () => {
  const gandalfs = shire.npcs.filter((n) => n.key === 'gandalf');
  expect(gandalfs).toHaveLength(2); // one at the party, one after the time skip
  const after = gandalfs.find((n) => n.when({ prologueDone: true }));
  expect(after.when({ prologueDone: true, gandalfGone: true })).toBeFalsy();
});

it('says his farewell exactly once and points Frodo at the East Road', () => {
  // The Ring and the farewell are one conversation, so there is no way to
  // hear the first and walk off without seeing him go.
  const farewell = DIALOGUES.gandalf.stages.filter((s) =>
    [].concat(s.set ?? []).includes('gandalfLeft'),
  );
  expect(farewell).toHaveLength(1);
  expect(farewell[0].set).toContain('metGandalf');
  expect(farewell[0].when({})).toBe(true);
  expect(farewell[0].when({ metGandalf: true })).toBe(false);
});

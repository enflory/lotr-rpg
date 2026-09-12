// Gandalf leaves Hobbiton once he has given his last counsel, and the Bag End
// doorstep is empty from then on.

import { it, expect, beforeEach } from 'vitest';
import { gandalfEventUpdate } from '../src/events/gandalfEvent.js';
import { gameState } from '../src/state/GameState.js';
import { DIALOGUES } from '../src/data/dialogues.js';
import { shire } from '../src/data/zones/shire.js';

const wizard = () => ({
  x: 19 * 16 + 8,
  y: 8 * 16 + 6,
  body: { enable: true },
  getData: () => 'gandalf',
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
    player: { x: 0, y: 0 },
    tweens: { add: () => {} }, // the walk never completes in the fake scene
  };
}

beforeEach(() => {
  gameState.flags = {};
});

it('stays on the doorstep until his farewell has been heard', () => {
  const scene = makeScene([wizard()]);
  gandalfEventUpdate(scene);
  expect(scene.inputLocked).toBe(false);
  expect(scene.banners).toEqual([]);
});

it('sets out once, and takes his collision with him', () => {
  const scene = makeScene([wizard()]);
  gameState.flags.gandalfLeft = true;
  gandalfEventUpdate(scene);
  expect(scene.inputLocked).toBe(true);
  expect(scene.banners).toHaveLength(1);
  expect(scene.npcs[0].body.enable).toBe(false);

  gandalfEventUpdate(scene); // a second frame must not start a second walk
  expect(scene.banners).toHaveLength(1);
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
  const farewell = DIALOGUES.gandalf.stages.find((s) => s.set === 'gandalfLeft');
  expect(farewell).toBeTruthy();
  expect(farewell.objective).toMatch(/East Road/);
  expect(farewell.when({ samJoined: true })).toBe(true);
  expect(farewell.when({ samJoined: true, gandalfLeft: true })).toBe(false);
});

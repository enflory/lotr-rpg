import { expect, it } from 'vitest';
import { resolveDialogue } from '../src/data/dialogues.js';
import { applySave } from '../src/state/saveGame.js';
import { gameState } from '../src/state/GameState.js';
import { gandalfEventUpdate } from '../src/events/gandalfEvent.js';
import { drawShireScenery } from '../src/art/shireScenery.js';
import { T } from '../src/data/tileTypes.js';

it('the real Gandalf conversation advances the envelope and Hobbiton farewells', () => {
  const flags = { prologueDone: true };
  const keys = ['examine_ringspot', 'folco', 'fatty', 'rumble', 'cotton'];
  const before = keys.map((key) => resolveDialogue(key, flags).lines);
  const gandalf = resolveDialogue('gandalf', flags);
  for (const flag of [].concat(gandalf.set)) flags[flag] = true;
  keys.forEach((key, i) => expect(resolveDialogue(key, flags).lines, key).not.toEqual(before[i]));
  expect(resolveDialogue('examine_ringspot', flags).lines.join(' ')).toMatch(/open and\s+empty/);
});

it.each([false, true])(
  'an old v1 save can finish Gandalf’s farewell (Sam joined: %s)',
  (samJoined) => {
    const objective = samJoined ? 'Take the East Road' : 'Find Sam in his garden';
    applySave({
      version: 1,
      savedAt: 0,
      zone: 'shire',
      entry: 'default',
      flags: { prologueDone: true, metGandalf: true, samJoined },
      follower: samJoined ? 'sam' : null,
      objective,
      items: {},
      collected: {},
    });
    const farewell = resolveDialogue('gandalf', gameState.flags);
    expect(farewell.lines.join(' ')).toMatch(/Bree/);
    expect(farewell.lines.join(' ')).not.toMatch(/it is\s+the One Ring/);
    expect([].concat(farewell.set)).toContain('gandalfLeft');
    for (const flag of [].concat(farewell.set)) gameState.flags[flag] = true;
    // The departure event consumes the same flag as a new game's farewell.
    gandalfEventUpdate({ npcs: [] });
    expect(gameState.flags.gandalfGone).toBe(true);
    expect(resolveDialogue('gandalf', gameState.flags).set).toBeUndefined();
    expect(gameState.objective).toBe(objective);
  },
);

it('a warm scenery cache avoids reading the map at pixel resolution', () => {
  let cellReads = 0;
  const map = Array.from(
    { length: 4 },
    (_, y) =>
      new Proxy([T.GRASS, y === 2 ? T.TREE : T.GRASS, T.GRASS, T.GRASS], {
        get(row, key) {
          if (/^\d+$/.test(String(key))) cellReads++;
          return row[key];
        },
      }),
  );
  const textures = new Set();
  const images = [];
  const scene = {
    zoneKey: 'woodyend',
    zone: { map },
    textures: {
      exists: (key) => textures.has(key),
      createCanvas(key) {
        textures.add(key);
        return {
          getContext: () => ({
            createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
            putImageData() {},
          }),
          refresh() {},
        };
      },
    },
    add: {
      image(x, y, key) {
        images.push({ x, y, key });
        return {
          setOrigin() {
            return this;
          },
          setDepth() {
            return this;
          },
        };
      },
    },
  };
  drawShireScenery(scene);
  const first = images.splice(0);
  expect(first).toHaveLength(2); // ground plus one row of crowns
  cellReads = 0;
  drawShireScenery(scene);
  expect(images).toEqual(first);
  // Tile scans are cheap; thousands of pixel samples on re-entry are not.
  expect(cellReads).toBeLessThanOrEqual(4 * 4 * 3);
});

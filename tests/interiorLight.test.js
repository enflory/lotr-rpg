import { describe, expect, it } from 'vitest';
import { bakeInteriorShadow, LIT_INTERIORS } from '../src/art/interiorLight.js';
import { ZONES } from '../src/data/zones/index.js';
import { T } from '../src/data/tileTypes.js';

const alphaAt = ({ pixels, width }, x, y) => pixels[(y * width + x) * 4 + 3];
const centre = (art, tx, ty) => alphaAt(art, tx * 16 + 8, ty * 16 + 8);

// Find one cell of a tile type, so the test does not hard-code a layout that
// the zone files are free to rearrange.
const find = (map, tile) => {
  for (let y = 0; y < map.length; y++)
    for (let x = 0; x < map[y].length; x++) if (map[y][x] === tile) return { x, y };
  throw new Error(`no ${tile} in map`);
};

describe.each([...LIT_INTERIORS])('%s is lit by its own fire and windows', (key) => {
  const map = ZONES[key].map;
  const art = bakeInteriorShadow(map);

  it('leaves the earth outside the rooms untouched', () => {
    const earth = find(map, T.VOID);
    expect(centre(art, earth.x, earth.y)).toBe(0);
  });

  it('is brightest at the hearth and dimmest in the far corners', () => {
    const fire = find(map, T.FIREPLACE);
    const byTheFire = alphaAt(art, fire.x * 16 + 8, fire.y * 16 + 24);
    let darkest = 0;
    for (let y = 0; y < map.length; y++)
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] !== T.FLOOR) continue;
        darkest = Math.max(darkest, centre(art, x, y));
      }
    // Alpha is darkness, so the hearth must be the lowest reading in the room.
    expect(byTheFire).toBeLessThan(darkest);
    expect(darkest).toBeGreaterThan(0);
  });

  it('quantises the falloff instead of blending a smooth gradient', () => {
    const steps = new Set();
    for (let i = 3; i < art.pixels.length; i += 4) steps.add(art.pixels[i]);
    expect(steps.size).toBeLessThanOrEqual(26);
    expect([...steps].every((a) => a % 8 === 0)).toBe(true);
  });
});

it('lights a room only where there is something to light it with', () => {
  const map = Array.from({ length: 4 }, () => Array(4).fill(T.FLOOR));
  const art = bakeInteriorShadow(map);
  expect(art.pixels.every((v) => v === 0)).toBe(true);
});

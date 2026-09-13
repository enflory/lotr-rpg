import { beforeAll, describe, expect, it } from 'vitest';
import { bakeShireGround, bakeShireCanopy, SHIRE_ZONES } from '../src/art/shireScenery.js';
import { ZONES } from '../src/data/zones/index.js';
import { T, COLLISION_TILES } from '../src/data/tileTypes.js';

const EARTH = new Set([0x3c2a14, 0x4a3418, 0x5a4020, 0x6b4d28, 0x7a5d30, 0x8a6b3d, 0x9a7b4d]);
const colorAt = ({ pixels, width }, x, y) => {
  const i = (y * width + x) * 4;
  return (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
};
const alphaAt = ({ pixels, width }, x, y) => pixels[(y * width + x) * 4 + 3];

describe.each([...SHIRE_ZONES])('%s as painted country', (key) => {
  let art;
  beforeAll(() => {
    art = bakeShireGround(ZONES[key].map);
  });

  it('uses a bounded palette and opaque pixels, without blended fringes', () => {
    const colors = new Set();
    const alphas = new Set();
    for (let i = 0; i < art.pixels.length; i += 4) {
      alphas.add(art.pixels[i + 3]);
      if (art.pixels[i + 3])
        colors.add((art.pixels[i] << 16) | (art.pixels[i + 1] << 8) | art.pixels[i + 2]);
    }
    expect([...alphas].every((a) => a === 0 || a === 255)).toBe(true);
    expect(colors.size).toBeLessThanOrEqual(48);
  });

  it('never paints over a tile it has no business repainting', () => {
    const map = ZONES[key].map;
    const painted = new Set([
      T.GRASS,
      T.GRASS2,
      T.PATH,
      T.HILLTOP,
      T.BOG,
      T.FLOWERS,
      T.HILL,
      T.TREE,
      T.TREE2,
      T.WATER,
      T.HAY,
    ]);
    for (let y = 0; y < map.length; y++)
      for (let x = 0; x < map[y].length; x++) {
        if (painted.has(map[y][x])) continue;
        expect(alphaAt(art, x * 16 + 8, y * 16 + 8), `${key} (${x},${y})`).toBe(0);
      }
  });

  it('keeps the middle of every bank cell as earth, and of no other cell', () => {
    const map = ZONES[key].map;
    for (let y = 0; y < map.length; y++)
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        if (tile !== T.HILL && tile !== T.HILLTOP && tile !== T.GRASS) continue;
        const earth = EARTH.has(colorAt(art, x * 16 + 8, y * 16 + 8));
        expect(earth, `${key} (${x},${y})`).toBe(tile === T.HILL);
      }
  });
});

it('leaves the map itself alone and paints nothing on bare ground', () => {
  const map = Array.from({ length: 3 }, () => [T.GRASS, T.FENCE, T.GRASS]);
  const before = JSON.stringify(map);
  const art = bakeShireGround(map);
  for (let y = 0; y < art.height; y++)
    for (let x = 16; x < 32; x++) expect(art.pixels[(y * art.width + x) * 4 + 3]).toBe(0);
  expect(JSON.stringify(map)).toBe(before);
  expect(bakeShireCanopy(map)).toEqual([]);
});

describe('the canopy strips', () => {
  const map = Array.from({ length: 6 }, () => Array(6).fill(T.GRASS));
  map[3][3] = T.TREE;
  const strips = bakeShireCanopy(map);

  it('cuts one strip per tile row that holds woods, at that row’s depth', () => {
    expect(strips.map((s) => s.row)).toEqual([3]);
    expect(strips[0].y0).toBeLessThan(3 * 16);
  });

  it('covers the solid cell the tree stands in', () => {
    const strip = strips[0];
    const inside = (x, y) => strip.pixels[((y - strip.y0) * strip.width + x) * 4 + 3];
    for (let y = 3 * 16 + 2; y < 4 * 16; y += 3)
      for (let x = 3 * 16 + 2; x < 4 * 16; x += 3) expect(inside(x, y)).toBe(255);
  });

  it('never reaches more than one cell to either side of its own', () => {
    const strip = strips[0];
    for (let y = 0; y < strip.height; y++)
      for (let x = 0; x < strip.width; x++) {
        if (!strip.pixels[(y * strip.width + x) * 4 + 3]) continue;
        expect(x).toBeGreaterThanOrEqual(2 * 16);
        expect(x).toBeLessThan(5 * 16);
      }
  });
});

it('shades every solid cell it repaints to something a player can read', () => {
  // A lone bank cell must not come out looking like the lawn beside it.
  const map = Array.from({ length: 5 }, () => Array(5).fill(T.HILLTOP));
  for (let x = 0; x < 5; x++) map[3][x] = T.HILL;
  const art = bakeShireGround(map);
  for (let x = 0; x < 5; x++) {
    expect(EARTH.has(colorAt(art, x * 16 + 8, 3 * 16 + 12))).toBe(true);
  }
  expect(COLLISION_TILES).toContain(T.HILL);
});

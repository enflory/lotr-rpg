import { beforeAll, describe, expect, it } from 'vitest';
import { bakeDownsRelief, drawDownsFeatures } from '../src/art/downsScenery.js';
import { ZONES } from '../src/data/zones/index.js';
import { T } from '../src/data/tileTypes.js';

const hillColors = new Set([0x394b42, 0x4b5e48, 0x61754f, 0x7d8d58, 0x98a568, 0xb1b97a, 0xc7cc91]);
const colorAt = ({ pixels, width }, x, y) => {
  const i = (y * width + x) * 4;
  return (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
};

describe.each(['downs', 'barrowhill', 'eastroad'])('%s pixel landscape', (key) => {
  let art;
  beforeAll(() => {
    art = bakeDownsRelief(ZONES[key].map);
  });
  it('uses a bounded palette and opaque pixels, without blended fringes', () => {
    const colors = new Set();
    const alphas = new Set();
    for (let i = 0; i < art.pixels.length; i += 4) {
      const alpha = art.pixels[i + 3];
      alphas.add(alpha);
      if (alpha) colors.add((art.pixels[i] << 16) | (art.pixels[i + 1] << 8) | art.pixels[i + 2]);
    }
    expect([...alphas].every((alpha) => alpha === 0 || alpha === 255)).toBe(true);
    expect(colors.size).toBeLessThanOrEqual(32);
  });
  it('never hides a solid hill centre or paints an open cell centre as a hill', () => {
    const map = ZONES[key].map;
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        if (![T.DOWN_SLOPE, T.DOWN_GRASS, T.DOWN_HEATHER, T.CHALK, T.PATH].includes(tile)) continue;
        const isHill = hillColors.has(colorAt(art, x * 16 + 8, y * 16 + 8));
        expect(isHill, `${key} (${x},${y})`).toBe(tile === T.DOWN_SLOPE);
      }
    }
  });
});

it('leaves unrelated tile art intact and does not mutate zone geometry', () => {
  const map = Array.from({ length: 3 }, () => [T.DOWN_GRASS, T.FLOWERS, T.DOWN_SLOPE]);
  const before = JSON.stringify(map);
  const art = bakeDownsRelief(map);
  for (let y = 0; y < art.height; y++) {
    for (let x = 16; x < 32; x++) expect(art.pixels[(y * art.width + x) * 4 + 3]).toBe(0);
  }
  expect(JSON.stringify(map)).toBe(before);
});

it('roots both mirrored gate stones on their own collision cells', () => {
  const map = Array.from({ length: 5 }, () => Array(7).fill(T.DOWN_GRASS));
  map[2][2] = T.STANDING_STONE;
  map[2][4] = T.STANDING_STONE;
  const shapes = [];
  const scene = {
    zoneKey: 'eastroad',
    zone: { map },
    add: {
      graphics: () => {
        const rects = [];
        shapes.push(rects);
        return {
          setDepth() {
            return this;
          },
          fillStyle() {
            return this;
          },
          fillRect(x, y, w, h) {
            rects.push({ x, y, w, h });
            return this;
          },
        };
      },
    },
  };
  drawDownsFeatures(scene);
  expect(shapes).toHaveLength(2);
  expect(shapes[0][0]).toEqual({ x: 32, y: 39, w: 17, h: 9 });
  expect(shapes[1][0]).toEqual({ x: 64, y: 39, w: 17, h: 9 });
});

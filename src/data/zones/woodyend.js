// The Woody End — wooded country east of Hobbiton, where the hobbits
// first meet a Black Rider. Map is generated: a winding East Road
// through mixed woods with fern brakes to hide in. The road runs out
// the east edge and down into the Marish (gated on meeting Gildor).

import { T } from '../tileTypes.js';
import { riderEventUpdate } from '../../events/riderEvent.js';

const WIDTH = 40, HEIGHT = 24;

// Deterministic PRNG so the forest is the same every visit
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Road top-row y per column (road is 2 tiles tall)
export const ROAD_Y = [];
for (let x = 0; x < WIDTH; x++) {
  ROAD_Y[x] = x < 8 ? 12 : x < 20 ? 14 : x < 32 ? 10 : 12;
}

function generateMap() {
  const rnd = lcg(0x517e);
  const map = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      row.push(rnd() < 0.55 ? T.GRASS2 : T.GRASS);
    }
    map.push(row);
  }

  const onRoad = (x, y) => y === ROAD_Y[x] || y === ROAD_Y[x] + 1;
  const nearRoad = (x, y) => {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = Math.min(WIDTH - 1, Math.max(0, x + dx));
      if (y >= ROAD_Y[cx] - 1 && y <= ROAD_Y[cx] + 2) return true;
    }
    return false;
  };

  // Carve the road, including vertical joins where it bends
  for (let x = 0; x < WIDTH; x++) {
    map[ROAD_Y[x]][x] = T.PATH;
    map[ROAD_Y[x] + 1][x] = T.PATH;
    if (x > 0 && ROAD_Y[x] !== ROAD_Y[x - 1]) {
      const lo = Math.min(ROAD_Y[x], ROAD_Y[x - 1]);
      const hi = Math.max(ROAD_Y[x], ROAD_Y[x - 1]) + 1;
      for (let y = lo; y <= hi; y++) {
        map[y][x] = T.PATH;
        map[y][x - 1] = T.PATH;
      }
    }
  }

  // Scatter woods and undergrowth away from the road
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      if (nearRoad(x, y)) continue;
      const r = rnd();
      if (r < 0.30) map[y][x] = rnd() < 0.4 ? T.TREE2 : T.TREE;
      else if (r < 0.40) map[y][x] = T.FERN;
      else if (r < 0.42) map[y][x] = T.FLOWERS;
    }
  }

  // Thicken into groves: trees tend to grow beside other trees
  for (let y = 2; y < HEIGHT - 2; y++) {
    for (let x = 2; x < WIDTH - 2; x++) {
      if (nearRoad(x, y)) continue;
      const t = map[y][x];
      if ((t === T.TREE || t === T.TREE2) && rnd() < 0.5) {
        const [nx, ny] = rnd() < 0.5 ? [x + 1, y] : [x, y + 1];
        if (!nearRoad(nx, ny) && (map[ny][nx] === T.GRASS || map[ny][nx] === T.GRASS2)) {
          map[ny][nx] = t;
        }
      }
    }
  }

  // Guaranteed fern brakes one tile off the road — the hiding spots
  for (let x = 4; x < WIDTH - 3; x += 4) {
    const above = ROAD_Y[x] - 1;
    const below = ROAD_Y[x] + 2;
    map[above][x] = T.FERN;
    map[above][x + 1] = T.FERN;
    map[below][x + 2] = T.FERN;
    map[below][x + 3] = T.FERN;
  }

  // Border trees, with road gaps on the west and east edges
  for (let x = 0; x < WIDTH; x++) {
    map[0][x] = T.TREE;
    map[HEIGHT - 1][x] = T.TREE;
  }
  for (let y = 0; y < HEIGHT; y++) {
    if (!(y === ROAD_Y[0] || y === ROAD_Y[0] + 1)) map[y][0] = T.TREE;
    if (!(y === ROAD_Y[WIDTH - 1] || y === ROAD_Y[WIDTH - 1] + 1)) map[y][WIDTH - 1] = T.TREE;
  }

  // Clearing where Gildor's company appears
  for (let y = 14; y <= 16; y++)
    for (let x = 32; x <= 35; x++)
      if (!onRoad(x, y)) map[y][x] = T.GRASS;

  return map;
}

/** @type {import('../types.js').Zone} */
export const woodyend = {
  key: 'woodyend',
  label: 'The Woody End',
  music: 'forest',
  map: generateMap(),
  spawns: {
    west: { x: 1, y: 12, dir: 'right' },
    east: { x: 38, y: 12, dir: 'left' },
  },
  npcs: [
    { key: 'gildor', x: 33, y: 15, dir: 'down', when: (f) => f.escapedRider },
  ],
  doors: [],
  signs: [],
  exits: [
    { x: 0, y: 12, zone: 'shire', entry: 'fromWoodyEnd' },
    { x: 0, y: 13, zone: 'shire', entry: 'fromWoodyEnd' },
    {
      x: 39, y: 12, zone: 'marish', entry: 'west',
      requires: 'metGildor',
      denied: "I should hear the Elf's\ncounsel first.",
    },
    {
      x: 39, y: 13, zone: 'marish', entry: 'west',
      requires: 'metGildor',
      denied: "I should hear the Elf's\ncounsel first.",
    },
  ],
  onUpdate: riderEventUpdate,
};

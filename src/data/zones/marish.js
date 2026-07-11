// The Marish — boggy farmland between the Woody End and the
// Brandywine: Farmer Maggot's Bamfurlong farm, the ferry lane, and
// the Bucklebury Ferry landing. Map is generated: a winding lane
// through bog and rushes, a hand-carved farm plot, and the river
// with the pier and the far Buckland bank.

import { T } from '../tileTypes.js';
import { ferryEventUpdate } from '../../events/ferryEvent.js';

const WIDTH = 40, HEIGHT = 26;

// Deterministic PRNG so the marsh is the same every visit
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Lane top-row y per column (lane is 2 tiles tall). Winds north past
// the farm, then drops toward the pier.
export const LANE_Y = [];
for (let x = 0; x < WIDTH; x++) {
  // Bends sit clear of the farm plot so the joins never cross its fence
  LANE_Y[x] = x < 8 ? 12 : x < 29 ? 9 : 13;
}

// Farm plot bounds (fence perimeter), gate on the north side east of
// the farmhouse
export const FARM = { x0: 14, x1: 27, y0: 13, y1: 21, gateX: 23 };

const RIVER_X = 34; // water from here east
const BANK_X = 37; // far (Buckland) shore

function generateMap() {
  const rnd = lcg(0xba9);
  const map = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      row.push(rnd() < 0.5 ? T.GRASS2 : T.GRASS);
    }
    map.push(row);
  }

  const onLane = (x, y) => x < RIVER_X && (y === LANE_Y[x] || y === LANE_Y[x] + 1);
  const nearLane = (x, y) => {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = Math.min(WIDTH - 1, Math.max(0, x + dx));
      if (y >= LANE_Y[cx] - 1 && y <= LANE_Y[cx] + 2) return true;
    }
    return false;
  };
  const inFarm = (x, y) => x >= FARM.x0 && x <= FARM.x1 && y >= FARM.y0 && y <= FARM.y1;

  // Carve the lane, including vertical joins where it bends
  for (let x = 0; x < RIVER_X; x++) {
    map[LANE_Y[x]][x] = T.PATH;
    map[LANE_Y[x] + 1][x] = T.PATH;
    if (x > 0 && LANE_Y[x] !== LANE_Y[x - 1]) {
      const lo = Math.min(LANE_Y[x], LANE_Y[x - 1]);
      const hi = Math.max(LANE_Y[x], LANE_Y[x - 1]) + 1;
      for (let y = lo; y <= hi; y++) {
        map[y][x] = T.PATH;
        map[y][x - 1] = T.PATH;
      }
    }
  }

  // Bog, rushes, and flowers scattered across the wet ground
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < RIVER_X - 1; x++) {
      if (nearLane(x, y) || inFarm(x, y)) continue;
      const r = rnd();
      if (r < 0.2) map[y][x] = T.BOG;
      else if (r < 0.26) map[y][x] = T.REEDS;
      else if (r < 0.28) map[y][x] = T.FLOWERS;
    }
  }

  // Two standing pools ringed by rushes
  for (const [px0, py0] of [[5, 19], [28, 4]]) {
    for (let y = py0 - 1; y <= py0 + 2; y++)
      for (let x = px0 - 1; x <= px0 + 2; x++) {
        if (nearLane(x, y) || inFarm(x, y)) continue;
        const pool = x >= px0 && x <= px0 + 1 && y >= py0 && y <= py0 + 1;
        map[y][x] = pool ? T.WATER : T.REEDS;
      }
  }

  // ── Bamfurlong, Farmer Maggot's farm ────────────────
  // Clear the plot, fence the perimeter, leave a gate on the lane side
  for (let y = FARM.y0; y <= FARM.y1; y++)
    for (let x = FARM.x0; x <= FARM.x1; x++)
      map[y][x] = T.GRASS;
  for (let x = FARM.x0; x <= FARM.x1; x++) {
    map[FARM.y0][x] = T.FENCE;
    map[FARM.y1][x] = T.FENCE;
  }
  for (let y = FARM.y0; y <= FARM.y1; y++) {
    map[y][FARM.x0] = T.FENCE;
    map[y][FARM.x1] = T.FENCE;
  }
  map[FARM.y0][FARM.gateX] = T.PATH;
  map[FARM.y0][FARM.gateX + 1] = T.PATH;
  // Path stub from the lane down to the gate
  for (let y = LANE_Y[FARM.gateX] + 2; y < FARM.y0; y++) {
    map[y][FARM.gateX] = T.PATH;
    map[y][FARM.gateX + 1] = T.PATH;
  }

  // Farmhouse (stone, like the Green Dragon) along the top of the yard
  const HX = 15, HY = FARM.y0 + 1;
  const houseTop = [T.STONE, T.ROOF_L, T.ROOF, T.ROOF, T.ROOF, T.ROOF_R, T.STONE];
  const houseDoor = [T.STONE, T.DOOR_L, T.DOOR, T.DOOR, T.DOOR, T.DOOR_R, T.STONE];
  houseTop.forEach((t, i) => (map[HY][HX + i] = t));
  houseDoor.forEach((t, i) => (map[HY + 1][HX + i] = t));

  // Mushroom and crop rows fill the yard
  for (const y of [FARM.y0 + 4, FARM.y0 + 6]) {
    for (let x = FARM.x0 + 1; x <= FARM.x1 - 1; x++) {
      if (x === FARM.gateX || x === FARM.gateX + 1) continue; // keep the gate path clear
      map[y][x] = T.GARDEN;
    }
  }

  // ── The Brandywine and the ferry landing ────────────
  for (let y = 0; y < HEIGHT; y++)
    for (let x = RIVER_X; x < WIDTH; x++)
      map[y][x] = T.WATER;
  // Short pier at lane height
  map[LANE_Y[RIVER_X - 1]][RIVER_X] = T.DOCK;
  map[LANE_Y[RIVER_X - 1] + 1][RIVER_X] = T.DOCK_S;
  // Far bank — the Buckland shore
  for (let y = 1; y < HEIGHT - 1; y++) {
    map[y][BANK_X] = T.GRASS;
    map[y][BANK_X + 1] = T.GRASS;
  }
  // Lamp and signpost at the landing, sign on the far shore
  map[LANE_Y[RIVER_X - 1] - 1][RIVER_X - 1] = T.SIGN;
  map[LANE_Y[RIVER_X - 1] + 2][RIVER_X - 1] = T.LANTERN;
  map[LANE_Y[RIVER_X - 1] - 1][BANK_X + 1] = T.SIGN;

  // Border trees: full west/top/bottom (minus the lane gap), and down
  // the far edge of the Buckland shore
  for (let x = 0; x < RIVER_X; x++) {
    map[0][x] = T.TREE;
    map[HEIGHT - 1][x] = T.TREE;
  }
  map[0][BANK_X] = T.TREE; map[0][BANK_X + 1] = T.TREE; map[0][WIDTH - 1] = T.TREE;
  map[HEIGHT - 1][BANK_X] = T.TREE; map[HEIGHT - 1][BANK_X + 1] = T.TREE;
  map[HEIGHT - 1][WIDTH - 1] = T.TREE;
  for (let y = 0; y < HEIGHT; y++) {
    if (!(y === LANE_Y[0] || y === LANE_Y[0] + 1)) map[y][0] = T.TREE;
    map[y][WIDTH - 1] = T.TREE;
  }

  return map;
}

/** @type {import('../types.js').Zone} */
export const marish = {
  key: 'marish',
  label: 'The Marish',
  music: 'forest',
  map: generateMap(),
  spawns: {
    west: { x: 1, y: 12, dir: 'right' },
    landing: { x: 30, y: 13, dir: 'right' },
  },
  npcs: [
    // At his gate until the waggon ride; Merry waits at the lamplit
    // landing after it; after the crossing Merry stands on the far bank.
    { key: 'maggot', x: 23, y: 16, dir: 'up', when: (f) => !f.rodeWaggon },
    { key: 'merry', x: 32, y: 12, dir: 'down', when: (f) => f.rodeWaggon && !f.crossedFerry },
    { key: 'merry', x: 37, y: 12, dir: 'down', when: (f) => f.crossedFerry },
  ],
  doors: [],
  signs: [
    { x: 33, y: 12, dialogue: 'sign_ferry' },
    { x: 38, y: 12, dialogue: 'sign_buckland' },
  ],
  exits: [
    { x: 0, y: 12, zone: 'woodyend', entry: 'east' },
    { x: 0, y: 13, zone: 'woodyend', entry: 'east' },
  ],
  onUpdate: ferryEventUpdate,
};

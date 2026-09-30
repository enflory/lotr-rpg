import { T } from '../tileTypes.js';
import { field, wind, clearing, smoothNoise, point, edge } from './journeyMap.js';
import { isRoadBeat } from '../../state/longRoadProgress.js';
import { roadCreate, roadUpdate, roadDialogue } from '../../events/longRoadEvent.js';

// Chapter 5, "The Long Road": Midgewater, Weathertop, the Trollshaws and the
// Ford of Bruinen. Routes are carved last so that scatter can never seal them.
const cue = (x, y, key, label) => ({ x, y, dialogue: key, label, when: (f) => isRoadBeat(f, key) });
const inspect = point;
const exit = edge;
const rect = (m, x, y, w, h, t) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) m[j][i] = t;
};
/** @param {(x: number, y: number) => boolean} [keep] */
const scatter = (m, scale, offset, above, tile, keep = () => false) => {
  for (let y = 1; y < m.length - 1; y++)
    for (let x = 1; x < m[0].length - 1; x++)
      if (smoothNoise(x + offset, y + offset * 0.7, scale) > above && !keep(x, y)) m[y][x] = tile;
};
const hooks = { onCreate: roadCreate, onUpdate: roadUpdate, onDialogueLine: roadDialogue };

/* ── Midgewater ──────────────────────────────────────────── */
const marsh = field(50, 26, T.BOG, T.REEDS);
scatter(marsh, 5, 0, 0.66, T.DARK_WATER);
scatter(marsh, 3, 40, 0.68, T.REEDS);
wind(
  marsh,
  [
    [1, 13],
    [9, 15],
    [17, 11],
    [25, 13],
    [33, 16],
    [41, 12],
    [48, 12],
  ],
  1,
  T.GRASS2,
);
clearing(marsh, 25, 13, 4, 3, T.GRASS2);
marsh[12][49] = T.GRASS2;
marsh[13][0] = T.GRASS2;

/** @type {import('../types.js').Zone} */
export const midgewater = {
  key: 'midgewater',
  label: 'Midgewater Marshes',
  music: 'midgewater',
  map: marsh,
  spawns: { west: { x: 2, y: 13, dir: 'right' }, east: { x: 47, y: 12, dir: 'left' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(4, 13, 'road_marsh', 'Strider leaves the Road'),
    cue(25, 13, 'road_midges', 'A dry bank to rest on'),
    inspect(9, 15, 'road_reeds', 'The reed-beds'),
    inspect(33, 16, 'road_pool', 'A stagnant pool'),
    inspect(17, 11, 'road_bill', 'Bill the pony', (f) => f.billBought),
  ],
  exits: [
    exit(0, 13, 'breeroad', 'east'),
    exit(49, 12, 'weathertop', 'west', 'midgesEndured', 'Not here. Find a dry bank to rest first.'),
  ],
  ...hooks,
};

/* ── Weathertop ──────────────────────────────────────────── */
const hill = field(52, 36, T.DOWN_GRASS, T.DOWN_SLOPE);
scatter(hill, 4, 11, 0.72, T.DOWN_HEATHER);
// Two scarps leave a single gap for the climb.
rect(hill, 3, 18, 18, 2, T.DOWN_SLOPE);
rect(hill, 30, 18, 19, 2, T.DOWN_SLOPE);
// The ruined ring on the crown: broken walls with gaps south and west.
const ring = [];
for (let y = 1; y <= 15; y++)
  for (let x = 14; x <= 38; x++) {
    const d = Math.hypot((x - 26) / 1.25, y - 8);
    if (d > 5.6 && d < 7.2) ring.push([x, y]);
  }
for (const [x, y] of ring)
  if (!((x >= 24 && x <= 28 && y >= 13) || (x <= 20 && y >= 7 && y <= 9) || (x + y) % 7 === 0))
    hill[y][x] = T.RUIN;
rect(hill, 26, 8, 1, 1, T.RUBBLE);
for (const [x, y] of [[23, 6], [29, 6], [24, 10], [28, 10], [26, 5], [25, 8], [27, 8]]) hill[y][x] = T.RUBBLE;
// The dell, walled by turf, with its fire-pit.
rect(hill, 32, 21, 16, 12, T.DOWN_SLOPE);
clearing(hill, 39, 27, 5, 3, T.DOWN_GRASS);
for (const [x, y] of [[35, 24], [43, 24], [36, 30], [43, 30]]) hill[y][x] = T.RUIN;
hill[27][39] = T.FIRE_PIT;
wind(hill, [[1, 30], [10, 30], [18, 25], [26, 21], [26, 15]], 1, T.PATH);
wind(hill, [[26, 21], [31, 25], [35, 27]], 1, T.PATH);
wind(hill, [[43, 27], [47, 30], [50, 30]], 1, T.PATH);
hill[30][0] = T.PATH;
hill[30][51] = T.PATH;
for (const [x, y] of [[23, 12], [29, 12]]) hill[y][x] = T.RUBBLE;

/** @type {import('../types.js').Zone} */
export const weathertop = {
  key: 'weathertop',
  label: 'Weathertop · Amon Sul',
  music: 'weathertop',
  map: hill,
  spawns: {
    west: { x: 2, y: 30, dir: 'right' },
    east: { x: 49, y: 30, dir: 'left' },
    dell: { x: 38, y: 28, dir: 'up' },
  },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(5, 30, 'road_hill', 'The hill in the wilderness'),
    cue(26, 8, 'road_rune', 'The flat stone'),
    cue(39, 29, 'road_fire', 'Light a fire'),
    cue(39, 29, 'road_attack', 'Watch the dark'),
    cue(39, 29, 'road_wound', 'Go to Frodo'),
    inspect(29, 8, 'road_view', 'The view from the hill'),
    inspect(23, 12, 'road_wall', 'Broken wall'),
  ],
  exits: [
    exit(0, 30, 'midgewater', 'east'),
    exit(51, 30, 'trollshaws', 'west', 'frodoWounded', 'Frodo is hurt. See to him first.'),
  ],
  ...hooks,
};

/* ── The Trollshaws ──────────────────────────────────────── */
const shaws = field(60, 30, T.LEAVES, T.AUTUMN_TREE);
scatter(shaws, 4, 7, 0.55, T.AUTUMN_TREE);
clearing(shaws, 30, 14, 8, 5, T.LEAVES);
rect(shaws, 43, 1, 4, 28, T.WATER);
wind(shaws, [[1, 18], [12, 21], [20, 16], [30, 15], [42, 15]], 1, T.PATH);
wind(shaws, [[48, 15], [58, 15]], 1, T.PATH);
rect(shaws, 43, 15, 4, 1, T.BRIDGE);
rect(shaws, 43, 14, 4, 1, T.BRIDGE);
clearing(shaws, 13, 22, 2, 1, T.LEAVES);
shaws[22][13] = T.FLOWERS;
shaws[22][12] = T.FLOWERS;
// Three trolls, turned to stone. Their footprints are solid.
rect(shaws, 26, 10, 2, 2, T.RUIN);
rect(shaws, 30, 9, 2, 2, T.RUIN);
rect(shaws, 34, 11, 2, 2, T.RUIN);
shaws[15][0] = T.LEAVES;
shaws[18][0] = T.PATH;
shaws[15][59] = T.PATH;

/** @type {import('../types.js').Zone} */
export const trollshaws = {
  key: 'trollshaws',
  label: 'The Trollshaws',
  music: 'trollshaws',
  map: shaws,
  spawns: { west: { x: 2, y: 18, dir: 'right' }, east: { x: 57, y: 15, dir: 'left' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(13, 22, 'road_athelas', 'A sweet-smelling weed'),
    cue(30, 14, 'road_trolls', 'Three stone figures'),
    cue(40, 15, 'road_glorfindel', 'Hoofbeats on the Road'),
    inspect(44, 14, 'road_bridge', 'The Last Bridge'),
    inspect(20, 16, 'road_beech', 'A red-gold beech'),
  ],
  exits: [
    exit(0, 18, 'weathertop', 'east'),
    exit(59, 15, 'bruinen', 'west', 'glorfindelMet', 'The others are behind you. Wait for the hoofbeats.'),
  ],
  ...hooks,
};

/* ── The Ford of Bruinen ─────────────────────────────────── */
const ford = field(50, 24, T.LEAVES, T.AUTUMN_TREE);
scatter(ford, 4, 31, 0.56, T.AUTUMN_TREE, (x, _y) => x >= 28 && x <= 33);
rect(ford, 34, 1, 15, 22, T.DOWN_GRASS);
rect(ford, 28, 1, 6, 22, T.WATER);
rect(ford, 28, 9, 6, 5, T.FORD);
wind(ford, [[1, 11], [27, 11]], 1, T.PATH);
wind(ford, [[34, 11], [48, 11]], 1, T.PATH);
rect(ford, 28, 9, 6, 5, T.FORD);
ford[11][0] = T.PATH;

/** @type {import('../types.js').Zone} */
export const bruinen = {
  key: 'bruinen',
  label: 'The Ford of Bruinen',
  music: 'ford',
  map: ford,
  spawns: { west: { x: 2, y: 11, dir: 'right' }, east: { x: 40, y: 11, dir: 'left' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(5, 11, 'road_ford', 'Glorfindel and the white horse'),
    inspect(26, 9, 'road_river', 'The Bruinen'),
    inspect(38, 11, 'road_nine', 'The far bank', (f) => f.chapter5Complete),
  ],
  exits: [exit(0, 11, 'trollshaws', 'east')],
  ...hooks,
};

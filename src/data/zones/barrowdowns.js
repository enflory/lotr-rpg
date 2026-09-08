import { T } from '../tileTypes.js';
import { field, clearing, wind, point, edge, smoothNoise } from './journeyMap.js';
import { journeyCreate, journeyUpdate, journeyDialogue } from '../../events/journeyEvent.js';

/* ── The Barrow-downs ─────────────────────────────────────────────────────
   Two octaves of value noise raise a whole country of turf hills: solid hill
   bodies, winding green vales between them, and never a straight horizon.
   The only signposting is a pale chalk sheep-track, carved last so no hill
   can seal it. It climbs west to east to the great stone at the centre of
   the downs, then runs on north-east to the two gate stones.               */

const W = 72,
  H = 48;
const relief = (x, y) =>
  smoothNoise(x, y, 7) * 0.6 +
  smoothNoise(x + 41, y + 17, 14) * 0.4 +
  Math.sin(y * 0.4 - x * 0.12) * 0.1;
const hills = field(W, H, T.DOWN_GRASS, T.DOWN_SLOPE);
for (let y = 1; y < H - 1; y++)
  for (let x = 1; x < W - 1; x++) {
    const h = relief(x, y);
    if (h > 0.48) hills[y][x] = T.DOWN_SLOPE;
    else if (h < 0.3 && smoothNoise(x + 7, y + 90, 5) > 0.62) hills[y][x] = T.DOWN_HEATHER;
  }
// One-tile spurs and pinholes read as debris rather than landscape once the
// relief is shaded, so open them out before anything else is placed.
function settle(map, solid = T.DOWN_SLOPE, open = T.DOWN_GRASS) {
  for (let pass = 0; pass < 2; pass++) {
    const before = map.map((row) => row.slice());
    const n = (x, y) => (before[y]?.[x] === solid ? 1 : 0);
    for (let y = 1; y < map.length - 1; y++)
      for (let x = 1; x < map[y].length - 1; x++) {
        const near = n(x - 1, y) + n(x + 1, y) + n(x, y - 1) + n(x, y + 1);
        if (before[y][x] === solid && near < 2) map[y][x] = open;
        if (before[y][x] !== solid && near === 4) map[y][x] = solid;
      }
  }
}
settle(hills);

// Old graves: round green mounds in the southern vale, and the ring of
// weathered uprights the road passes on its way up to the great stone.
for (const [cx, cy, r] of [
  [16, 35, 3],
  [22, 37, 2],
  [11, 33, 2],
  [45, 33, 3],
  [51, 36, 2],
])
  clearing(hills, cx, cy, r, Math.max(1, r - 1), T.DOWN_SLOPE);

// The main crossing. The corridor is opened first so the walk is never
// blocked; the pale chalk is then laid one tile wide down its middle.
const ROAD = [
  [0, 30],
  [5, 30],
  [8, 29],
  [10, 28],
  [12, 27],
  [14, 26],
  [16, 26],
  [18, 25],
  [21, 24],
  [23, 23],
  [26, 23],
  [28, 22],
];
const NORTH = [
  [28, 22],
  [31, 21],
  [33, 20],
  [35, 19],
  [37, 18],
  [39, 18],
  [41, 17],
  [42, 16],
  [45, 15],
  [47, 14],
  [50, 14],
  [53, 13],
  [53, 11],
  [55, 10],
  [58, 10],
  [61, 9],
];
const SOUTH = [
  [15, 26],
  [16, 31],
  [17, 36],
  [24, 38],
  [33, 36],
  [40, 33],
  [45, 30],
  [47, 22],
  [47, 14],
];
for (const route of [ROAD, NORTH, SOUTH]) wind(hills, route, 1, T.DOWN_GRASS);
for (const route of [ROAD, NORTH]) wind(hills, route, 0, T.CHALK);
// Scattered uprights, then the one the track climbs to. The great stone is
// its own tile so it reads as a landmark rather than another grey sliver.
for (const [x, y] of [
  [12, 22],
  [24, 26],
  [39, 21],
  [44, 12],
  [58, 15],
  [30, 34],
  [52, 12],
  [54, 12],
])
  hills[y][x] = T.STANDING_STONE;
hills[20][28] = T.GREAT_STONE;

/** @type {import('../types.js').Zone} */
export const downs = {
  key: 'downs',
  label: 'Chapter 3 • The Barrow-downs',
  music: 'downs',
  map: hills,
  spawns: {
    west: { x: 2, y: 30, dir: 'right' },
    stone: { x: 28, y: 22, dir: 'up' },
    gate: { x: 53, y: 14, dir: 'up' },
  },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    point(8, 30, 'downs_farewell', 'Look back the way you came'),
    point(17, 35, 'downs_mounds', 'The green mounds'),
    point(37, 18, 'downs_view', 'Look out over the downs'),
    point(28, 22, 'downs_stone', 'Rest beside the great stone'),
    point(53, 13, 'downs_gate', 'The two stones like a doorway'),
    point(61, 9, 'downs_voices', 'Call to your companions', (f) => f.downsFog),
  ],
  // Once the mist is down there is no walking back to the house: leaving would
  // undo the separation and hand the player three companions it has just taken.
  exits: [
    {
      ...edge(0, 30, 'tomclearing', 'east'),
      blockedWhen: (f) => !!f.downsFog,
      denied: 'The mist has closed behind you.\nThere is no finding the way back.',
    },
  ],
  onCreate: journeyCreate,
  onUpdate: journeyUpdate,
  onDialogueLine: journeyDialogue,
};

/* ── Under the stone ──────────────────────────────────────────────────────
   One long chamber with a spur of wall part-way down it. Frodo wakes at the
   western end; the hand comes creeping round that corner out of the dark.  */
const tomb = field(40, 26, T.VOID, T.VOID);
for (let y = 5; y <= 20; y++)
  for (let x = 4; x <= 35; x++)
    tomb[y][x] = x === 4 || x === 35 || y === 5 || y === 20 ? T.BARROW_WALL : T.BARROW_FLOOR;
for (let y = 6; y <= 12; y++) tomb[y][24] = T.BARROW_WALL;
for (let y = 14; y <= 19; y++) tomb[y][29] = T.BARROW_WALL;
for (const [x, y] of [
  [8, 7],
  [12, 7],
  [19, 7],
  [33, 18],
])
  tomb[y][x] = T.BARROW_WALL;

/** @type {import('../types.js').Zone} */
export const barrow = {
  key: 'barrow',
  label: 'Under the Stone',
  music: 'barrow',
  map: tomb,
  spawns: { default: { x: 10, y: 16, dir: 'up' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    point(15, 13, 'barrow_courage', 'Stand by your friends', (f) => !f.barrowCourage),
    point(10, 13, 'barrow_call', 'Sing the verse Tom taught you', (f) => f.barrowCourage),
    point(31, 16, 'barrow_hoard', 'The heaped treasure', (f) => f.barrowCourage),
  ],
  exits: [],
  onCreate: journeyCreate,
  onUpdate: journeyUpdate,
  onDialogueLine: journeyDialogue,
};

/* ── The plain light of day ───────────────────────────────────────────────
   The broken mound stands open at the north; the grass falls away east and
   south to the line of the road.                                           */
const morning = field(42, 30, T.DOWN_GRASS, T.DOWN_SLOPE);
for (let y = 1; y < 29; y++)
  for (let x = 1; x < 41; x++)
    if (
      smoothNoise(x + 3, y + 60, 6) * 0.65 + smoothNoise(x + 30, y, 13) * 0.35 >
      (y < 12 ? 0.44 : 0.62)
    )
      morning[y][x] = T.DOWN_SLOPE;
clearing(morning, 18, 15, 12, 8, T.DOWN_GRASS);
clearing(morning, 30, 21, 9, 5, T.DOWN_GRASS);
// The barrow itself is a solid mound; the torn opening in its south face is
// drawn by the scenery pass, so nothing about it is walkable.
for (let y = 4; y < 12; y++) for (let x = 11; x < 26; x++) morning[y][x] = T.DOWN_SLOPE;
for (const [x, y] of [
  [13, 13],
  [23, 12],
])
  morning[y][x] = T.STANDING_STONE;
wind(morning, [[18, 12], [18, 16], [26, 18], [33, 20], [41, 21]], 1, T.DOWN_GRASS);
wind(morning, [[18, 16], [26, 18], [33, 20], [41, 21]], 0, T.CHALK);
for (const [cx, cy] of [[12, 21], [28, 25]]) clearing(morning, cx, cy, 3, 2, T.DOWN_HEATHER);

/** @type {import('../types.js').Zone} */
export const barrowhill = {
  key: 'barrowhill',
  label: 'The Plain Light of Day',
  music: 'bombadil',
  map: morning,
  spawns: { default: { x: 18, y: 14, dir: 'down' }, east: { x: 39, y: 21, dir: 'left' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    point(24, 16, 'barrow_treasure', 'The blades of Westernesse'),
    point(15, 18, 'barrow_memory', 'Merry remembers'),
    point(18, 12, 'barrow_broken', 'The broken mound'),
    point(30, 20, 'barrow_ponies', 'Tom and the ponies'),
  ],
  exits: [
    edge(41, 21, 'eastroad', 'west', 'poniesRecovered', 'Wait for Tom to bring back the ponies.'),
  ],
  onCreate: journeyCreate,
  onUpdate: journeyUpdate,
  onDialogueLine: journeyDialogue,
};

/* ── The East Road ────────────────────────────────────────────────────────
   The downs stand behind to the north; the road runs out of Tom's country. */
const road = field(48, 26, T.DOWN_GRASS, T.HEDGE);
// The downs stand up behind the road: solid at the top of the screen,
// breaking into separate green shoulders as they come down to the verge.
for (let y = 1; y < 10; y++)
  for (let x = 1; x < 47; x++)
    if (y < 5 || smoothNoise(x + 11, y + 5, 8) > 0.26 + (y - 4) * 0.09) road[y][x] = T.DOWN_SLOPE;
const EAST = [[0, 17], [7, 17], [13, 15], [21, 13], [31, 12], [47, 12]];
wind(road, EAST, 1, T.DOWN_GRASS);
wind(road, EAST, 1, T.PATH);
for (const [cx, cy] of [[18, 19], [37, 17], [9, 21]]) clearing(road, cx, cy, 3, 2, T.DOWN_HEATHER);
// A weathered upright by the verge, not a Shire milestone: T.STONE keeps its
// own green tile behind it and would show as a pale square on downland turf.
road[15][26] = T.STANDING_STONE;

/** @type {import('../types.js').Zone} */
export const eastroad = {
  key: 'eastroad',
  label: 'The East Road',
  music: 'shire',
  map: road,
  spawns: { west: { x: 2, y: 17, dir: 'right' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    point(14, 12, 'road_farewell', 'Farewell to Tom'),
    point(43, 12, 'road_east', 'The road toward Bree'),
  ],
  exits: [edge(0, 17, 'barrowhill', 'east')],
  onCreate: journeyCreate,
  onUpdate: journeyUpdate,
  onDialogueLine: journeyDialogue,
};

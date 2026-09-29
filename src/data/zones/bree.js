import { T } from '../tileTypes.js';
import { field, trail } from './journeyMap.js';
import { isBreeBeat } from '../../state/breeProgress.js';
import { breeCreate, breeUpdate, breeDialogue } from '../../events/breeEvent.js';

const cue = (x, y, key, label) => ({ x, y, dialogue: key, label, when: (f) => isBreeBeat(f, key) });
const inspect = (x, y, key, label) => ({ x, y, dialogue: key, label });
const exit = (x, y, zone, entry, requires, denied) => ({
  x,
  y,
  zone,
  entry,
  ...(requires ? { requires, denied } : {}),
});
const rect = (m, x, y, w, h, t) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) m[j][i] = t;
};
const room = (w, h) => {
  const m = field(w, h, T.FLOOR, T.VOID);
  rect(m, 1, 1, w - 2, 1, T.PANEL);
  return m;
};
const hooks = { onCreate: breeCreate, onUpdate: breeUpdate, onDialogueLine: breeDialogue };
const quietNight = (f) => f.breeRingSlip && !f.breeMorning;

const gate = field(28, 22, T.DOWN_GRASS, T.HEDGE);
rect(gate, 18, 1, 2, 20, T.HEDGE);
rect(gate, 16, 1, 1, 20, T.DITCH);
trail(
  gate,
  [
    [0, 14],
    [27, 14],
  ],
  1,
  T.PATH,
);
gate[11][18] = T.LANTERN;

/** @type {import('../types.js').Zone} */
export const breegate = {
  key: 'breegate',
  label: 'Bree · The Western Gate',
  music: 'bree',
  map: gate,
  spawns: { west: { x: 2, y: 14, dir: 'right' }, village: { x: 25, y: 14, dir: 'left' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(17, 14, 'bree_gate', 'Speak to Harry'),
    inspect(8, 15, 'bree_crossroads', 'The Greenway'),
  ],
  exits: [
    {
      ...exit(0, 14, 'eastroad', 'bree'),
      blockedWhen: (f) => f.striderJoined,
      denied: 'Strider is taking the company east, toward Rivendell.',
    },
    exit(27, 14, 'bree', 'west', 'breeAdmitted', 'Speak to Harry at the gate first.'),
  ],
  ...hooks,
};

// Building footprints are solid. Scenery draws the facade upward from its
// southern edge; no decorative wall is painted across a walkable lane.
export const BREE_BUILDINGS = [
  { x: 18, y: 3, w: 13, h: 8, floors: 3, pony: true },
  { x: 4, y: 5, w: 7, h: 5, floors: 2 },
  { x: 35, y: 5, w: 7, h: 6, floors: 2 },
  { x: 5, y: 22, w: 8, h: 6, floors: 2 },
  { x: 33, y: 22, w: 9, h: 5, floors: 2 },
  { x: 25, y: 22, w: 6, h: 4, floors: 1 },
];
const town = field(48, 32, T.DOWN_GRASS, T.HEDGE);
for (const b of BREE_BUILDINGS) rect(town, b.x, b.y, b.w, b.h, T.BARN);
trail(
  town,
  [
    [0, 17],
    [47, 17],
  ],
  2,
  T.PATH,
);
trail(
  town,
  [
    [24, 17],
    [24, 11],
  ],
  1,
  T.PATH,
);
trail(
  town,
  [
    [24, 17],
    [24, 26],
  ],
  1,
  T.PATH,
);
for (const [x, y] of [
  [14, 14],
  [30, 13],
  [40, 20],
  [18, 24],
])
  town[y][x] = T.LANTERN;
for (const [x, y] of [
  [2, 4],
  [14, 4],
  [44, 4],
  [44, 26],
  [17, 29],
  [29, 29],
  [3, 25],
])
  town[y][x] = T.TREE2;
town[24][19] = T.WELL;

/** @type {import('../types.js').Zone} */
export const bree = {
  key: 'bree',
  label: 'Bree · The Prancing Pony',
  music: 'bree',
  map: town,
  spawns: {
    west: { x: 2, y: 17, dir: 'right' },
    inn: { x: 24, y: 12, dir: 'down' },
    east: { x: 45, y: 17, dir: 'left' },
  },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    inspect(26, 12, 'bree_sign', 'The white pony sign'),
    inspect(38, 13, 'bree_hill', 'The houses of Bree'),
    inspect(23, 26, 'bree_stable', 'The stable yard'),
    cue(36, 19, 'bree_bill', 'Butterbur and the pony'),
  ],
  exits: [
    exit(0, 17, 'breegate', 'village'),
    exit(24, 11, 'ponycommon', 'door'),
    exit(
      47,
      17,
      'breeroad',
      'west',
      'billBought',
      'Find lodging at the Prancing Pony before travelling on.',
    ),
  ],
  ...hooks,
};

const common = room(30, 23);
rect(common, 3, 3, 5, 1, T.COUNTER);
rect(common, 12, 1, 5, 3, T.PANEL);
rect(common, 13, 4, 3, 1, T.FIREPLACE);
rect(common, 10, 9, 9, 4, T.RUG);
for (const [x, y] of [
  [6, 8],
  [13, 7],
  [21, 8],
  [7, 14],
  [20, 14],
]) {
  rect(common, x, y, 2, 1, T.TABLE);
  common[y - 1][x] = T.SETTLE;
}
for (const x of [5, 23]) common[1][x] = T.WINDOW_I;
common[22][15] = T.FLOOR;
common[18][29] = T.FLOOR;

/** @type {import('../types.js').Zone} */
export const ponycommon = {
  key: 'ponycommon',
  label: 'The Prancing Pony · Common Room',
  music: 'pony',
  map: common,
  spawns: { door: { x: 15, y: 20, dir: 'up' }, parlour: { x: 27, y: 18, dir: 'left' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(6, 5, 'bree_welcome', 'Butterbur’s welcome'),
    cue(13, 11, 'bree_company', 'Meet the company'),
    cue(14, 10, 'bree_song', 'Pippin’s story'),
    {
      ...inspect(18, 11, 'bree_locals', 'Talk with the company'),
      when: (f) => f.breeCompany && !f.breeRingSlip,
    },
    { ...inspect(24, 8, 'bree_fern', 'The whispering corner'), when: (f) => !f.breeRingSlip },
  ],
  exits: [
    {
      ...exit(15, 22, 'bree', 'inn'),
      blockedWhen: quietNight,
      denied: 'Stay inside. Strider is waiting in the parlour.',
    },
    exit(
      29,
      18,
      'ponyparlour',
      'common',
      'ponyWelcomed',
      'Speak to Butterbur first. He will show you to your parlour.',
    ),
  ],
  ...hooks,
};

const parlour = room(24, 20);
parlour[1][6] = T.WINDOW_I;
parlour[1][18] = T.WINDOW_I;
rect(parlour, 10, 2, 3, 1, T.FIREPLACE);
rect(parlour, 7, 8, 3, 1, T.TABLE);
parlour[4][17] = T.SETTLE;
parlour[16][0] = T.FLOOR;
parlour[16][23] = T.FLOOR;

/** @type {import('../types.js').Zone} */
export const ponyparlour = {
  key: 'ponyparlour',
  label: 'The Pony · A Private Parlour',
  music: 'breewatch',
  map: parlour,
  spawns: { common: { x: 2, y: 16, dir: 'right' }, rooms: { x: 21, y: 16, dir: 'left' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(8, 10, 'bree_supper', 'Supper with your friends'),
    cue(16, 6, 'bree_strider', 'The stranger by the wall'),
    cue(4, 12, 'bree_letter', 'Butterbur’s letter'),
    cue(16, 6, 'bree_trust', 'The broken sword'),
    cue(5, 15, 'bree_merry', 'Nob brings Merry'),
    cue(12, 10, 'bree_watch', 'Keep watch by the fire'),
  ],
  exits: [
    exit(0, 16, 'ponycommon', 'parlour'),
    exit(
      23,
      16,
      'ponyrooms',
      'parlour',
      'breeMerryReturned',
      'Wait for Merry. The party must stay together.',
    ),
  ],
  ...hooks,
};

const beds = room(26, 18);
for (const x of [5, 10, 15, 20]) {
  beds[1][x] = T.WINDOW_I;
  beds[5][x] = T.BED;
}
beds[13][0] = T.FLOOR;

/** @type {import('../types.js').Zone} */
export const ponyrooms = {
  key: 'ponyrooms',
  label: 'The Pony · Hobbit Rooms',
  music: 'breewatch',
  map: beds,
  spawns: { parlour: { x: 2, y: 13, dir: 'right' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(12, 8, 'bree_decoys', 'Help Nob lay the decoys'),
    cue(12, 8, 'bree_damage', 'The ruined beds'),
    inspect(22, 12, 'bree_rooms', 'Rooms for Little Folk'),
  ],
  exits: [exit(0, 13, 'ponyparlour', 'rooms')],
  ...hooks,
};

const beyond = field(40, 22, T.DOWN_GRASS, T.HEDGE);
trail(
  beyond,
  [
    [0, 14],
    [16, 14],
    [24, 11],
    [37, 11],
  ],
  1,
  T.PATH,
);
rect(beyond, 7, 8, 8, 1, T.HEDGEROW);
rect(beyond, 7, 3, 8, 4, T.BARN);

/** @type {import('../types.js').Zone} */
export const breeroad = {
  key: 'breeroad',
  label: 'Out of Bree · The Wild Road',
  music: 'shire',
  map: beyond,
  spawns: { west: { x: 2, y: 14, dir: 'right' } },
  npcs: [],
  doors: [],
  signs: [],
  interactions: [
    cue(11, 13, 'bree_depart', 'Leave Bree with the company'),
    inspect(35, 11, 'bree_horizon', 'The road ahead'),
  ],
  exits: [exit(0, 14, 'bree', 'east')],
  ...hooks,
};

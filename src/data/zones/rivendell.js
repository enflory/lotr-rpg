import { T } from '../tileTypes.js';
import { field, wind, smoothNoise, point, edge } from './journeyMap.js';
import { isRvBeat, councilNow } from '../../state/rivendellProgress.js';
import { COUNCIL_SEATS, FAREWELL, WALKERS } from '../../events/rivendellStaging.js';
import { rvCreate, rvUpdate, rvDialogue } from '../../events/rivendellEvent.js';

// Chapter 6, "Rivendell": the room-wing, the hall, and the valley around the
// Last Homely House. The Ford of Bruinen (the chapter's first beat) is in
// longroad.js with the rest of the road.
const cue = (x, y, key, label) => ({ x, y, dialogue: key, label, when: (f) => isRvBeat(f, key) });
const inspect = point;
const exit = edge;
const rect = (m, x, y, w, h, t) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) m[j][i] = t;
};
const interior = (w, h) => Array.from({ length: h }, () => Array(w).fill(T.VOID));
const hooks = { onCreate: rvCreate, onUpdate: rvUpdate, onDialogueLine: rvDialogue };
const npc = (key, x, y, dir, when) => ({ key, x, y, dir, when });
const seat = (s, when) => npc(s.key, s.x, s.y, s.dir, when);

/* ── The room-wing: Frodo's chamber, the passage, Bilbo's room ─── */
const wing = interior(26, 14);
rect(wing, 1, 2, 24, 10, T.ELF_WALL);
rect(wing, 2, 4, 8, 7, T.ELF_FLOOR);
rect(wing, 11, 4, 4, 7, T.ELF_FLOOR);
rect(wing, 16, 4, 8, 7, T.ELF_FLOOR);
for (const x of [10, 15]) rect(wing, x, 7, 1, 2, T.ELF_FLOOR);
rect(wing, 11, 0, 4, 4, T.ELF_WALL);
rect(wing, 12, 0, 2, 4, T.ELF_FLOOR);
rect(wing, 11, 12, 4, 2, T.ELF_WALL);
rect(wing, 12, 11, 2, 3, T.ELF_FLOOR);
for (const x of [3, 6, 21]) wing[3][x] = T.WINDOW_I;
for (const x of [17, 18, 19, 23]) wing[3][x] = T.SHELF;
wing[6][3] = T.BED;
wing[5][8] = T.TABLE;
rect(wing, 4, 8, 3, 2, T.RUG);
wing[5][21] = T.TABLE;
wing[9][23] = T.BED;
wing[4][11] = T.ELF_LAMP;
wing[4][14] = T.ELF_LAMP;
wing[9][11] = T.ELF_LAMP;
wing[9][14] = T.ELF_LAMP;

/** @type {import('../types.js').Zone} */
export const rivendellroom = {
  key: 'rivendellroom',
  label: 'The Last Homely House',
  music: 'hallfire',
  map: wing,
  spawns: {
    bed: { x: 4, y: 6, dir: 'left' },
    fromHall: { x: 12, y: 2, dir: 'down' },
    door: { x: 12, y: 11, dir: 'up' },
    bilbo: { x: 17, y: 8, dir: 'right' },
  },
  npcs: [
    npc('bilboelder', 19, 6, 'down', (f) => f.hallOfFire && !councilNow(f) && !f.chapter6Complete),
  ],
  doors: [],
  signs: [],
  interactions: [
    cue(19, 7, 'rv_gifts', 'Bilbo’s room'),
    inspect(8, 6, 'rv_window', 'The open window'),
    inspect(22, 6, 'rv_book', 'A heap of papers'),
  ],
  exits: [
    exit(12, 0, 'rivendellhall', 'fromRooms', 'rivendellWoke', 'Gandalf has told you to rest.'),
    exit(13, 0, 'rivendellhall', 'fromRooms', 'rivendellWoke', 'Gandalf has told you to rest.'),
    exit(12, 13, 'rivendell', 'door', 'hallOfFire', 'The evening belongs to the hall.'),
    exit(13, 13, 'rivendell', 'door', 'hallOfFire', 'The evening belongs to the hall.'),
  ],
  ...hooks,
};

/* ── The hall: the high table and, at the west end, the Hall of Fire ─── */
const hall = interior(32, 22);
rect(hall, 1, 2, 30, 19, T.ELF_WALL);
rect(hall, 2, 4, 28, 16, T.ELF_FLOOR);
rect(hall, 15, 20, 2, 2, T.ELF_FLOOR);
rect(hall, 30, 9, 2, 2, T.ELF_FLOOR);
rect(hall, 11, 6, 9, 1, T.ELF_TABLE);
rect(hall, 7, 9, 4, 1, T.ELF_TABLE);
rect(hall, 21, 9, 4, 1, T.ELF_TABLE);
rect(hall, 3, 12, 3, 6, T.RUG);
for (const [x, y] of [[6, 6], [6, 9], [25, 6], [25, 9], [25, 14], [25, 17], [2, 13], [2, 16]])
  hall[y][x] = T.ELF_PILLAR;
rect(hall, 2, 14, 1, 2, T.GREAT_HEARTH);
for (const [x, y] of [[3, 4], [28, 4], [11, 19], [20, 19]]) hall[y][x] = T.ELF_LAMP;
hall[13][4] = T.SETTLE;
hall[16][4] = T.SETTLE;
const atTable = (f) => f.rivendellWoke && !f.feastHeld;
const atHearth = (f) => f.feastHeld && !f.hallOfFire;

/** @type {import('../types.js').Zone} */
export const rivendellhall = {
  key: 'rivendellhall',
  label: 'The Hall of Fire',
  music: 'hallfire',
  map: hall,
  spawns: {
    fromRooms: { x: 15, y: 18, dir: 'up' },
    fromEast: { x: 29, y: 9, dir: 'left' },
    hearth: { x: 5, y: 14, dir: 'left' },
  },
  npcs: [
    npc('gloin', 11, 5, 'down', atTable),
    npc('gandalfrv', 13, 5, 'down', atTable),
    npc('elrond', 15, 5, 'down', atTable),
    npc('arwen', 17, 5, 'down', atTable),
    npc('dunadan', 19, 5, 'down', atTable),
    npc('bilboelder', 12, 7, 'up', atTable),
    npc('bilboelder', 4, 15, 'right', atHearth),
    npc('lindir', 6, 15, 'left', (f) => f.feastHeld),
  ],
  doors: [],
  signs: [],
  interactions: [
    cue(15, 8, 'rv_feast', 'The high table'),
    cue(4, 14, 'rv_song', 'The Hall of Fire'),
    inspect(27, 12, 'rv_pillars', 'Carved pillars'),
    inspect(8, 11, 'rv_hearth', 'The great hearth'),
  ],
  exits: [
    exit(15, 21, 'rivendellroom', 'fromHall'),
    exit(16, 21, 'rivendellroom', 'fromHall'),
    exit(31, 9, 'rivendell', 'porch', 'hallOfFire', 'The evening belongs to the hall.'),
    exit(31, 10, 'rivendell', 'porch', 'hallOfFire', 'The evening belongs to the hall.'),
  ],
  ...hooks,
};

/* ── The valley ──────────────────────────────────────────── */
const vale = field(64, 44, T.GRASS, T.FIR);
rect(vale, 1, 1, 62, 6, T.FIR);
rect(vale, 1, 1, 6, 42, T.WATER); // the river on the west side
rect(vale, 54, 9, 9, 34, T.WATER); // and the gorge east of the porch
rect(vale, 54, 1, 4, 8, T.FALLS);
rect(vale, 58, 1, 5, 8, T.FIR);
// Fir and golden beech thinly scattered; the house and its gardens are laid over them.
for (let y = 8; y < 43; y++)
  for (let x = 7; x < 54; x++)
    if (vale[y][x] === T.GRASS && smoothNoise(x + 9, y + 4, 4) > 0.64)
      vale[y][x] = smoothNoise(x, y, 3) > 0.5 ? T.AUTUMN_TREE : T.FIR;
rect(vale, 16, 12, 37, 30, T.GRASS);
// The Last Homely House: roof, carved wall, a colonnade and broad steps.
rect(vale, 16, 12, 28, 3, T.ELF_ROOF);
rect(vale, 16, 15, 28, 3, T.ELF_WALL);
rect(vale, 16, 18, 29, 1, T.ELF_FLOOR);
for (const x of [16, 20, 24, 28, 32, 36, 40]) vale[18][x] = T.ELF_PILLAR;
vale[17][26] = T.DOOR;
vale[17][34] = T.DOOR;
rect(vale, 24, 19, 13, 1, T.STEPS);
// The east porch above the gorge, where the Council sits.
rect(vale, 44, 15, 9, 12, T.ELF_FLOOR);
rect(vale, 44, 14, 10, 1, T.BALUSTRADE);
rect(vale, 53, 15, 1, 13, T.BALUSTRADE);
rect(vale, 44, 27, 9, 1, T.BALUSTRADE);
vale[27][47] = vale[27][48] = T.STEPS;
vale[15][44] = vale[15][52] = T.ELF_LAMP;
// Gardens and paths are carved last so no scatter can seal a way.
wind(vale, [[7, 30], [30, 30]], 1, T.PATH);
wind(vale, [[30, 30], [30, 20]], 1, T.PATH);
wind(vale, [[30, 30], [30, 38]], 1, T.PATH);
wind(vale, [[30, 34], [38, 34]], 1, T.PATH);
wind(vale, [[31, 26], [47, 28]], 1, T.PATH);
rect(vale, 26, 39, 8, 2, T.PATH);
rect(vale, 30, 41, 2, 2, T.PATH);
rect(vale, 1, 30, 6, 2, T.BRIDGE);
vale[30][0] = vale[31][0] = T.PATH;
rect(vale, 20, 32, 5, 3, T.FLOWERS);
rect(vale, 40, 36, 4, 3, T.FLOWERS);
rect(vale, 12, 24, 4, 3, T.FLOWERS);
vale[33][37] = vale[34][37] = T.BENCH;
for (const [x, y] of [[28, 22], [32, 22], [28, 27], [32, 27], [28, 36], [32, 36]]) vale[y][x] = T.ELF_LAMP;
// The southern gate: two pillars and a rail, with the road running on.
rect(vale, 24, 41, 5, 1, T.BALUSTRADE);
rect(vale, 33, 41, 5, 1, T.BALUSTRADE);
vale[41][29] = vale[41][32] = T.ELF_PILLAR;
const gone = (f) => f.chapter6Complete;
const gathered = (f) => councilNow(f);
const after = (f) => f.ringBearerChosen && !f.giftsGiven;

/** @type {import('../types.js').Zone} */
export const rivendell = {
  key: 'rivendell',
  label: 'Rivendell · Imladris',
  music: 'rivendell',
  map: vale,
  spawns: {
    bridge: { x: 8, y: 30, dir: 'right' },
    door: { x: 26, y: 19, dir: 'down' },
    porch: { x: 46, y: 20, dir: 'right' },
    gate: { x: 30, y: 40, dir: 'down' },
  },
  npcs: [
    ...COUNCIL_SEATS.map((s) => seat(s, gathered)),
    npc('elrond', 48, 18, 'down', after),
    npc('erestor', 46, 17, 'down', after),
    npc('galdor', 50, 17, 'down', after),
    npc('lindir', 50, 23, 'left', after),
    npc('gandalfrv', 45, 21, 'right', after),
    npc('dunadan', 44, 24, 'up', after),
    npc('legolas', 40, 31, 'left', after),
    npc('gimli', 38, 31, 'right', after),
    npc('boromir', 24, 27, 'down', after),
    npc('gloin', 20, 28, 'right', after),
    npc('arwen', 22, 26, 'down', after),
    ...FAREWELL.map((s) => seat(s, gone)),
    ...WALKERS.filter((w) => w.kind === 'npc').map((w) => seat(w, gone)),
  ],
  doors: [
    { x: 26, y: 17, zone: 'rivendellroom', entry: 'door' },
    { x: 34, y: 17, zone: 'rivendellhall', entry: 'fromRooms' },
  ],
  signs: [],
  interactions: [
    cue(48, 21, 'rv_council1', 'The Council of Elrond'),
    cue(48, 21, 'rv_council2', 'The Council of Elrond'),
    cue(48, 21, 'rv_council3', 'The Council of Elrond'),
    cue(36, 33, 'rv_weeks', 'The garden bench'),
    cue(30, 39, 'rv_company', 'The southern gate'),
    inspect(7, 31, 'rv_bridge', 'The narrow bridge'),
    inspect(50, 16, 'rv_falls', 'The falls'),
    inspect(22, 33, 'rv_garden', 'The garden beds'),
    inspect(13, 25, 'rv_beech', 'A golden beech'),
    inspect(30, 42, 'rv_roadsouth', 'The road south', gone),
  ],
  exits: [],
  ...hooks,
};

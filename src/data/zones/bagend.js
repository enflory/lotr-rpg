// Bag End — "a very comfortable tunnel without smoke, with panelled walls,
// and floors tiled and carpeted, provided with polished chairs, and lots and
// lots of pegs for hats and coats". The plan follows the book: a round door
// opening on a hall that runs straight into the Hill, with the rooms opening
// off it, and the best of them — the ones with the deep-set round windows —
// on the left-hand side going in, looking out over the garden.

import { T } from '../tileTypes.js';

const WIDTH = 30,
  HEIGHT = 20;

// Floor extents, inclusive. Walls are grown around them afterwards, so a room
// can never be left open to the earth by an off-by-one.
const ROOMS = [
  { x0: 5, y0: 13, x1: 24, y1: 14 }, // the hall, running east and west
  { x0: 5, y0: 7, x1: 9, y1: 11 }, // the study, windows over the garden
  { x0: 12, y0: 6, x1: 18, y1: 11 }, // the parlour, with the hearth
  { x0: 21, y0: 8, x1: 24, y1: 11 }, // the bedroom
  { x0: 5, y0: 16, x1: 9, y1: 18 }, // the kitchen and pantry
  { x0: 14, y0: 15, x1: 15, y1: 19 }, // the entrance passage
];

// Doorways cut through the walls between the rooms and the hall.
const DOORWAYS = [
  [7, 12],
  [15, 12],
  [22, 12],
  [7, 15],
];

function buildMap() {
  const map = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(T.VOID));
  for (const { x0, y0, x1, y1 } of ROOMS)
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) map[y][x] = T.FLOOR;
  for (const [x, y] of DOORWAYS) map[y][x] = T.FLOOR;

  // Every cell of earth touching a floor becomes panelling. Diagonals are
  // included so no corner of the Hill is left showing through.
  const earth = [];
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      if (map[y][x] !== T.VOID) continue;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (map[y + dy]?.[x + dx] === T.FLOOR) earth.push([x, y]);
        }
    }
  for (const [x, y] of earth) map[y][x] = T.PANEL;

  // The deep-set round windows: west and north, over the garden.
  for (const [x, y] of [
    [4, 8],
    [4, 10],
    [13, 5],
    [17, 5],
    [22, 7],
  ])
    map[y][x] = T.WINDOW_I;

  // The hearth in the parlour, and the fire irons beside it.
  for (const x of [15, 16]) map[6][x] = T.FIREPLACE;

  // The study: Bilbo's desk under the window, books along the back wall.
  map[9][7] = T.TABLE;
  for (const x of [5, 6, 8, 9]) map[6][x] = T.SHELF;
  map[8][4] = T.WINDOW_I;
  map[12][5] = T.MAP_WALL;

  // The parlour: the carpet, a chair-side table, the bookcase by the window.
  for (let y = 8; y <= 10; y++) for (let x = 13; x <= 15; x++) map[y][x] = T.RUG;
  map[9][18] = T.TABLE;
  map[5][12] = T.SHELF;
  map[5][18] = T.SHELF;

  // The bedroom, and the chest of mathoms at the foot of the bed.
  map[9][24] = T.BED;
  map[10][21] = T.CHEST;
  map[7][23] = T.MAP_WALL;

  // The kitchen: the pantry shelves and the long counter.
  for (let x = 5; x <= 9; x++) map[15][x] = T.SHELF;
  map[15][7] = T.FLOOR; // the doorway back into the hall
  for (const x of [5, 6, 7]) map[18][x] = T.COUNTER;

  // Pegs for hats and coats, the length of the hall.
  for (const x of [9, 11, 18, 20, 23]) map[15][x] = T.PEGS;
  map[12][17] = T.PEGS;

  return map;
}

/** @type {import('../types.js').Zone} */
export const bagend = {
  key: 'bagend',
  label: 'Bag End',
  music: 'interior',
  map: buildMap(),
  spawns: {
    default: { x: 14, y: 17, dir: 'up' }, // just inside the round door
  },
  npcs: [],
  doors: [],
  signs: [
    { x: 7, y: 9, dialogue: 'examine_desk' },
    { x: 6, y: 6, dialogue: 'examine_books' },
    { x: 15, y: 6, dialogue: 'examine_fireplace' },
    { x: 12, y: 5, dialogue: 'examine_bookcase' },
    { x: 5, y: 12, dialogue: 'examine_map' },
    { x: 23, y: 7, dialogue: 'examine_map' },
    { x: 21, y: 10, dialogue: 'examine_chest' },
    { x: 9, y: 15, dialogue: 'examine_sticks' },
  ],
  interactions: [
    { x: 5, y: 9, label: 'The round window', dialogue: 'examine_window_bagend' },
    { x: 16, y: 7, label: 'The envelope', dialogue: 'examine_ringspot' },
    { x: 6, y: 17, label: 'The pantry', dialogue: 'examine_pantry' },
    { x: 23, y: 10, label: 'The bed', dialogue: 'examine_bed_bagend' },
    { x: 19, y: 14, label: 'The hall', dialogue: 'examine_hall' },
  ],
  pickups: [{ id: 'bagend_mathom_1', x: 22, y: 11, item: 'mathom' }],
  exits: [
    { x: 14, y: 19, zone: 'shire', entry: 'fromBagEnd' },
    { x: 15, y: 19, zone: 'shire', entry: 'fromBagEnd' },
  ],
};

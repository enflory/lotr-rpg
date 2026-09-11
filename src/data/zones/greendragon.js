// The Green Dragon Inn — Bywater's public house. 20×15.

import { T } from '../tileTypes.js';

const V = T.VOID, W = T.WALL, F = T.FLOOR, A = T.TABLE, C = T.COUNTER;
const I = T.WINDOW_I, S = T.SHELF, P = T.FIREPLACE, B = T.SETTLE;

const MAP = [
  [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V], // 0
  [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V], // 1
  [V, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, V], // 2
  [V, W, I, W, S, S, W, P, P, W, S, S, W, I, W, W, S, W, W, V], // 3  ← back wall, with the inn fire
  [V, W, C, C, C, C, C, F, F, F, F, F, F, F, F, F, C, C, W, V], // 4  ← the bar, and the hearthside
  [V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V], // 5
  [V, W, B, F, A, F, F, F, B, F, F, A, F, F, F, A, F, B, W, V], // 6  ← settles down both walls
  [V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V], // 7
  [V, W, F, F, F, A, F, F, F, F, A, F, F, F, F, A, F, F, W, V], // 8
  [V, W, B, F, F, F, F, F, F, F, F, F, F, F, F, F, F, B, W, V], // 9
  [V, W, F, A, F, F, F, F, A, F, F, F, F, A, F, F, F, F, W, V], // 10
  [V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V], // 11
  [V, W, W, W, W, W, W, W, W, F, F, W, W, W, W, W, W, W, W, V], // 12 ← doorway
  [V, V, V, V, V, V, V, V, V, F, F, V, V, V, V, V, V, V, V, V], // 13
  [V, V, V, V, V, V, V, V, V, F, F, V, V, V, V, V, V, V, V, V], // 14
];

/** @type {import('../types.js').Zone} */
export const greendragon = {
  key: 'greendragon',
  label: 'The Green Dragon',
  music: 'interior',
  map: MAP,
  spawns: {
    default: { x: 9, y: 11, dir: 'up' },
  },
  npcs: [
    // Both are over at the Party Field during the prologue
    { key: 'rosie', x: 9, y: 4, dir: 'down', when: (f) => f.prologueDone },  // serving at the bar's end
    { key: 'ted',   x: 7, y: 6, dir: 'right', when: (f) => f.prologueDone }, // holding forth from the settle
    { key: 'noakes',  x: 12, y: 8, dir: 'left',  when: (f) => f.prologueDone },
    { key: 'twofoot', x: 14, y: 8, dir: 'right', when: (f) => f.prologueDone },
  ],
  doors: [],
  signs: [
    { x: 4, y: 4, dialogue: 'examine_casks' },
    { x: 16, y: 3, dialogue: 'examine_shelf_gd' },
    { x: 7, y: 3, dialogue: 'examine_hearth_gd' },
  ],
  interactions: [
    { x: 8, y: 5, label: 'The settle', dialogue: 'examine_settle' },
    { x: 4, y: 5, label: 'The bar', dialogue: 'examine_bar_gd' },
  ],
  exits: [
    { x: 9, y: 14, zone: 'shire', entry: 'fromGreenDragon' },
    { x: 10, y: 14, zone: 'shire', entry: 'fromGreenDragon' },
  ],
};

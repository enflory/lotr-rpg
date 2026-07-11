// The Green Dragon Inn — Bywater's public house. 20×15.

import { T } from '../tileTypes.js';

const V = T.VOID, W = T.WALL, F = T.FLOOR, A = T.TABLE, C = T.COUNTER;
const I = T.WINDOW_I, S = T.SHELF;

const MAP = [
  [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V], // 0
  [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V], // 1
  [V, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, V], // 2
  [V, W, I, W, S, S, W, I, W, W, S, S, W, I, W, W, S, W, W, V], // 3  ← back wall
  [V, W, C, C, C, C, C, C, C, F, F, F, F, F, F, F, F, F, W, V], // 4  ← the bar
  [V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V], // 5
  [V, W, F, A, F, F, F, A, F, F, F, F, A, F, F, F, A, F, W, V], // 6
  [V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V], // 7
  [V, W, F, F, F, A, F, F, F, F, A, F, F, F, F, A, F, F, W, V], // 8
  [V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V], // 9
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
    { key: 'rosie', x: 9, y: 4, dir: 'down' },  // serving at the bar's end
    { key: 'ted',   x: 8, y: 6, dir: 'left' },  // holding forth at a table
  ],
  doors: [],
  signs: [],
  exits: [
    { x: 9, y: 14, zone: 'shire', entry: 'fromGreenDragon' },
    { x: 10, y: 14, zone: 'shire', entry: 'fromGreenDragon' },
  ],
};

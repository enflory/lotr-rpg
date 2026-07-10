// Bag End interior — Frodo's smial under The Hill. 20×15 fills the
// 320×240 viewport exactly; thick earthen walls keep the room cozy.

import { T } from '../tileTypes.js';

const V = T.VOID, W = T.WALL, F = T.FLOOR, R = T.RUG, A = T.TABLE;
const P = T.FIREPLACE, S = T.SHELF, B = T.BED, I = T.WINDOW_I;

const MAP = [
  [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V], // 0
  [V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V, V], // 1
  [V, V, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, V, V], // 2
  [V, V, W, S, S, I, W, P, P, W, I, W, S, S, W, W, W, W, V, V], // 3  ← back wall
  [V, V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, B, W, V, V], // 4
  [V, V, W, F, R, R, R, F, F, F, F, F, F, F, F, F, F, W, V, V], // 5
  [V, V, W, F, R, R, R, F, F, F, F, F, F, A, F, F, F, W, V, V], // 6
  [V, V, W, F, R, R, R, F, F, F, F, F, F, F, F, F, F, W, V, V], // 7
  [V, V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V, V], // 8
  [V, V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V, V], // 9
  [V, V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V, V], // 10
  [V, V, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, V, V], // 11
  [V, V, W, W, W, W, W, W, W, F, F, W, W, W, W, W, W, W, V, V], // 12 ← doorway
  [V, V, V, V, V, V, V, V, V, F, F, V, V, V, V, V, V, V, V, V], // 13
  [V, V, V, V, V, V, V, V, V, F, F, V, V, V, V, V, V, V, V, V], // 14
];

export const bagend = {
  key: 'bagend',
  label: 'Bag End',
  music: 'interior',
  map: MAP,
  spawns: {
    default: { x: 9, y: 11, dir: 'up' }, // just inside the door
  },
  npcs: [],
  doors: [],
  signs: [],
  exits: [
    { x: 9, y: 14, zone: 'shire', entry: 'fromBagEnd' },
    { x: 10, y: 14, zone: 'shire', entry: 'fromBagEnd' },
  ],
};

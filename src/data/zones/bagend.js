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

/** @type {import('../types.js').Zone} */
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
  signs: [
    { x: 13, y: 6, dialogue: 'examine_desk' },
    { x: 3, y: 3, dialogue: 'examine_books' },
    { x: 7, y: 3, dialogue: 'examine_fireplace' },
    { x: 12, y: 3, dialogue: 'examine_bookcase' },
  ],
  // The smial is a home, not a room: the things in it are worth reading.
  interactions: [
    { x: 5, y: 4, label: 'The round window', dialogue: 'examine_window_bagend' },
    { x: 8, y: 4, label: 'The envelope', dialogue: 'examine_ringspot' },
    { x: 11, y: 4, label: 'The map of Wilderland', dialogue: 'examine_map' },
    { x: 14, y: 4, label: 'The pantry', dialogue: 'examine_pantry' },
    { x: 14, y: 9, label: 'The mathom chest', dialogue: 'examine_chest' },
    { x: 7, y: 11, label: 'The walking sticks', dialogue: 'examine_sticks' },
  ],
  pickups: [{ id: 'bagend_mathom_1', x: 15, y: 10, item: 'mathom' }],
  exits: [
    { x: 9, y: 14, zone: 'shire', entry: 'fromBagEnd' },
    { x: 10, y: 14, zone: 'shire', entry: 'fromBagEnd' },
  ],
};

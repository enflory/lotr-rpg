// The Shire — Hobbiton: Bag End, Bagshot Row, the Green Dragon, The Water.

import { T } from '../tileTypes.js';

// Shorthand
const G = T.GRASS, P = T.PATH, W = T.WATER, R = T.TREE;
const H = T.HILL, h = T.HILLTOP, D = T.DOOR, B = T.BRIDGE, F = T.FENCE;
const S = T.STONE, f = T.FLOWERS, d = T.GARDEN, O = T.ROOF;
const L = T.DOOR_L, J = T.DOOR_R, K = T.ROOF_L, N = T.ROOF_R, X = T.SIGN;

// 40 wide × 40 tall
const MAP = [
//  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39

  // ── The Hill (Bag End at the top) ──────────────────
  [R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R], // 0
  [R, R, G, G, R, G, f, G, R, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, R, G, f, G, R, G, G, R, R], // 1
  [R, G, G, f, G, G, G, R, H, H, K, O, O, O, N, h, h, h, K, O, O, O, N, h, h, K, O, O, O, N, H, H, R, G, G, G, G, G, G, R], // 2  ← roof mounds
  [R, G, G, G, G, G, R, H, H, h, K, O, O, O, N, h, d, h, K, O, O, O, N, h, d, K, O, O, O, N, h, H, H, G, G, G, G, G, G, R], // 3
  [R, G, G, G, G, R, H, H, h, h, h, L, D, J, h, h, d, h, h, L, D, J, h, h, d, h, L, D, J, h, h, h, H, H, G, G, G, f, G, R], // 4  ← 3-wide doors
  [R, G, G, G, R, H, H, h, h, h, h, P, P, P, h, h, h, h, h, P, P, P, X, h, h, h, P, P, P, h, h, h, h, H, G, G, G, G, G, R], // 5  ← Bag End sign
  [R, G, f, G, R, H, h, h, h, h, P, P, h, P, P, h, h, h, P, P, h, P, P, h, h, P, P, h, P, P, h, h, h, H, R, G, G, G, G, R], // 6
  [R, G, G, G, G, H, H, h, h, P, P, h, h, h, P, P, P, P, P, h, h, h, P, P, P, P, h, h, h, P, P, h, H, H, G, G, G, G, G, R], // 7
  [R, G, G, G, G, G, H, H, P, P, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, P, H, H, G, G, G, G, G, G, R], // 8
  [R, G, G, G, G, G, G, H, H, P, P, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, P, H, H, G, G, G, G, f, G, G, R], // 9
  [R, G, G, R, G, G, G, G, H, H, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, H, G, G, G, G, G, G, G, G, R], // 10
  [R, G, G, G, G, G, G, G, G, H, P, P, H, H, H, H, H, H, H, P, P, H, H, H, H, H, H, H, H, H, H, G, G, G, G, G, R, G, G, R], // 11

  // ── Bagshot Row (row of hobbit holes along the hill base) ──
  [R, G, G, G, G, f, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 12
  [R, G, G, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, G, G, G, G, G, G, G, G, G, R], // 13
  [R, G, G, F, d, K, O, O, N, F, P, P, F, d, K, O, O, N, d, F, P, P, F, d, K, O, O, N, d, F, G, G, G, G, G, G, f, G, G, R], // 14
  [R, G, G, F, d, L, D, D, J, F, P, P, F, d, L, D, D, J, d, F, P, P, F, d, L, D, D, J, d, F, G, G, G, G, G, G, G, G, G, R], // 15
  [R, G, G, F, d, h, h, h, h, F, P, P, F, d, h, h, h, h, d, F, P, P, F, d, h, h, h, h, d, F, G, G, G, G, G, G, G, G, G, R], // 16
  [R, G, G, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, G, G, G, G, G, G, G, G, G, R], // 17

  // ── Hobbiton village center / Bywater Road ────────
  [R, G, G, f, G, G, G, G, G, P, P, P, P, G, G, G, G, G, G, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 18
  [R, G, G, G, G, G, P, P, P, P, G, G, P, P, P, P, P, P, P, P, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P], // 19  ← East Road exit →
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 20

  // ── The Green Dragon Inn area ──────────────────────
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, X, P, P, G, G, G, S, S, S, S, S, S, G, G, G, G, f, G, G, G, G, R], // 21  ← Bywater sign
  [R, G, G, G, R, G, G, G, G, P, P, G, G, G, f, G, G, G, G, P, P, G, G, S, K, O, O, O, N, S, G, G, G, G, G, G, G, G, G, R], // 22
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, S, L, D, D, D, J, S, G, G, G, G, G, G, G, G, G, R], // 23  ← Green Dragon entrance
  [R, G, f, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, X, S, S, S, S, S, S, G, G, G, f, G, G, G, G, G, R], // 24  ← inn sign

  // ── Party Field ────────────────────────────────────
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 25
  [R, G, G, G, G, G, G, G, G, P, P, G, G, f, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 26
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, R, R, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, f, G, G, R], // 27
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, R, R, R, R, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 28
  [R, G, G, G, G, f, G, G, G, P, P, G, G, R, R, R, R, R, R, P, P, G, G, G, G, G, G, f, G, G, G, G, G, G, G, G, G, G, G, R], // 29
  [R, G, G, G, G, G, G, G, G, P, P, G, G, R, R, R, R, R, R, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 30
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, R, R, R, R, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, f, G, G, G, G, G, R], // 31
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, R, R, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 32
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R, G, G, G, R], // 33

  // ── Path to the bridge ─────────────────────────────
  [R, G, G, G, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 34
  [R, G, G, f, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, f, G, R], // 35

  // ── The Water ──────────────────────────────────────
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, B, B, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W], // 36
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, B, B, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W], // 37

  // ── South bank ─────────────────────────────────────
  [R, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 38
  [R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R], // 39
];

/** @type {import('../types.js').Zone} */
export const shire = {
  key: 'shire',
  label: 'The Shire',
  music: 'shire',
  map: MAP,
  spawns: {
    default:         { x: 20, y: 7, dir: 'down' },
    fromBagEnd:      { x: 20, y: 5, dir: 'down' },
    fromGreenDragon: { x: 26, y: 24, dir: 'down' },
    fromWoodyEnd:    { x: 38, y: 19, dir: 'left' },
  },
  npcs: [
    { key: 'gandalf', x: 19, y: 8, dir: 'down' },
    { key: 'sam',     x: 16, y: 5, dir: 'down', when: (f) => !f.samJoined },
    { key: 'gaffer',  x: 10, y: 15, dir: 'right' },
    { key: 'lobelia', x: 10, y: 19, dir: 'right' },
  ],
  doors: [
    { x: 20, y: 4, zone: 'bagend', entry: 'default' },       // Bag End
    { x: 25, y: 23, zone: 'greendragon', entry: 'default' },  // Green Dragon
    { x: 26, y: 23, zone: 'greendragon', entry: 'default' },
    { x: 27, y: 23, zone: 'greendragon', entry: 'default' },
  ],
  signs: [
    { x: 22, y: 5, dialogue: 'sign_bagend' },
    { x: 18, y: 21, dialogue: 'sign_bywater' },
    { x: 23, y: 24, dialogue: 'sign_greendragon' },
  ],
  exits: [
    {
      x: 39, y: 19, zone: 'woodyend', entry: 'west',
      requires: 'samJoined',
      denied: "I shouldn't set out\nwithout Sam.",
    },
  ],
};

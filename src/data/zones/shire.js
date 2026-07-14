// The Shire — Hobbiton: Bag End, Bagshot Row, the Green Dragon, The Water,
// and the Party Field (with the Party Tree) west of the village.

import { T } from '../tileTypes.js';
import { partyEventUpdate, partyZoneCreate } from '../../events/partyEvent.js';
import { extendMap, stamp } from './mapUtils.js';

// Shorthand
const G = T.GRASS, P = T.PATH, W = T.WATER, R = T.TREE;
const H = T.HILL, h = T.HILLTOP, D = T.DOOR, B = T.BRIDGE, F = T.FENCE;
const S = T.STONE, f = T.FLOWERS, d = T.GARDEN, O = T.ROOF;
const L = T.DOOR_L, J = T.DOOR_R, K = T.ROOF_L, N = T.ROOF_R, X = T.SIGN;
const A = T.MOUND_L, Z = T.MOUND_R, b = T.BASE_L, e = T.BASE_R, w = T.WINDOW_F;
const Q = T.PARTY_TL, U = T.PARTY_TR, V = T.PARTY_BL, Y = T.PARTY_BR;
const q = T.PARTY_NL, u = T.PARTY_NR;
const E = T.PARTY_TABLE, M = T.LANTERN;

// 40 wide × 40 tall
const BASE = [
//  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39

  // ── The Hill (Bag End at the top) ──────────────────
  [R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R], // 0
  [R, R, G, G, R, G, f, G, R, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, R, G, f, G, R, G, G, R, R], // 1
  [R, G, G, f, G, G, G, R, H, H, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, H, H, R, G, G, G, G, G, G, R], // 2  ← grassy crown above the smials
  [R, G, G, G, G, G, R, H, H, h, A, O, O, O, Z, h, h, h, A, O, O, O, Z, h, h, A, O, O, O, Z, h, H, H, G, G, G, G, G, G, R], // 3
  [R, G, G, G, G, R, H, H, h, h, b, w, D, w, e, h, d, h, b, w, D, w, e, h, d, b, w, D, w, e, h, h, H, H, G, G, G, f, G, R], // 4  ← smial domes: big window each side of the door
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
  [R, G, G, F, d, A, O, O, Z, F, P, P, F, d, A, O, O, O, Z, F, P, P, F, d, A, O, O, O, Z, F, G, G, G, G, G, G, f, G, G, R], // 14
  [R, G, G, F, d, b, D, w, e, F, P, P, F, d, b, L, D, J, e, F, P, P, F, d, b, L, D, J, e, F, G, G, G, G, G, G, G, G, G, R], // 15  ← one door per hole
  [R, G, G, F, d, h, P, h, h, F, P, P, F, d, h, h, P, h, d, F, P, P, F, d, h, h, P, h, d, F, G, G, G, G, G, G, G, G, G, R], // 16
  [R, G, G, F, F, F, P, F, F, F, P, P, F, F, F, F, P, F, F, F, P, P, F, F, F, F, P, F, F, F, G, G, G, G, G, G, G, G, G, R], // 17  ← fence gaps at the doors

  // ── Hobbiton village center / Bywater Road ────────
  [R, G, G, f, G, G, P, G, G, P, P, P, P, G, G, G, P, G, G, P, P, P, P, G, G, G, P, G, G, G, G, G, G, G, G, G, G, G, G, R], // 18
  [R, G, G, G, G, G, P, P, P, P, G, G, P, P, P, P, P, P, P, P, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P], // 19  ← East Road exit →
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P], // 20  ← wide East Road mouth

  // ── Party Field (west) · Green Dragon Inn (east) ───
  [R, M, G, f, q, u, G, G, M, P, P, G, G, G, G, G, G, G, X, P, P, G, G, G, S, S, S, S, S, S, G, G, G, G, f, G, G, G, G, R], // 21  ← lanterns · Party Tree crown · Bywater sign
  [R, G, G, G, Q, U, G, G, G, P, P, G, G, G, f, G, G, G, G, P, P, G, G, S, K, O, O, O, N, S, G, G, G, G, G, G, G, G, G, R], // 22  ← the Party Tree
  [R, G, G, G, V, Y, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, S, w, L, D, J, w, S, G, G, G, G, G, G, G, G, G, R], // 23  ← Green Dragon entrance
  [R, G, f, G, G, G, f, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, X, S, S, S, S, S, S, G, G, G, f, G, G, G, G, G, R], // 24  ← inn sign

  // ── Party Field tents · the grove between the roads ─
  [R, G, E, G, G, G, G, E, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 25
  [R, G, G, G, G, G, G, G, G, P, P, G, G, f, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 26
  [R, G, P, P, P, P, P, P, P, P, P, G, G, G, G, R, R, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, f, G, G, R], // 27  ← field spur off the road
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, R, R, R, R, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 28
  [R, G, G, G, G, f, G, G, G, P, P, G, G, R, R, R, R, R, R, P, P, G, G, G, G, G, G, f, G, G, G, G, G, G, G, G, G, G, G, R], // 29
  [R, G, E, G, G, G, G, G, G, P, P, G, G, R, R, R, R, R, R, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 30
  [R, G, G, G, G, f, G, G, G, P, P, G, G, G, R, R, R, R, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, f, G, G, G, G, G, R], // 31
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, R, R, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 32
  [R, G, M, G, G, G, G, M, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R, G, G, G, R], // 33

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

function buildMap() {
  // 40×40 hand-authored core → 48×44
  const map = extendMap(BASE, { east: 8, south: 4, fill: G });

  // Open the old east and south tree borders (now interior) —
  // x/y bounds include 39 so the old corner tree goes too
  for (let y = 1; y < 39; y++) if (map[y][39] === R) map[y][39] = G;
  for (let x = 1; x < 40; x++) if (map[39][x] === R) map[39][x] = G;

  // The Water flows on east; the East Road runs to the new edge
  for (const y of [36, 37]) for (let x = 40; x < 48; x++) map[y][x] = W;
  for (const y of [19, 20]) for (let x = 39; x < 48; x++) map[y][x] = P;

  // New borders (gap where the road leaves; the river hits the edge solid)
  for (let x = 0; x < 48; x++) {
    map[0][x] = R;
    map[43][x] = R;
  }
  for (let y = 0; y < 44; y++) {
    if (!(y === 19 || y === 20 || y === 36 || y === 37)) map[y][47] = R;
  }

  // ── Sandyman's Mill on the south bank ─────────────
  // Wheel in the river beside the building; lane west from the bridge
  map[37][2] = T.WHEEL;
  stamp(map, 3, 38, [
    [S, K, O, N, S],
    [S, L, D, J, S],
  ]);
  map[39][8] = X; // mill sign
  for (let x = 4; x <= 17; x++) map[40][x] = P; // mill lane
  map[39][18] = P; // joins the bridge path at (18,38)
  map[40][18] = P;

  // ── The Ivy Bush, on the Bywater road ─────────────
  stamp(map, 40, 22, [
    [S, K, O, O, O, N, S],
    [S, w, L, D, J, w, S],
  ]);
  map[24][40] = X; // inn sign
  map[24][46] = M; // lantern by the benches
  for (const x of [42, 43]) map[24][x] = P; // doorstep

  // ── The specially large pavilion in the Party Field ──
  // 2×2 marquee south of the Party Tree (replaces the lone cone tent)
  stamp(map, 2, 29, [
    [T.PAV_TL, T.PAV_TR],
    [T.PAV_BL, T.PAV_BR],
  ]);

  // ── Orchard rows in the south-east ────────────────
  for (const y of [28, 30, 32]) {
    for (let x = 33; x <= 45; x += 3) map[y][x] = T.TREE2;
  }
  for (const [x, y] of [[35, 29], [40, 31], [44, 29]]) map[y][x] = f;

  return map;
}

/** @type {import('../types.js').Zone} */
export const shire = {
  key: 'shire',
  label: 'The Shire',
  music: 'shire',
  map: buildMap(),
  spawns: {
    default:         { x: 20, y: 7, dir: 'down' },
    fromBagEnd:      { x: 20, y: 5, dir: 'down' },
    fromGreenDragon: { x: 26, y: 24, dir: 'down' },
    fromWoodyEnd:    { x: 46, y: 19, dir: 'left' },
    party:           { x: 6, y: 27, dir: 'left' },
  },
  npcs: [
    // The Long-expected Party (prologue, before the time skip)
    { key: 'bilbo',   x: 4, y: 25, dir: 'down',  when: (f) => !f.prologueDone },
    { key: 'gandalf', x: 2, y: 28, dir: 'right', when: (f) => !f.prologueDone },
    { key: 'gaffer',  x: 2, y: 26, dir: 'right', when: (f) => !f.prologueDone },
    { key: 'rosie',   x: 7, y: 26, dir: 'left',  when: (f) => !f.prologueDone },
    { key: 'ted',     x: 7, y: 29, dir: 'left',  when: (f) => !f.prologueDone },
    { key: 'noakes',  x: 41, y: 24, dir: 'right', when: (f) => !f.prologueDone },
    { key: 'twofoot', x: 45, y: 24, dir: 'left',  when: (f) => !f.prologueDone },
    // Seventeen years later
    { key: 'gandalf', x: 19, y: 8, dir: 'down',  when: (f) => f.prologueDone },
    { key: 'sam',     x: 16, y: 5, dir: 'down',  when: (f) => f.prologueDone && !f.samJoined },
    { key: 'gaffer',  x: 10, y: 15, dir: 'right', when: (f) => f.prologueDone },
    { key: 'lobelia', x: 10, y: 19, dir: 'right', when: (f) => f.prologueDone },
    { key: 'sandyman', x: 6, y: 41, dir: 'up',   when: (f) => f.prologueDone },
  ],
  doors: [
    { x: 20, y: 4, zone: 'bagend', entry: 'default' },       // Bag End
    { x: 26, y: 23, zone: 'greendragon', entry: 'default' },  // Green Dragon
  ],
  signs: [
    { x: 22, y: 5, dialogue: 'sign_bagend' },
    { x: 18, y: 21, dialogue: 'sign_bywater' },
    { x: 23, y: 24, dialogue: 'sign_greendragon' },
    { x: 8, y: 39, dialogue: 'sign_mill' },
    { x: 40, y: 24, dialogue: 'sign_ivybush' },
  ],
  pickups: [
    { id: 'shire_mathom_1', x: 5, y: 30, item: 'mathom' },
    { id: 'shire_mathom_2', x: 36, y: 31, item: 'mathom' },
    { id: 'shire_mathom_3', x: 2, y: 16, item: 'mathom' },
    { id: 'shire_mathom_4', x: 10, y: 41, item: 'mathom' },
    { id: 'shire_mathom_5', x: 45, y: 21, item: 'mathom' },
    {
      id: 'party_crate_1',
      x: 2,
      y: 31,
      item: 'firework_crate',
      when: (f) => f.cratesAsked && !f.prologueDone,
    },
    {
      id: 'party_crate_2',
      x: 6,
      y: 26,
      item: 'firework_crate',
      when: (f) => f.cratesAsked && !f.prologueDone,
    },
    {
      id: 'party_crate_3',
      x: 3,
      y: 34,
      item: 'firework_crate',
      when: (f) => f.cratesAsked && !f.prologueDone,
    },
  ],
  exits: [
    {
      x: 47, y: 19, zone: 'woodyend', entry: 'west',
      requires: 'samJoined',
      denied: "I shouldn't set out\nwithout Sam.",
    },
    {
      x: 47, y: 20, zone: 'woodyend', entry: 'west',
      requires: 'samJoined',
      denied: "I shouldn't set out\nwithout Sam.",
    },
  ],
  onCreate: partyZoneCreate,
  onUpdate: partyEventUpdate,
};

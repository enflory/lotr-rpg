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
  // Stagger the rows so the orchard reads as planted, not printed.
  for (const [y, off] of [[28, 0], [30, 1], [32, 2]])
    for (let x = 33 + off; x <= 45; x += 3) map[y][x] = T.TREE2;

  dressTheHill(map);
  dressTheFields(map);
  dressTheWater(map);
  dressTheVillage(map);
  dressThePartyField(map);

  return map;
}


/* ── The Hill ──────────────────────────────────────────────────────────────
   The crown used to be a web of lanes with three identical smials strung
   along it. It is now one lane climbing to Bag End, which is the widest
   facade on the Hill, with Sam's garden on either side of the door and two
   old trees standing over it.                                             */
function dressTheHill(map) {
  // Clear the old path web off the crown, leaving the facades alone.
  for (let y = 5; y <= 11; y++)
    for (let x = 8; x <= 31; x++) if (map[y][x] === P) map[y][x] = h;

  // Bag End: seven tiles of facade where its neighbours have five.
  stamp(map, 17, 3, [
    [A, O, O, O, O, O, Z],
    [b, w, w, D, w, w, e],
  ]);

  // One lane down from the door to the Hill Road, and one along the crown
  // linking the three doors to it.
  for (let y = 5; y <= 11; y++) { map[y][19] = P; map[y][20] = P; }
  for (const y of [7, 8]) for (let x = 12; x <= 28; x++) if (map[y][x] === h) map[y][x] = P;
  for (const doorX of [12, 28]) for (let y = 5; y <= 8; y++) map[y][doorX] = P;

  // Sam's garden, either side of the round green door, with the bench the
  // Gaffer sits on and the skeps at the end of the beds. The sign stands
  // where the lane turns up to the door.
  for (const y of [5, 6]) for (const x of [15, 16, 23, 24]) map[y][x] = d;
  map[6][23] = T.SKEP;
  map[5][18] = T.BENCH;
  map[5][22] = X;

  // Two old trees on the very top of the Hill, over Bag End. They stand
  // wide of the gaps the crown is reached through, so the top of the Hill
  // stays walkable from either side of the smials.
  map[2][13] = R;
  map[2][27] = R;
  map[2][17] = T.GRASS2;
  map[2][23] = T.GRASS2;
}

/* ── The fields above Bywater ──────────────────────────────────────────────
   Everything east of the village was one wide lawn. Hedges, a farm track and
   four worked fields give it a shape, and something to walk across for.    */
function dressTheFields(map) {
  const HG = T.HEDGEROW;
  // The hedge along the top of the fields, and the farm track through it.
  for (let x = 31; x <= 46; x++) map[12][x] = HG;
  for (let y = 12; y <= 18; y++) { map[y][37] = P; map[y][38] = P; }
  for (let x = 37; x <= 46; x++) if (map[11][x] === G) map[11][x] = P;
  // Two more hedges divide the upper ground into a cornfield and a paddock.
  for (let y = 2; y <= 11; y++) if (map[y][42] === G) map[y][42] = HG;
  map[6][42] = G; // a gap the sheep were driven through

  // Standing corn in rows over green stubble, with the width the reaper left
  // down the middle so the field can be walked through rather than round.
  for (const y of [3, 5, 7, 9]) {
    for (let x = 34; x <= 40; x++) map[y][x] = T.CORN;
    map[y][37] = y === 5 ? T.HAY : G;
  }
  for (const [x, y] of [[34, 4], [39, 6], [36, 10], [40, 8]]) map[y][x] = T.STOOK;
  map[11][36] = T.STOOK;

  // The paddock: a duck pond in the corner and the bee skeps along the hedge.
  for (const [x, y] of [[44, 4], [45, 4], [44, 5], [45, 5]]) map[y][x] = W;
  for (const [x, y] of [[43, 4], [43, 5], [46, 3], [44, 3], [45, 6], [43, 6]])
    map[y][x] = T.REEDS;
  for (const y of [8, 9, 10]) map[y][44] = T.SKEP;
  map[7][45] = f;

  // The hayfield below the hedge: swathes cut through the grass, stooks stood
  // up to dry between them, and the waggon they will be pitched onto.
  for (const y of [13, 15, 17]) for (let x = 31; x <= 36; x++) map[y][x] = T.HAY;
  for (const [x, y] of [[32, 14], [35, 14], [33, 16], [36, 16], [31, 16]]) map[y][x] = T.STOOK;
  map[14][34] = T.WAGGON;
  for (const y of [14, 16, 18]) for (let x = 39; x <= 46; x++) if (map[y][x] === G) map[y][x] = T.HAY;
  for (const [x, y] of [[40, 15], [43, 15], [45, 13], [41, 17], [46, 17]]) map[y][x] = T.STOOK;

  // A waymark where the East Road leaves the village.
  map[18][44] = T.MILESTONE;
  map[21][31] = T.BENCH;
}

/* ── The Water ─────────────────────────────────────────────────────────────
   The river widens below the village into the Bywater Pool, with rushes
   along both margins and a landing stage for the mill's flat-boat.        */
function dressTheWater(map) {
  for (let x = 22; x <= 34; x++) {
    map[35][x] = W;
    map[38][x] = W;
    map[34][x] = T.REEDS;
    map[39][x] = T.REEDS;
  }
  for (const x of [21, 35]) for (const y of [34, 35, 38, 39]) map[y][x] = T.REEDS;
  // The lane along the south bank has to get past the widened pool.
  for (let x = 20; x <= 36; x++) map[40][x] = P;
  map[39][19] = P;
  map[40][19] = P;
  // The landing, and the rushes the punt is kept in.
  map[35][24] = T.DOCK;
  map[34][24] = P;
  map[34][23] = P;
  for (let y = 30; y <= 33; y++) { map[y][23] = P; map[y][24] = P; }
  map[34][25] = T.REEDS;

  // Cotton's farm on the south bank, and the lane up to its door.
  stamp(map, 28, 40, [
    [S, K, O, O, O, N, S],
    [S, w, L, D, J, w, S],
  ]);
  map[40][35] = X;
  for (const x of [30, 31, 32]) { map[42][x] = P; map[41][x] = P; }
  for (let y = 41; y <= 42; y++) for (let x = 36; x <= 41; x++) map[y][x] = d;
  for (const [x, y] of [[24, 42], [27, 41], [43, 41], [45, 42]]) map[y][x] = T.STOOK;
  for (const y of [41, 42]) for (let x = 43; x <= 46; x++) if (map[y][x] === G) map[y][x] = T.HAY;
  for (let x = 8; x <= 16; x++) map[42][x] = T.HEDGEROW;
  map[41][12] = T.SKEP;
  map[41][15] = T.SKEP;
}


/* ── The village ───────────────────────────────────────────────────────────
   The middle of Hobbiton was a lawn with an inn dropped on it. It now has an
   inn yard with a stable and a well, a hedged paddock between the roads, and
   the allotments along the south bank.                                     */
function dressTheVillage(map) {
  // The Green Dragon's yard: benches out front, lanterns, the well, and the
  // stable where the Bywater carters leave their ponies.
  map[23][31] = T.WELL;
  for (const [x, y] of [[22, 25], [30, 25]]) map[y][x] = T.BENCH;
  for (const [x, y] of [[22, 21], [30, 21]]) map[y][x] = M;
  stamp(map, 31, 25, [
    [K, O, N],
    [T.BARN, T.BARN, T.BARN],
  ]);
  for (let x = 24; x <= 29; x++) map[20][x] = d; // the inn's kitchen garden

  // A hedged paddock between the two roads, with the hay in it and the gate
  // on the lane side. The track down to the landing runs clear of it.
  for (let x = 26; x <= 34; x++) map[27][x] = T.HEDGEROW;
  for (let y = 27; y <= 33; y++) map[y][34] = T.HEDGEROW;
  map[27][30] = G; // the gate
  for (const y of [29, 31]) for (let x = 27; x <= 33; x++) map[y][x] = T.HAY;
  for (const [x, y] of [[28, 30], [32, 28], [30, 32], [33, 30]]) map[y][x] = T.STOOK;
  map[33][27] = T.SKEP;

  // Allotments along the south bank, between the mill lane and the river.
  for (const y of [38, 39]) for (let x = 9; x <= 16; x++) map[y][x] = d;
  map[38][8] = T.BENCH;
  map[39][17] = T.STOOK;
}

/* ── The Party Field ───────────────────────────────────────────────────────
   The field the whole prologue happens in was three tables and a tent. It is
   now laid out for a party of a hundred and forty-four: trestles in rows, a
   lantern-lit lane between them, and the fire-pit the fireworks go up from. */
function dressThePartyField(map) {
  const E = T.PARTY_TABLE, M = T.LANTERN, C = T.FEAST;
  // Trestles in rows with the cloth laid between them, well clear of the
  // pavilion in the south-west corner.
  for (const [x, y] of [[7, 22], [2, 25], [7, 25], [7, 28], [2, 32], [7, 31]]) map[y][x] = E;
  for (const [x, y] of [[6, 22], [3, 25], [6, 25], [6, 28], [3, 32], [6, 30]]) map[y][x] = C;
  for (const [x, y] of [[1, 24], [8, 24], [1, 28], [8, 28], [1, 32], [8, 32]]) map[y][x] = M;
  for (const [x, y] of [[3, 24], [4, 26], [6, 29]]) map[y][x] = T.BENCH;
  // The fire-pit the rockets go up from: a horseshoe of stones, open to the
  // north so a hobbit can walk right up to it.
  for (const [x, y] of [[4, 32], [6, 32], [4, 33], [5, 33], [6, 33]]) map[y][x] = S;
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
    { key: 'bilbo',   x: 3, y: 21, dir: 'down',  when: (f) => !f.prologueDone },
    { key: 'gandalf', x: 2, y: 27, dir: 'right', when: (f) => !f.prologueDone },
    { key: 'gaffer',  x: 1, y: 26, dir: 'right', when: (f) => !f.prologueDone },
    { key: 'rosie',   x: 7, y: 26, dir: 'left',  when: (f) => !f.prologueDone },
    { key: 'ted',     x: 7, y: 29, dir: 'left',  when: (f) => !f.prologueDone },
    { key: 'noakes',  x: 41, y: 24, dir: 'right', when: (f) => !f.prologueDone },
    { key: 'twofoot', x: 45, y: 24, dir: 'left',  when: (f) => !f.prologueDone },
    // Seventeen years later
    { key: 'gandalf', x: 19, y: 8, dir: 'down',  when: (f) => f.prologueDone },
    { key: 'sam',     x: 14, y: 5, dir: 'down',  when: (f) => f.prologueDone && !f.samJoined },
    { key: 'gaffer',  x: 10, y: 15, dir: 'right', when: (f) => f.prologueDone },
    { key: 'lobelia', x: 10, y: 19, dir: 'right', when: (f) => f.prologueDone },
    { key: 'sandyman', x: 6, y: 41, dir: 'up',   when: (f) => f.prologueDone },
    // Folco Boffin and Fredegar Bolger are at the party like everyone else,
    // and afterwards they are the two who help Frodo pack Bag End up.
    { key: 'folco',  x: 8, y: 26, dir: 'left',  when: (f) => !f.prologueDone },
    { key: 'fatty',  x: 1, y: 30, dir: 'up',    when: (f) => !f.prologueDone },
    { key: 'lotho',  x: 3, y: 26, dir: 'right', when: (f) => !f.prologueDone },
    { key: 'folco',  x: 26, y: 8, dir: 'left',  when: (f) => f.prologueDone },
    { key: 'fatty',  x: 21, y: 7, dir: 'up',    when: (f) => f.prologueDone },
    { key: 'lotho',  x: 11, y: 20, dir: 'up',   when: (f) => f.prologueDone },
    { key: 'rumble', x: 13, y: 16, dir: 'right', when: (f) => f.prologueDone },
    { key: 'cotton', x: 31, y: 41, dir: 'up',   when: (f) => f.prologueDone },
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
    { x: 35, y: 40, dialogue: 'examine_cotton_sign' },
  ],
  // Inspectable places. Each one wears a glimmer on the ground, so a hobbit
  // can see at a glance which patch of the Shire is worth stopping at.
  interactions: [
    // The Hill
    { x: 20, y: 2, label: 'Look out over Hobbiton', dialogue: 'examine_hilltop' },
    { x: 15, y: 3, label: 'The old trees', dialogue: 'examine_hill_trees' },
    { x: 16, y: 6, label: "Sam's garden", dialogue: 'examine_garden' },
    { x: 23, y: 5, label: 'The bee skeps', dialogue: 'examine_skep' },
    { x: 18, y: 6, label: 'The bench', dialogue: 'examine_bench' },
    { x: 10, y: 12, label: 'Bagshot Row', dialogue: 'examine_bagshotrow' },
    // The Party Field
    { x: 5, y: 24, label: 'The Party Tree', dialogue: 'examine_partytree' },
    { x: 2, y: 24, label: 'The trestles', dialogue: 'examine_trestle' },
    { x: 4, y: 29, label: 'The pavilion', dialogue: 'examine_pavilion' },
    { x: 5, y: 31, label: 'The fire-pit', dialogue: 'examine_firepit' },
    // The fields above Bywater
    { x: 37, y: 6, label: 'The corn', dialogue: 'examine_cornfield' },
    { x: 43, y: 3, label: 'The duck pond', dialogue: 'examine_ducks' },
    { x: 40, y: 11, label: 'The hedge', dialogue: 'examine_hedgerow' },
    { x: 33, y: 15, label: 'The stooks', dialogue: 'examine_stook' },
    { x: 44, y: 19, label: 'The waymark', dialogue: 'examine_milestone' },
    // The Water
    { x: 24, y: 33, label: 'The Bywater Pool', dialogue: 'examine_pool' },
    { x: 19, y: 35, label: 'The bridge', dialogue: 'examine_bridge' },
    { x: 2, y: 38, label: 'The mill wheel', dialogue: 'examine_millwheel' },
    { x: 12, y: 38, label: 'The allotments', dialogue: 'examine_allotment' },
    // The village
    { x: 30, y: 23, label: 'The inn yard', dialogue: 'examine_innyard' },
    { x: 30, y: 29, label: 'The paddock', dialogue: 'examine_paddock' },
  ],
  pickups: [
    { id: 'shire_mathom_1', x: 5, y: 30, item: 'mathom' },
    { id: 'shire_mathom_2', x: 36, y: 31, item: 'mathom' },
    { id: 'shire_mathom_3', x: 37, y: 4, item: 'mathom' }, // deep in the corn
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

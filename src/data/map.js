// Tile indices
export const T = {
  GRASS:    0,
  GRASS2:   1,
  PATH:     2,
  WATER:    3,
  TREE:     4,
  HILL:     5,
  HILLTOP:  6,
  DOOR:     7,
  BRIDGE:   8,
  FENCE:    9,
  BUSH:    10,
  STONE:   11,
  FLOWERS: 12,
  GARDEN:  13,
  ROOF:    14,
  DOOR_L:  15,   // left side of hobbit hole entrance
  DOOR_R:  16,   // right side of hobbit hole entrance
  ROOF_L:  17,   // left slope of hobbit hill mound
  ROOF_R:  18,   // right slope of hobbit hill mound
};

// Collision tile indices
export const COLLISION_TILES = [T.WATER, T.TREE, T.HILL, T.FENCE, T.BUSH, T.ROOF, T.DOOR_L, T.DOOR_R, T.ROOF_L, T.ROOF_R];

// Shorthand
const G = T.GRASS, g = T.GRASS2, P = T.PATH, W = T.WATER, R = T.TREE;
const H = T.HILL, h = T.HILLTOP, D = T.DOOR, B = T.BRIDGE, F = T.FENCE;
const U = T.BUSH, S = T.STONE, f = T.FLOWERS, d = T.GARDEN, O = T.ROOF;
const L = T.DOOR_L, J = T.DOOR_R, K = T.ROOF_L, N = T.ROOF_R;

// 40 wide × 40 tall — The Shire: Bag End → Hobbiton → Party Field → The Water
export const MAP_DATA = [
//  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39

  // ── The Hill (Bag End at the top) ──────────────────
  [R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R], // 0
  [R, R, G, G, R, G, f, G, R, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, R, G, f, G, R, G, G, R, R], // 1
  [R, G, G, f, G, G, G, R, H, H, K, O, O, O, N, h, h, h, K, O, O, O, N, h, h, K, O, O, O, N, H, H, R, G, G, G, G, G, G, R], // 2  ← roof mounds
  [R, G, G, G, G, G, R, H, H, h, K, O, O, O, N, h, d, h, K, O, O, O, N, h, d, K, O, O, O, N, h, H, H, G, G, G, G, G, G, R], // 3
  [R, G, G, G, G, R, H, H, h, h, h, L, D, J, h, h, d, h, h, L, D, J, h, h, d, h, L, D, J, h, h, h, H, H, G, G, G, f, G, R], // 4  ← 3-wide doors
  [R, G, G, G, R, H, H, h, h, h, h, P, P, P, h, h, h, h, h, P, P, P, h, h, h, h, P, P, P, h, h, h, h, H, G, G, G, G, G, R], // 5
  [R, G, f, G, R, H, h, h, h, h, P, P, h, P, P, h, h, h, P, P, h, P, P, h, h, P, P, h, P, P, h, h, h, H, R, G, G, G, G, R], // 6
  [R, G, G, G, G, H, H, h, h, P, P, h, h, h, P, P, P, P, P, h, h, h, P, P, P, P, h, h, h, P, P, h, H, H, G, G, G, G, G, R], // 7
  [R, G, G, G, G, G, H, H, P, P, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, P, H, H, G, G, G, G, G, G, R], // 8
  [R, G, G, G, G, G, G, H, H, P, P, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, h, P, H, H, G, G, G, G, f, G, G, R], // 9
  [R, G, G, R, G, G, G, G, H, H, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, H, G, G, G, G, G, G, G, G, R], // 10
  [R, G, G, G, G, G, G, G, G, H, P, P, H, H, H, H, H, H, H, P, P, H, H, H, H, H, H, H, H, H, H, G, G, G, G, G, R, G, G, R], // 11

  // ── Bagshot Row (row of hobbit holes along the hill base) ──
  [R, G, G, G, G, f, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 12
  [R, G, G, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, G, G, G, G, G, G, G, G, G, R], // 13  ← Bagshot Row fences
  [R, G, G, F, d, K, O, O, N, F, P, P, F, d, K, O, O, N, d, F, P, P, F, d, K, O, O, N, d, F, G, G, G, G, G, G, f, G, G, R], // 14  ← roof mounds
  [R, G, G, F, d, L, D, D, J, F, P, P, F, d, L, D, D, J, d, F, P, P, F, d, L, D, D, J, d, F, G, G, G, G, G, G, G, G, G, R], // 15  ← 3-wide doors (2 DOOR tiles for wider entrance)
  [R, G, G, F, d, h, h, h, h, F, P, P, F, d, h, h, h, h, d, F, P, P, F, d, h, h, h, h, d, F, G, G, G, G, G, G, G, G, G, R], // 16
  [R, G, G, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, P, P, F, F, F, F, F, F, F, F, G, G, G, G, G, G, G, G, G, R], // 17  ← fences

  // ── Hobbiton village center / Bywater Road ────────
  [R, G, G, f, G, G, G, G, G, P, P, P, P, G, G, G, G, G, G, P, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 18
  [R, G, G, G, G, G, P, P, P, P, G, G, P, P, P, P, P, P, P, P, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, R], // 19  ← Bywater Road (east-west)
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, R], // 20

  // ── The Green Dragon Inn area ──────────────────────
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, S, S, S, S, S, S, G, G, G, G, f, G, G, G, G, R], // 21
  [R, G, G, G, R, G, G, G, G, P, P, G, G, G, f, G, G, G, G, P, P, G, G, S, K, O, O, O, N, S, G, G, G, G, G, G, G, G, G, R], // 22  ← Green Dragon roof
  [R, G, G, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, S, L, D, D, D, J, S, G, G, G, G, G, G, G, G, G, R], // 23  ← Green Dragon entrance
  [R, G, f, G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G, P, P, G, G, G, S, S, S, S, S, S, G, G, G, f, G, G, G, G, G, R], // 24

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

export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 40;
export const TILE_SIZE = 16;

// NPC spawn positions (tile coordinates)
export const NPC_SPAWNS = {
  gandalf: { x: 19, y: 8, dir: 'down' },   // On the hill near Bag End
  sam:     { x: 16, y: 5, dir: 'down' },   // In Sam's garden area near Bag End
  gaffer:  { x: 10, y: 15, dir: 'right' }, // Near Bagshot Row
  lobelia: { x: 10, y: 19, dir: 'right' }, // On Bywater Road
  rosie:   { x: 26, y: 23, dir: 'down' },  // Near the Green Dragon Inn
};

// Frodo start position — on the path just below Bag End's door
export const PLAYER_START = { x: 20, y: 7 };

// Tile indices — order must match TILE_FNS in src/art/tiles.js

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
  // Interiors
  FLOOR:     19, // wood plank floor
  WALL:      20, // interior wall face
  RUG:       21,
  TABLE:     22,
  FIREPLACE: 23,
  SHELF:     24, // bookshelf
  COUNTER:   25, // inn bar counter
  BED:       26,
  WINDOW_I:  27, // interior wall with round window
  // Forest
  FERN:      28, // walkable undergrowth
  TREE2:     29, // autumn-tinged tree (Woody End)
  SIGN:      30, // wooden signpost (interactable via zone.signs)
  VOID:      31, // dark mass outside interior rooms
  DOCK:      32, // east-west pier, north half (water edge above)
  DOCK_S:    33, // east-west pier, south half (water edge + posts below)
};

export const COLLISION_TILES = [
  T.WATER, T.TREE, T.HILL, T.FENCE, T.BUSH, T.ROOF,
  T.DOOR_L, T.DOOR_R, T.ROOF_L, T.ROOF_R,
  T.WALL, T.TABLE, T.FIREPLACE, T.SHELF, T.COUNTER, T.BED, T.WINDOW_I,
  T.TREE2, T.SIGN, T.VOID,
];

export const TILE_SIZE = 16;

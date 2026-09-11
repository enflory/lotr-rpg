// Tile indices — order must match TILE_FNS in src/art/tiles.js

export const T = {
  GRASS: 0,
  GRASS2: 1,
  PATH: 2,
  WATER: 3,
  TREE: 4,
  HILL: 5,
  HILLTOP: 6,
  DOOR: 7,
  BRIDGE: 8,
  FENCE: 9,
  BUSH: 10,
  STONE: 11,
  FLOWERS: 12,
  GARDEN: 13,
  ROOF: 14,
  DOOR_L: 15, // left side of hobbit hole entrance
  DOOR_R: 16, // right side of hobbit hole entrance
  ROOF_L: 17, // left slope of hobbit hill mound
  ROOF_R: 18, // right slope of hobbit hill mound
  // Interiors
  FLOOR: 19, // wood plank floor
  WALL: 20, // interior wall face
  RUG: 21,
  TABLE: 22,
  FIREPLACE: 23,
  SHELF: 24, // bookshelf
  COUNTER: 25, // inn bar counter
  BED: 26,
  WINDOW_I: 27, // interior wall with round window
  // Forest
  FERN: 28, // walkable undergrowth
  TREE2: 29, // autumn-tinged tree (Woody End)
  SIGN: 30, // wooden signpost (interactable via zone.signs)
  VOID: 31, // dark mass outside interior rooms
  DOCK: 32, // east-west pier, north half (water edge above)
  DOCK_S: 33, // east-west pier, south half (water edge + posts below)
  // Party Field
  PARTY_TL: 34, // Party Tree, 2×3 composite — canopy middle row
  PARTY_TR: 35,
  PARTY_BL: 36, // bottom row carries the trunk
  PARTY_BR: 37,
  PARTY_TABLE: 38, // trestle table laid with party food and ale
  LANTERN: 39, // lamp post
  PARTY_NL: 40, // crown row, north of PARTY_TL/TR
  PARTY_NR: 41,
  // The Marish
  BOG: 42, // squelchy wet ground (walkable)
  REEDS: 43, // marsh rushes (solid)
  // Hobbiton village dressing
  WHEEL: 44, // mill wheel over water
  CRATE: 45, // firework crate
  WELL: 46, // village well
  BARN: 47, // timber barn wall
  FEAST: 48, // feast table cloth
  DITCH: 49, // drainage ditch
  WAGGON: 50, // waggon (Maggot's cart)
  // The specially large party pavilion, 2×2 composite
  PAV_TL: 51,
  PAV_TR: 52,
  PAV_BL: 53,
  PAV_BR: 54,
  // Two-row smial dome: upper shoulders + lower base corners share one
  // 32px-tall curve so the whole facade reads as a single round mound
  MOUND_L: 55,
  MOUND_R: 56,
  BASE_L: 57,
  BASE_R: 58,
  WINDOW_F: 59, // exterior earth face with a round window
  // Beyond the High Hay
  FOREST_FLOOR: 60,
  OLD_TREE: 61,
  ROOTS: 62,
  DEAD_TREE: 63,
  DARK_WATER: 64,
  LILIES: 65,
  DOWN_GRASS: 66,
  STANDING_STONE: 67,
  BARROW_WALL: 68,
  BARROW_FLOOR: 69,
  CHALK: 70,
  HEDGE: 71,
  // Barrow-downs relief: turf scarps, the tall marker stone, flowering turf
  DOWN_SLOPE: 72,
  GREAT_STONE: 73,
  DOWN_HEATHER: 74,
  // Hobbiton field furniture
  HEDGEROW: 75, // hawthorn field hedge
  STOOK: 76, // sheaf of corn stood up to dry
  SKEP: 77, // straw beehive
  BENCH: 78, // wooden bench
  MILESTONE: 79, // waymark on the Bywater road
  CORN: 80, // standing corn, shoulder-high (solid)
  HAY: 81, // cut hay lying in the field (walkable)
};

export const COLLISION_TILES = [
  T.OLD_TREE,
  T.DEAD_TREE,
  T.DARK_WATER,
  T.LILIES,
  T.STANDING_STONE,
  T.BARROW_WALL,
  T.HEDGE,
  T.DOWN_SLOPE,
  T.GREAT_STONE,

  T.WATER,
  T.TREE,
  T.HILL,
  T.FENCE,
  T.BUSH,
  T.ROOF,
  T.DOOR_L,
  T.DOOR_R,
  T.ROOF_L,
  T.ROOF_R,
  T.WALL,
  T.TABLE,
  T.FIREPLACE,
  T.SHELF,
  T.COUNTER,
  T.BED,
  T.WINDOW_I,
  T.TREE2,
  T.SIGN,
  T.VOID,
  T.PARTY_TL,
  T.PARTY_TR,
  T.PARTY_BL,
  T.PARTY_BR,
  T.PARTY_TABLE,
  T.LANTERN,
  T.PARTY_NL,
  T.PARTY_NR,
  T.REEDS,
  T.WHEEL,
  T.CRATE,
  T.WELL,
  T.BARN,
  T.FEAST,
  T.DITCH,
  T.WAGGON,
  T.PAV_TL,
  T.PAV_TR,
  T.PAV_BL,
  T.PAV_BR,
  T.MOUND_L,
  T.MOUND_R,
  T.BASE_L,
  T.BASE_R,
  T.WINDOW_F,
  T.HEDGEROW,
  T.STOOK,
  T.SKEP,
  T.BENCH,
  T.MILESTONE,
  T.CORN,
];

export const TILE_SIZE = 16;

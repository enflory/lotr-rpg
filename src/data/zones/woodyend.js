// The Woody End — wooded country east of Hobbiton, where the hobbits
// first meet a Black Rider. Map is generated: a winding East Road
// through mixed woods with fern brakes to hide in. The road runs out
// the east edge and down into the Marish (gated on meeting Gildor).

import { T, TILE_SIZE } from '../tileTypes.js';
import { riderEventUpdate } from '../../events/riderEvent.js';
import { foxEventUpdate } from '../../events/foxEvent.js';
import { hasFlag, setFlag } from '../../state/GameState.js';
import { sfx } from '../../audio/sound.js';

export const WIDTH = 64, HEIGHT = 28;
export const RIDER_EXIT_X = 50; // he gives up before the elf clearing
export const GILDOR_SPOT = { x: 56, y: 15 };
export const HOLLOW = { x0: 20, y0: 20, x1: 26, y1: 24 };
export const ELF_SPOTS = [
  { key: 'elf_a', x: 54, y: 14, dir: 'right' },
  { key: 'elf_b', x: 58, y: 13, dir: 'down' },
  { key: 'elf_c', x: 57, y: 16, dir: 'left' },
];

// Deterministic PRNG so the forest is the same every visit
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Road top-row y per column (road is 2 tiles tall)
export const ROAD_Y = [];
for (let x = 0; x < WIDTH; x++) {
  ROAD_Y[x] = x < 8 ? 13 : x < 18 ? 15 : x < 30 ? 11 : x < 40 ? 14 : x < 52 ? 10 : 12;
}

function generateMap() {
  const rnd = lcg(0x517e);
  const map = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      row.push(rnd() < 0.55 ? T.GRASS2 : T.GRASS);
    }
    map.push(row);
  }

  const nearRoad = (x, y) => {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = Math.min(WIDTH - 1, Math.max(0, x + dx));
      if (y >= ROAD_Y[cx] - 1 && y <= ROAD_Y[cx] + 2) return true;
    }
    return false;
  };

  // Carve the road, including vertical joins where it bends
  for (let x = 0; x < WIDTH; x++) {
    map[ROAD_Y[x]][x] = T.PATH;
    map[ROAD_Y[x] + 1][x] = T.PATH;
    if (x > 0 && ROAD_Y[x] !== ROAD_Y[x - 1]) {
      const lo = Math.min(ROAD_Y[x], ROAD_Y[x - 1]);
      const hi = Math.max(ROAD_Y[x], ROAD_Y[x - 1]) + 1;
      for (let y = lo; y <= hi; y++) {
        map[y][x] = T.PATH;
        map[y][x - 1] = T.PATH;
      }
    }
  }

  // Scatter woods and undergrowth away from the road
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      if (nearRoad(x, y)) continue;
      const r = rnd();
      if (r < 0.30) map[y][x] = rnd() < 0.4 ? T.TREE2 : T.TREE;
      else if (r < 0.40) map[y][x] = T.FERN;
      else if (r < 0.42) map[y][x] = T.FLOWERS;
    }
  }

  // Thicken into groves: trees tend to grow beside other trees
  for (let y = 2; y < HEIGHT - 2; y++) {
    for (let x = 2; x < WIDTH - 2; x++) {
      if (nearRoad(x, y)) continue;
      const t = map[y][x];
      if ((t === T.TREE || t === T.TREE2) && rnd() < 0.5) {
        const [nx, ny] = rnd() < 0.5 ? [x + 1, y] : [x, y + 1];
        if (!nearRoad(nx, ny) && (map[ny][nx] === T.GRASS || map[ny][nx] === T.GRASS2)) {
          map[ny][nx] = t;
        }
      }
    }
  }

  // Guaranteed fern brakes one tile off the road — the hiding spots
  for (let x = 4; x < WIDTH - 3; x += 4) {
    const above = ROAD_Y[x] - 1;
    const below = ROAD_Y[x] + 2;
    map[above][x] = T.FERN;
    map[above][x + 1] = T.FERN;
    map[below][x + 2] = T.FERN;
    map[below][x + 3] = T.FERN;
  }

  // Deep, continuous brakes beside the first Rider trigger. Three hobbits
  // spaced 18px apart can step north or south off the road and all hide.
  // These columns are on the straight road section (rows 15-16).
  for (let x = 9; x <= 16; x++) {
    for (const y of [12, 13, 14, 17, 18, 19]) map[y][x] = T.FERN;
  }

  // Fray the outside of every brake. The row nearest the road is left whole —
  // that is the cover the Rider scene depends on — but the far edges break up
  // into single fronds and bare ground, so a brake reads as undergrowth
  // rather than as a rectangle of wallpaper.
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      if (map[y][x] !== T.FERN || nearRoad(x, y)) continue;
      const edge =
        map[y - 1][x] !== T.FERN || map[y + 1][x] !== T.FERN ||
        map[y][x - 1] !== T.FERN || map[y][x + 1] !== T.FERN;
      if (edge && rnd() < 0.45) map[y][x] = rnd() < 0.45 ? T.FLOWERS : T.GRASS2;
    }
  }

  // Tree-tunnel: canopy closes right over the road mid-forest.
  for (let x = 40; x <= 48; x++) {
    const above = ROAD_Y[x] - 1, below = ROAD_Y[x] + 2;
    if (map[above][x] !== T.PATH) map[above][x] = T.TREE;
    if (map[below][x] !== T.PATH) map[below][x] = T.TREE;
  }

  // Fir hollow — a fox-haunted glade south of the road: a wildflower
  // carpet ringed by firs, reached by one fern-lined trail down from
  // the road. The break in the tree wall is the cue to wander off-path.
  for (let y = 20; y <= 24; y++)
    for (let x = 20; x <= 26; x++) map[y][x] = T.FLOWERS; // flower carpet
  for (let x = 20; x <= 26; x++) { map[20][x] = T.TREE; map[24][x] = T.TREE; }
  for (let y = 20; y <= 24; y++) { map[y][20] = T.TREE; map[y][26] = T.TREE; }
  map[20][23] = T.FLOWERS; // the single north entrance
  // Fern-lined trail from the road down to the entrance
  for (let y = 13; y <= 19; y++) {
    map[y][23] = y === 19 ? T.FLOWERS : T.GRASS; // petals spill at the mouth
    map[y][22] = T.FERN;
    map[y][24] = T.FERN;
  }

  // Border trees, with road gaps on the west and east edges
  for (let x = 0; x < WIDTH; x++) {
    map[0][x] = T.TREE;
    map[HEIGHT - 1][x] = T.TREE;
  }
  for (let y = 0; y < HEIGHT; y++) {
    if (!(y === ROAD_Y[0] || y === ROAD_Y[0] + 1)) map[y][0] = T.TREE;
    if (!(y === ROAD_Y[WIDTH - 1] || y === ROAD_Y[WIDTH - 1] + 1)) map[y][WIDTH - 1] = T.TREE;
  }

  // Clearing where Gildor's company appears (the hall of trees).
  // Guard against T.PATH so the road carries straight through into it,
  // matching the book: the road leads Frodo right up to the Elves.
  for (let y = 13; y <= 17; y++)
    for (let x = 52; x <= 59; x++)
      if (map[y][x] !== T.PATH) map[y][x] = T.GRASS;
  map[17][55] = T.FEAST; map[17][56] = T.FEAST;

  // Open a spur north from the road so the mushroom at (61,7) is
  // reachable — the procedural woods otherwise seal it in a pocket.
  map[9][61] = T.GRASS;

  return map;
}

/** @type {import('../types.js').Zone} */
export const woodyend = {
  key: 'woodyend',
  label: 'The Woody End',
  music: 'forest',
  map: generateMap(),
  spawns: {
    west: { x: 1, y: 13, dir: 'right' },
    east: { x: 62, y: 12, dir: 'left' },
  },
  npcs: [
    { key: 'gildor', ...GILDOR_SPOT, dir: 'down', when: (f) => f.escapedRider },
    { key: 'elf_a', x: 54, y: 14, dir: 'right', when: (f) => f.escapedRider },
    { key: 'elf_b', x: 58, y: 13, dir: 'down', when: (f) => f.escapedRider },
    { key: 'elf_c', x: 57, y: 16, dir: 'left', when: (f) => f.escapedRider },
  ],
  doors: [],
  signs: [
    { x: 55, y: 17, dialogue: 'elf_feast' },
    { x: 56, y: 17, dialogue: 'elf_feast' },
  ],
  interactions: [
    { x: 12, y: 17, label: 'The fern brake', dialogue: 'examine_ferns' },
    { x: 23, y: 22, label: 'The fir hollow', dialogue: 'examine_hollow' },
  ],
  pickups: [
    { id: 'woody_mush_1', x: 44, y: 6, item: 'mushroom' },
    { id: 'woody_mush_2', x: 48, y: 18, item: 'mushroom' }, // nudged off TREE2 at (49,18)
    { id: 'woody_mush_3', x: 57, y: 20, item: 'mushroom' },
    { id: 'woody_mush_4', x: 61, y: 7, item: 'mushroom' }, // nudged off TREE at (60,7)
  ],
  exits: [
    { x: 0, y: 13, zone: 'shire', entry: 'fromWoodyEnd' },
    { x: 0, y: 14, zone: 'shire', entry: 'fromWoodyEnd' },
    {
      x: 63, y: 12, zone: 'marish', entry: 'west',
      requires: 'metGildor',
      denied: "I should hear the Elf's\ncounsel first.",
    },
    {
      x: 63, y: 13, zone: 'marish', entry: 'west',
      requires: 'metGildor',
      denied: "I should hear the Elf's\ncounsel first.",
    },
  ],
  onCreate: (scene) => {
    if (!hasFlag('walkingSong')) {
      scene.time.delayedCall(900, () => {
        setFlag('walkingSong');
        scene.startDialogue('walking_song');
      });
    }
  },
  onUpdate: (scene, delta) => {
    riderEventUpdate(scene, delta);
    foxEventUpdate(scene);
    if (hasFlag('escapedRider') && !scene._elfsongPlayed) {
      const tx = Math.floor(scene.player.x / TILE_SIZE);
      if (tx >= 48) {
        scene._elfsongPlayed = true;
        sfx.elfsong();
        scene.showBanner('Singing drifts through\nthe trees ahead...');
      }
    }
  },
};

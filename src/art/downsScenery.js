// The Barrow-downs read as landscape rather than maze because the solid turf
// tiles are shaded by height, not by tile. A smoothed hill mask supplies
// elevation; contours, a lit northern skyline,
// a dark southern face and a cast shadow on the grass below are drawn from it.
// Rounded edges follow the collision mask; tile centres always retain their
// solid/open reading. Shadows and vegetation are flat ground decoration.
import { T } from '../data/tileTypes.js';
import { BARROW_BREACH } from '../data/barrowLandmarks.js';
import { maskOf, sample, wobble, hash } from './relief.js';

const DOWNS_ZONES = new Set(['downs', 'barrowhill', 'eastroad']);

// A small, opaque palette at native resolution. Broad bands describe form;
// texture is placed in clusters rather than blended into every pixel.
const TURF = [0x394b42, 0x4b5e48, 0x61754f, 0x7d8d58, 0x98a568, 0xb1b97a, 0xc7cc91];
const VALE = [0x718455, 0x798b58, 0x81925e];
const CHALK = [0xa9aa82, 0xc2c39b, 0xdad7b0];
const ROAD = [0x91805f, 0xa7946d, 0xb5a27b];
const GROUND = new Set([T.DOWN_GRASS, T.DOWN_HEATHER, T.DOWN_SLOPE, T.CHALK,
  T.PATH, T.STANDING_STONE, T.GREAT_STONE]);

// Pure bake: used by the canvas renderer and by the palette/collision checks.
export function bakeDownsRelief(map) {
  const width = map[0].length * 16, height = map.length * 16;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const hill = maskOf(map, (t) => t === T.DOWN_SLOPE);
  const chalk = maskOf(map, (t) => t === T.CHALK);
  const road = maskOf(map, (t) => t === T.PATH);
  const ribbons = [{ field: chalk, type: T.CHALK, palette: CHALK },
    { field: road, type: T.PATH, palette: ROAD }];
  const ink = (x, y, color) => {
    const i = (y * width + x) * 4;
    pixels[i] = color >> 16; pixels[i + 1] = (color >> 8) & 255;
    pixels[i + 2] = color & 255; pixels[i + 3] = 255;
  };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const tile = map[y >> 4][x >> 4];
    if (!GROUND.has(tile)) continue;
    const fx = x / 16 - 0.5, fy = y / 16 - 0.5;
    // Two-pixel clusters fray the outline, never a screen of single-pixel noise.
    const g = wobble(x & ~1, y & ~1, 26, 20, 11) * 0.055;
    let m = sample(hill, fx, fy) + g;
    // Keep the middle of every cell honest. Smoothing may round tile corners,
    // but must not turn a narrow solid spur into an invisible wall, or paint
    // a walkable cell as a hill. Fade the correction out towards the edges.
    const core = Math.max(0, 1 - Math.max(Math.abs((x & 15) - 8), Math.abs((y & 15) - 8)) / 7);
    if (tile === T.DOWN_SLOPE) m = Math.max(m, 0.65 - (1 - core) * 0.6);
    else m = Math.min(m, 0.39 + (1 - core) * 0.6);
    let color;
    const patch = wobble(x & ~3, y & ~1, 64, 42, 37);
    if (m > 0.52) {
      const slope = sample(hill, fx, fy + 0.5) - sample(hill, fx, fy - 0.5);
      const side = sample(hill, fx + 0.5, fy) - sample(hill, fx - 0.5, fy);
      const elevation = Math.min(1, (m - 0.52) / 0.48);
      let light = 0.38 + elevation * 0.30 + slope * 1.65 + side * 0.38 + patch * 0.08;
      if (sample(hill, fx, fy - 0.13) + g <= 0.52) light = 0.96;
      if (sample(hill, fx, fy + 0.12) + g <= 0.52) light = 0.08;
      color = TURF[Math.max(0, Math.min(6, Math.floor(light * 7)))];
    } else {
      color = VALE[patch < -0.17 ? 0 : patch > 0.18 ? 2 : 1];
      const above = sample(hill, fx - 0.16, fy - 0.55);
      if (above > 0.63) color = 0x586e4d;
      else if (above > 0.52) color = 0x657b51;
    }
    // Opaque, worn ribbons: no alpha fringe revealing the old square tiles.
    for (const { field, type, palette } of ribbons) {
      if (!field.any || tile === T.DOWN_SLOPE) continue;
      const c = sample(field, fx, fy) + g * 0.5;
      if (c > 0.32 || (tile === type && core > 0.35)) {
        color = palette[c < 0.39 ? 0 : patch > 0.10 ? 2 : 1];
      }
    }
    ink(x, y, color);
  }
  // Wind-combed tufts and flowering cushions: sparse, asymmetric pixel
  // clusters leave quiet ground between them and keep the path easy to read.
  for (let y = 5; y < height - 5; y += 7) for (let x = 5; x < width - 5; x += 9) {
    const seed = hash(x, y, 89) + 0.5;
    const px = x + Math.floor(seed * 5), py = y + Math.floor((hash(y, x, 23) + 0.5) * 4);
    const tile = map[py >> 4][px >> 4];
    if (tile !== T.DOWN_GRASS && tile !== T.DOWN_HEATHER) continue;
    if (sample(hill, px / 16 - 0.5, py / 16 - 0.5) > 0.38) continue;
    if (sample(chalk, px / 16 - 0.5, py / 16 - 0.5) > 0.15 ||
        sample(road, px / 16 - 0.5, py / 16 - 0.5) > 0.15) continue;
    const flower = tile === T.DOWN_HEATHER;
    if (seed > (flower ? 0.74 : 0.17)) continue;
    const marks = flower
      ? [[-2,0,0x596c50],[-1,0,0x796480],[0,0,0x796480],[1,0,0x796480],
         [2,0,0x596c50],[-1,-1,0xad8fa5],[1,-2,0xbca0b0],[2,-1,0x947a97]]
      : [[-2,0,0x63764b],[-1,-1,0x9dab6e],[0,0,0x63764b],[1,-2,0x9dab6e],[1,-1,0x9dab6e],[2,0,0x63764b]];
    for (const [dx, dy, col] of marks) {
      if (map[(py + dy) >> 4][(px + dx) >> 4] === tile) ink(px + dx, py + dy, col);
    }
  }
  return { width, height, pixels };
}

export function drawDownsRelief(scene) {
  if (!DOWNS_ZONES.has(scene.zoneKey)) return;
  const key = `downs-relief-${scene.zoneKey}`;
  if (!scene.textures.exists(key)) {
    const { width, height, pixels } = bakeDownsRelief(scene.zone.map);
    const canvas = scene.textures.createCanvas(key, width, height);
    const ctx = canvas.getContext();
    const image = ctx.createImageData(width, height);
    image.data.set(pixels);
    ctx.putImageData(image, 0, 0);
    canvas.refresh();
  }
  scene.add.image(0, 0, key).setOrigin(0).setDepth(3);
}

/* ── Uprights, mounds and waymarks ────────────────────────────────────────
   Drawn as sprites (not baked) so each one can own a depth that sorts against
   the hobbits walking past it.                                              */
// The pair the road runs between: matched, taller than anything else on the
// downs, and leaning together so the gap between them reads as a doorway.
function portal(scene, cx, cy, dir) {
  const s = scene.add.graphics().setDepth(cy + 2);
  const r = (dx, dy, w, h, col) => s.fillStyle(col).fillRect(cx + (dir === 1 ? dx : -dx - w + 1), cy + dy, w, h);
  r(-8, -8, 17, 9, 0x39433f);
  r(-7, -9, 14, 3, 0x76816f);
  r(-7, -58, 15, 52, 0x1e2427);
  r(-5, -62, 11, 55, 0x46514b);
  r(-4, -64, 8, 6, 0x6f7b71);
  r(-3, -65, 5, 3, 0x9aa495);
  r(-3, -58, 3, 48, 0x7f8b7f);
  r(-2, -56, 1, 42, 0xa3ada0);
  r(4, -54, 3, 44, 0x141a1c);
  r(0, -40, 2, 14, 0x333d38);
  r(-6, -22, 3, 3, 0x5d6a5b);
  return s;
}

function upright(scene, cx, cy, seed) {
  const s = scene.add.graphics().setDepth(cy);
  const r = (dx, dy, w, h, col) => s.fillStyle(col).fillRect(cx + dx, cy + dy, w, h);
  const lean = seed % 3 === 0 ? 1 : seed % 5 === 0 ? -1 : 0;
  const tall = 22 + (seed % 9);
  r(-6, -tall + 2, 12, tall, 0x3f4b48);
  r(-4 + lean, -tall - 6, 7, tall + 5, 0x7e8c80);
  r(-3 + lean, -tall - 8, 4, 3, 0xaab3a0);
  r(-3 + lean, -tall - 3, 2, tall - 2, 0xaab3a0);
  r(3 + lean, -tall + 4, 2, tall - 6, 0x596a62);
  r(-4, -4, 8, 3, 0x7d8767);
  r(-5, -2, 10, 2, 0x697354);
  return s;
}

// The waymark the whole road climbs to. Twice the bulk of the others, a pale
// weathered crown, a kerb of small stones and a worn hollow at its foot.
function greatStone(scene, cx, cy) {
  const back = scene.add.graphics().setDepth(cy - 12);
  const b = (dx, dy, w, h, col, a = 1) =>
    back.fillStyle(col, a).fillRect(cx + dx, cy + dy, w, h);
  for (let n = 0; n < 4; n++) b(-30 + n * 4, 6 - n * 3, 60 - n * 8, 3, [0x8c9670, 0x9aa47c, 0xa7b088, 0xb3bb94][n]);
  b(-26, 9, 52, 4, 0x77815f);
  for (const [dx, dy] of [[-24, 4], [-17, 9], [17, 9], [24, 4], [-21, -2], [21, -2]]) {
    b(dx - 3, dy - 4, 7, 6, 0x5f6a5c);
    b(dx - 2, dy - 5, 5, 2, 0x99a292);
  }
  b(-13, 4, 26, 7, 0x5c6650, 0.55);

  const s = scene.add.graphics().setDepth(cy + 4);
  const r = (dx, dy, w, h, col) => s.fillStyle(col).fillRect(cx + dx, cy + dy, w, h);
  r(-12, -6, 24, 8, 0x2a2f31);
  r(-11, -50, 21, 47, 0x1d2326);
  r(-9, -47, 16, 44, 0x39433f);
  r(-8, -52, 13, 8, 0x59645b);
  r(-7, -54, 10, 4, 0x8e998b);
  r(-6, -55, 6, 2, 0xb6bfab);
  r(-7, -45, 4, 38, 0x6d7a6f);
  r(-6, -44, 2, 34, 0x93a091);
  r(5, -42, 3, 33, 0x161b1e);
  r(-2, -34, 3, 12, 0x4d574f);
  r(-1, -19, 2, 9, 0x555f54);
  r(-9, -12, 6, 3, 0x5c6b52);
  r(3, -24, 4, 2, 0x707c6b);
  return s;
}

// Small heaps beside the track. They are the only signposting on the downs,
// so they always sit on the hillside, never in the walking line.
function cairn(scene, cx, cy) {
  const s = scene.add.graphics().setDepth(cy + 2);
  const r = (dx, dy, w, h, col) => s.fillStyle(col).fillRect(cx + dx, cy + dy, w, h);
  r(-7, -2, 15, 5, 0x4b5346);
  r(-6, -6, 12, 5, 0xa3aa8d);
  r(-5, -5, 4, 3, 0xc0c6a6);
  r(-4, -10, 8, 5, 0x8e977c);
  r(-3, -9, 3, 2, 0xb6bd9c);
  r(-2, -13, 5, 4, 0xa9b092);
  r(-1, -12, 2, 2, 0xc9cfae);
  return s;
}

// Low kerbstones are part of the turf, not a new obstacle. Their broken arcs
// make the southern burial mounds readable from the walking loop.
function moundKerbs(scene) {
  const g = scene.add.graphics().setDepth(4);
  const r = (x, y, w, h, color) => g.fillStyle(color).fillRect(x, y, w, h);
  for (const [cx, cy, rx, ry] of [[16,35,3,2], [22,37,2,1], [11,33,2,1], [45,33,3,2], [51,36,2,1]]) {
    for (let n = 0; n < 14; n++) {
      if (n % 5 === 2) continue;
      const a = n * Math.PI * 2 / 14;
      const x = Math.round((cx + 0.5) * 16 + Math.cos(a) * rx * 15);
      const y = Math.round((cy + 0.5) * 16 + Math.sin(a) * ry * 15);
      if (scene.zone.map[y >> 4]?.[x >> 4] !== T.DOWN_SLOPE) continue;
      r(x - 3, y, 7, 3, 0x53624e);
      r(x - 2, y - 2, 5, 3, 0x929b78);
      r(x - 1, y - 2, 3, 1, 0xb7bc96);
    }
  }
}

export function drawDownsFeatures(scene) {
  const map = scene.zone.map;
  if (!DOWNS_ZONES.has(scene.zoneKey)) return;
  for (let y = 1; y < map.length - 1; y++)
    for (let x = 1; x < map[y].length - 1; x++) {
      if (map[y][x] === T.GREAT_STONE) greatStone(scene, x * 16 + 8, y * 16 + 15);
      if (map[y][x] !== T.STANDING_STONE) continue;
      // A pair two tiles apart on the same row is the gate; anything else is
      // one more weathered upright standing on its own.
      if (map[y][x + 2] === T.STANDING_STONE) portal(scene, x * 16 + 8, y * 16 + 15, 1);
      else if (map[y][x - 2] === T.STANDING_STONE) portal(scene, x * 16 + 8, y * 16 + 15, -1);
      else upright(scene, x * 16 + 8, y * 16 + 15, x * 7 + y);
    }
  // A waymark every few tiles of chalk, alighting on the hillside beside it.
  if (scene.zoneKey !== 'downs') return;
  moundKerbs(scene);
  let n = 0;
  for (let y = 1; y < map.length - 1; y++)
    for (let x = 1; x < map[y].length - 1; x++) {
      if (map[y][x] !== T.CHALK) continue;
      if (n++ % 11) continue;
      const side = [
        [x - 1, y - 1],
        [x + 1, y - 1],
        [x - 1, y + 1],
        [x + 1, y + 1],
      ].find(([sx, sy]) => map[sy]?.[sx] === T.DOWN_SLOPE);
      if (side) cairn(scene, side[0] * 16 + 8, side[1] * 16 + 13);
    }
}

/* ── Under the stone ──────────────────────────────────────────────────────
   Baked once: dressed wall faces with a lit top course, a flagged floor that
   varies stone by stone, and the hoard heaped in mounds along the eastern
   chamber. Every mark is clipped to tiles that are already what they draw.  */
// Five flagstones, close enough in tone that a floor of them still reads as
// one floor. Anything wider than this and the chamber looks like a mosaic.
const FLAG = [0x49533f, 0x4d5744, 0x515b47, 0x545e4a, 0x58614d];
const rand = (x, y, s = 0) => {
  let n = Math.imul(x + 401 + s, 374761393) ^ Math.imul(y + 907, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

export function drawBarrowInterior(scene) {
  if (scene.zoneKey !== 'barrow') return;
  const map = scene.zone.map;
  const rows = map.length,
    cols = map[0].length;
  const key = 'barrow-interior';
  if (!scene.textures.exists(key)) {
    const g = scene.add.graphics();
    const r = (x, y, w, h, col, a = 1) =>
      g.fillStyle(col, a).fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    const wall = (x, y) => map[y]?.[x] === T.BARROW_WALL;
    const floor = (x, y) => map[y]?.[x] === T.BARROW_FLOOR;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const px = x * 16,
          py = y * 16;
        if (floor(x, y)) {
          // Flagstones, each its own colour, some cracked, some sunk in dust.
          r(px, py, 16, 16, 0x39423a);
          for (const [sx, sy, sw, sh] of [
            [0, 0, 9, 7],
            [9, 0, 7, 7],
            [0, 7, 6, 9],
            [6, 7, 10, 9],
          ]) {
            const v = rand(x * 4 + sx, y * 4 + sy);
            r(px + sx + 1, py + sy + 1, sw - 1, sh - 1, FLAG[Math.floor(v * FLAG.length)]);
            r(px + sx + 1, py + sy + 1, sw - 1, 1, 0x5b6555);
            if (v > 0.88) r(px + sx + 2, py + sy + 3, sw - 3, 1, 0x3a4239);
          }
          if (rand(x, y, 5) > 0.86) {
            // Dust and old bone drifted into the corners of the floor.
            r(px + 3, py + 8, 9, 3, 0x5d6455, 0.7);
            r(px + 5, py + 9, 6, 1, 0x8d907c);
          }
          if (wall(x, y - 1)) r(px, py, 16, 6, 0x232b26, 0.6);
          if (wall(x - 1, y)) r(px, py, 4, 16, 0x232b26, 0.45);
          if (wall(x + 1, y)) r(px + 12, py, 4, 16, 0x232b26, 0.45);
          continue;
        }
        if (!wall(x, y)) continue;
        r(px, py, 16, 16, 0x252e28);
        for (const [bx, by, bw, bh] of [
          [0, 0, 9, 6],
          [9, 0, 7, 6],
          [0, 6, 5, 5],
          [5, 6, 11, 5],
          [0, 11, 11, 5],
          [11, 11, 5, 5],
        ]) {
          const v = rand(x * 5 + bx, y * 5 + by, 3);
          r(px + bx + 1, py + by + 1, bw - 1, bh - 1, v > 0.5 ? 0x424d40 : 0x3c463b);
          r(px + bx + 1, py + by + 1, bw - 1, 1, 0x5a6656);
          r(px + bx + 1, py + by + bh - 1, bw - 1, 1, 0x272f28);
          if (v > 0.9) r(px + bx + 2, py + by + 2, bw - 3, bh - 3, 0x333d33);
        }
        if (!wall(x, y + 1)) r(px, py + 12, 16, 4, 0x161c19);
        if (!wall(x, y - 1)) {
          r(px, py, 16, 2, 0x7c8977);
          // Roots have come down through the joints of the old roof course.
          for (let n = 0; n < 3; n++)
            if (rand(x, y + n, 9) > 0.55)
              r(px + Math.floor(rand(x, n, 2) * 13), py + 14, 1, 4 + n * 3, 0x3b4a34);
        }
        if ((x + y) % 3 === 0) r(px + ((x * 5) % 12), py + 2, 1, 11, 0x3d4a38);
      }
    // The hoard: heaped against the eastern walls, in mounds with lit tops
    // rather than an even scatter of coins over the whole floor.
    const heap = (cx, cy, w, h) => {
      for (let n = 0; n < h; n++) {
        const half = Math.round((w / 2) * Math.sqrt(1 - (n / h) ** 2));
        r(cx - half, cy - n, half * 2, 1, n > h * 0.6 ? 0xa98d3f : 0x6f5c2c);
      }
      for (let n = 0; n < w * 2; n++) {
        const dx = Math.round((rand(cx + n, cy, 7) - 0.5) * w);
        const dy = Math.round(rand(cy, cx + n, 8) * h * 0.8);
        const gold = n % 3 !== 0;
        r(cx + dx, cy - dy, 3, 2, gold ? 0xd8bd61 : 0xa8b3ab);
        r(cx + dx, cy - dy, 1, 1, gold ? 0xf6e6a2 : 0xdde4dc);
      }
    };
    heap(28 * 16, 16 * 16, 60, 14);
    heap(33 * 16, 12 * 16, 40, 11);
    heap(31 * 16, 19 * 16, 46, 9);
    heap(26 * 16, 9 * 16, 34, 10);
    // Grave-goods laid out among it: circlets, a mail shirt, stacked spears.
    for (const [x, y, w] of [
      [27 * 16, 15 * 16, 30],
      [32 * 16 + 4, 18 * 16, 36],
      [26 * 16 + 6, 10 * 16, 22],
    ]) {
      r(x, y, w, 4, 0x5c5136);
      r(x, y, w, 1, 0xd8bd61);
      r(x + 4, y - 5, 3, 10, 0xa9b1a5);
      r(x + 4, y - 5, 1, 10, 0xe0e8dc);
    }
    for (let n = 0; n < 5; n++) {
      const x = 33 * 16 + n * 4,
        y = 12 * 16 + n * 3;
      r(x, y, 2, 52 - n * 4, 0x594a34);
      r(x - 1, y - 7, 4, 9, 0xa9b3a7);
      r(x, y - 6, 1, 7, 0xe2e9de);
    }
    for (const [x, y] of [[26 * 16, 6 * 16 + 6], [30 * 16, 6 * 16 + 6], [34 * 16, 6 * 16 + 6]]) {
      r(x, y, 14, 11, 0x3d3a2c);
      r(x + 1, y + 1, 12, 9, 0x7c7357);
      r(x + 1, y + 1, 12, 1, 0xa2946c);
      r(x + 5, y + 4, 4, 4, 0xc0a86a);
    }
    g.generateTexture(key, cols * 16, rows * 16);
    g.destroy();
  }
  scene.add.image(0, 0, key).setOrigin(0).setDepth(3);
  // The far end keeps its dark. The near end holds a cold gleam with no source.
  const dark = scene.add.graphics().setDepth(500);
  for (let n = 0; n < 14; n++)
    dark.fillStyle(0x04070a, 0.075).fillRect((24 + n) * 16, 5 * 16, 16, 16 * 16);
  // Rubble down the middle of the chamber: roof stones that came in a long
  // time ago, and the bones of whoever was buried under them.
  const floorLitter = scene.add.graphics().setDepth(4);
  for (const [x, y, w, h] of [
    [17 * 16, 15 * 16, 26, 15],
    [21 * 16 + 6, 8 * 16, 20, 12],
    [12 * 16, 18 * 16, 30, 13],
    [8 * 16 + 4, 9 * 16, 18, 11],
  ]) {
    floorLitter.fillStyle(0x2b332c).fillRect(x - 2, y + 2, w + 4, h);
    floorLitter.fillStyle(0x4d5748).fillRect(x, y, w, h);
    floorLitter.fillStyle(0x76806b).fillRect(x, y, w, 3);
    floorLitter.fillStyle(0x39423a).fillRect(x + 3, y + h - 3, w - 6, 3);
  }
  for (let n = 0; n < 12; n++) {
    const x = 8 * 16 + ((n * 71) % 200),
      y = 13 * 16 + ((n * 47) % 90);
    floorLitter.fillStyle(0x9aa088).fillRect(x, y, 7 + (n % 3), 2);
    floorLitter.fillStyle(0xc2c6ac).fillRect(x, y, 2, 2);
  }
  const glow = scene.add.graphics().setDepth(5);
  for (let n = 7; n > 0; n--)
    glow
      .fillStyle(0x35735a, 0.05)
      .fillEllipse(15 * 16, 12 * 16, 150 + n * 34, 110 + n * 26);
  // Cold motes turning slowly in the green light.
  for (let i = 0; i < 16; i++) {
    const mote = scene.add
      .rectangle(7 * 16 + ((i * 61) % 300), 7 * 16 + ((i * 43) % 190), 1, 1, 0xbfe6cd, 0.5)
      .setDepth(600);
    scene.tweens.add({
      targets: mote,
      y: mote.y - 24 - (i % 5) * 8,
      alpha: 0,
      duration: 5200 + i * 219,
      repeat: -1,
    });
  }
}

// Daylight through a broken wall, made from stepped pixels rather than a
// scaled rectangle. It covers the wall texture at the point Tom enters.
export function drawBarrowBreach(scene) {
  const g = scene.add.graphics().setDepth(6);
  const cx = BARROW_BREACH.x * 16 + 8, cy = BARROW_BREACH.y * 16;
  const r = (x, y, w, h, color) => g.fillStyle(color).fillRect(cx + x, cy + y, w, h);
  const rows = [14, 20, 24, 27, 29, 29, 28, 30, 29, 28, 26, 24, 21];
  for (const [i, half] of rows.entries()) {
    const y = -32 + i * 4;
    r(-half - 3, y, half * 2 + 6, 4, 0x303a31);
    r(-half, y, half * 2, 4, i < 7 ? 0xf0dca7 : 0xc5ca88);
    // The sunlit grass beyond the wall gives the hole a place to lead to.
    if (i >= 8) r(-half, y + 2, half * 2, 2, i > 10 ? 0x8e9c68 : 0xaeb97b);
  }
  for (const [x,y,w,h] of [[-28,-29,9,6],[20,-26,12,7],[-34,-9,10,9],
    [26,2,11,8],[-27,17,12,7],[-10,20,9,5],[13,18,14,7]]) {
    r(x,y,w,h,0x55604d);
    r(x,y,w,2,0xa2ad85);
    r(x+2,y+h-2,w-2,2,0x394337);
  }
  // A short wedge of light reaches down over the chamber floor.
  for (let n = 0; n < 5; n++) {
    g.fillStyle(0xe4d59b, 0.16 - n * 0.025)
      .fillRect(cx - 20 - n * 3, cy + 20 + n * 4, 40 + n * 6, 4);
  }
  return g;
}

/* ── The morning hill ─────────────────────────────────────────────────────
   The mound stands open behind you; the treasure lies out on the grass.     */
export function drawBarrowhillScenery(scene, blades = true) {
  if (scene.zoneKey !== 'barrowhill') return;
  const g = scene.add.graphics().setDepth(11 * 16 + 30);
  const r = (x, y, w, h, col, a = 1) => g.fillStyle(col, a).fillRect(x, y, w, h);
  // The roof has been torn back off the south face of the mound: a ragged
  // dark mouth with turf flaps hanging over it and the roof stones tumbled.
  const mx = 17 * 16 + 8,
    my = 11 * 16 + 4;
  for (let n = 0; n < 22; n++) {
    const w = 46 - Math.abs(n - 8) * 2 - Math.round(rand(n, 3) * 6);
    r(mx - w / 2, my - 22 + n, w, 1, n < 4 ? 0x1d2620 : 0x080c0b);
  }
  for (let n = 0; n < 9; n++) {
    const x = mx - 26 + n * 6;
    r(x, my - 26 + Math.round(rand(n, 7) * 5), 6, 7, 0x6a7551);
    r(x, my - 26 + Math.round(rand(n, 7) * 5), 6, 2, 0x94a071);
  }
  for (const [dx, dy, w, h] of [
    [-34, -20, 13, 9],
    [24, -16, 14, 8],
    [-14, 2, 11, 7],
    [10, 4, 15, 8],
    [-30, 4, 9, 6],
  ]) {
    r(mx + dx, my + dy, w, h, 0x4c5750);
    r(mx + dx, my + dy, w, 2, 0x99a698);
    r(mx + dx + 2, my + dy + h - 2, w - 4, 2, 0x2e3733);
  }
  for (let n = 0; n < 18; n++)
    r(
      mx - 40 + ((n * 23) % 80),
      my + 4 + ((n * 11) % 14),
      3 + (n % 3),
      2,
      n % 2 ? 0x7a8560 : 0x5d6849,
    );

  // Tom's spread of treasure, out on the turf where anyone could take it.
  const gx = 24 * 16,
    gy = 16 * 16 + 8;
  const spread = scene.add.graphics().setDepth(gy + 2);
  const t = (x, y, w, h, col, a = 1) => spread.fillStyle(col, a).fillRect(x, y, w, h);
  t(gx - 26, gy - 8, 58, 18, 0x5d6742, 0.45);
  for (let n = 0; n < 54; n++) {
    const x = gx - 24 + Math.round(rand(n, 1) * 54),
      y = gy - 6 + Math.round(rand(n, 2) * 14);
    t(x, y, 3, 2, n % 3 ? 0xd8bd61 : 0xa8b3ab);
    t(x, y, 1, 1, n % 3 ? 0xf6e6a2 : 0xe1e8e0);
  }
  for (let n = 0; n < 3; n++) {
    t(gx - 18 + n * 18, gy - 4, 15, 4, 0x6b5c33);
    t(gx - 18 + n * 18, gy - 4, 15, 1, 0xe0c470);
  }
  // Four blades stood point-down in the turf, waiting to be picked up — and
  // gone from the ground once each hobbit is carrying one.
  const bladeArt = scene.add.graphics().setDepth(gy + 3).setVisible(blades);
  const blade = (x, y, w, h, col) => bladeArt.fillStyle(col).fillRect(x, y, w, h);
  for (let n = 0; n < 4; n++) {
    const x = gx - 20 + n * 14;
    blade(x - 1, gy - 28, 5, 4, 0x8b7541);
    blade(x - 1, gy - 28, 5, 1, 0xd8bd61);
    blade(x, gy - 25, 3, 8, 0x5d4a2c);
    blade(x - 3, gy - 17, 9, 3, 0x8b7541);
    blade(x - 3, gy - 17, 9, 1, 0xd8bd61);
    blade(x, gy - 14, 3, 16, 0xc7d8c0);
    blade(x, gy - 14, 1, 16, 0xeef5e8);
  }
  // Sunlight after a night underground: a warm wash and a few drifting seeds.
  scene.add
    .rectangle(480, 360, 320, 240, 0xffe9b0)
    .setScrollFactor(0)
    .setDepth(830)
    .setAlpha(0.09);
  for (let i = 0; i < 14; i++) {
    const seed = scene.add
      .rectangle(((i * 137) % 640) + 40, ((i * 91) % 420) + 40, 2, 2, 0xfdf6d2, 0.7)
      .setDepth(700);
    scene.tweens.add({
      targets: seed,
      x: seed.x + 60,
      y: seed.y - 34,
      alpha: 0,
      duration: 6000 + i * 211,
      delay: i * 240,
      repeat: -1,
    });
  }
  return bladeArt;
}

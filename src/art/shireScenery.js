// The Shire, the Woody End and the Marish are shaded as country rather than
// as tilework. Two baked layers do it:
//
//   ground  — one image under everything: the roll of The Hill, turf that
//             rolls over the lip of every bank, lanes with worn irregular
//             edges instead of sixteen-pixel stairs, damp river margins and
//             every cast shadow.
//   canopy  — the woods, cut into one image band per tile row so a hobbit
//             walks behind a crown and in front of the trunk beneath it.
//
// Nothing here changes collision: ground ink is confined to open tiles plus
// the bank tiles it shades, and every crown fills the solid cell it grows
// from before it is allowed to overhang.
import { T } from '../data/tileTypes.js';
import { maskOf, sample, wobble, hash, step } from './relief.js';

export const SHIRE_ZONES = new Set(['shire', 'woodyend', 'marish']);

/* ── palettes ─────────────────────────────────────────────────────────────
   Short opaque ramps. Index 0-1 of each is its own shadow, so a cast shadow
   is a step down the same ramp rather than a new blended colour.          */
const MEADOW = [0x2d5520, 0x356328, 0x3d722b, 0x447f2c, 0x4a8a31, 0x519436, 0x59a03c];
const TURF = [0x2f5b26, 0x33612a, 0x3a7029, 0x46812f, 0x529136, 0x5fa03f, 0x6cae49];
const EARTH = [0x3c2a14, 0x4a3418, 0x5a4020, 0x6b4d28, 0x7a5d30, 0x8a6b3d, 0x9a7b4d];
const ROAD = [0x6e5c36, 0x826d3e, 0x9c854b, 0xa88c4e, 0xb89a5c, 0xc4a265, 0xd2b076];
const MIRE = [0x33481f, 0x3d5726, 0x46632a, 0x527232, 0x5e5430, 0x6a6438, 0x7a8a54];
const SHINGLE = [0x8e8a63, 0xa9a279, 0xc0b88e];
const BLOSSOM = [0xd8484a, 0xe2d04c, 0xc668c4, 0xefeade];

// Leaf ramps for the canopy layer: dark rim, body, lit crown.
const GREENWOOD = [0x0d2110, 0x142d14, 0x1c3c18, 0x254c1e, 0x2f5e25, 0x3c7130, 0x4d873c];
const AUTUMN = [0x1d2109, 0x2a2c0d, 0x3a3a12, 0x4c4917, 0x64591d, 0x7f6f26, 0x9a8833];
const BARK = [0x2a1b0d, 0x412a14, 0x5a3a1c, 0x74512a, 0x8d6738];

const OPEN = new Set([T.GRASS, T.GRASS2, T.PATH, T.HILLTOP, T.BOG, T.FLOWERS]);
// The woods are painted too: the ground bake lays shaded woodland floor
// under every tree cell, and the canopy strips draw the trees themselves.
const PAINTED = new Set([...OPEN, T.HILL, T.TREE, T.TREE2]);
const WOODS = new Set([T.TREE, T.TREE2]);
// Anything with real bulk standing on the ground throws a shadow south.
const CASTERS = new Set([
  T.MOUND_L, T.MOUND_R, T.BASE_L, T.BASE_R, T.ROOF, T.ROOF_L, T.ROOF_R,
  T.DOOR, T.WINDOW_F, T.STONE, T.BARN, T.WAGGON, T.WELL, T.CRATE,
  T.PAV_TL, T.PAV_TR, T.PAV_BL, T.PAV_BR, T.PARTY_BL, T.PARTY_BR,
  T.REEDS, T.BUSH, T.SIGN, T.LANTERN, T.PARTY_TABLE, T.FEAST,
]);

/* ── the ground layer ─────────────────────────────────────────────────── */

/**
 * Pure bake — used by the canvas renderer and by the palette/collision tests.
 * @param {number[][]} map
 * @returns {{ width: number, height: number, pixels: Uint8ClampedArray }}
 */
export function bakeShireGround(map) {
  const cols = map[0].length,
    rows = map.length;
  const width = cols * 16,
    height = rows * 16;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const plateau = maskOf(map, (t) => t === T.HILLTOP);
  const bank = maskOf(map, (t) => t === T.HILL);
  const lane = maskOf(map, (t) => t === T.PATH);
  const mire = maskOf(map, (t) => t === T.BOG);
  const river = maskOf(map, (t) => t === T.WATER);
  const wood = maskOf(map, (t) => WOODS.has(t));
  const built = maskOf(map, (t) => CASTERS.has(t));

  const ink = (x, y, color) => {
    const i = (y * width + x) * 4;
    pixels[i] = color >> 16;
    pixels[i + 1] = (color >> 8) & 255;
    pixels[i + 2] = color & 255;
    pixels[i + 3] = 255;
  };

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const tile = map[y >> 4][x >> 4];
      if (!PAINTED.has(tile)) continue;
      const fx = x / 16 - 0.5,
        fy = y / 16 - 0.5;
      // Two-pixel clusters fray every outline; never a screen of single noise.
      const g = wobble(x & ~1, y & ~1, 26, 20, 11) * 0.06;
      // Keep the middle of every cell honest: smoothing may round a corner,
      // but a bank centre must never be painted as open turf, nor a walkable
      // centre as a bank. The correction fades out towards the tile edges.
      const core = Math.max(0, 1 - Math.max(Math.abs((x & 15) - 8), Math.abs((y & 15) - 8)) / 7);
      const patch = wobble(x & ~3, y & ~1, 70, 46, 37);
      const p = sample(plateau, fx, fy) + g;

      let color;
      if (tile === T.HILL) {
        // A cut earth bank. The turf of the field above rolls over its lip,
        // so grass, not a hard edge, meets the sky side of the bank. The
        // threshold tightens towards the middle of the cell: a bank centre is
        // always earth, so a solid cell can never be mistaken for a lawn.
        const lip = p - core * 0.3;
        if (lip > 0.26) color = TURF[lip > 0.4 ? 5 : 4];
        else {
          const drop = Math.min(1, (0.26 - lip) / 0.3);
          color = drop < 0.18 ? EARTH[1] : EARTH[step(2 + Math.floor(drop * 3) + (patch > 0.16 ? 1 : 0), 6)];
        }
      } else if (tile === T.HILLTOP) {
        // The high field: lit, and falling off in tone towards its own lip.
        const lift = Math.min(1, Math.max(0, (p - 0.42) / 0.38));
        color = TURF[step(3 + Math.round(lift * 3) + (patch > 0.16 ? 1 : -1) * (patch > 0.16 || patch < -0.2 ? 1 : 0), 6)];
      } else if (tile === T.BOG) {
        color = MIRE[step(2 + (patch > 0.12 ? 1 : 0) + (patch > 0.3 ? 1 : 0) + (patch < -0.18 ? -1 : 0), 6)];
      } else if (WOODS.has(tile)) {
        // Leaf litter under the woods. The crown that grows from this cell is
        // drawn in the canopy strip; what shows past it is floor, not a lawn.
        color = MEADOW[step(1 + (patch > 0.2 ? 1 : 0) + (patch < -0.22 ? -1 : 0), 6)];
      } else {
        color = MEADOW[step(4 + (patch > 0.14 ? 1 : 0) + (patch > 0.32 ? 1 : 0) + (patch < -0.16 ? -1 : 0), 6)];
        // Wet ground bleeds outwards from the bog rather than stopping square.
        const m = sample(mire, fx, fy) + g * 0.5;
        if (m > 0.3) color = MIRE[step(3 + (patch > 0.18 ? 1 : 0), 6)];
      }

      // The lanes: opaque worn ribbons, so no alpha fringe can reveal the old
      // square tiles underneath. Banks keep their earth face.
      if (tile !== T.HILL && !WOODS.has(tile)) {
        const c = sample(lane, fx, fy) + g * 0.5;
        if (c > 0.34 || (tile === T.PATH && core > 0.35))
          color = ROAD[step(4 + (c < 0.42 ? -1 : 0) + (patch > 0.12 ? 1 : 0) + (patch > 0.3 ? 1 : 0), 6)];
      }

      // Damp shingle where the ground runs down into water.
      const w = sample(river, fx, fy) + g * 0.5;
      if (w > 0.12 && tile !== T.HILL && !WOODS.has(tile))
        color = SHINGLE[w > 0.3 ? 0 : w > 0.2 ? 1 : 2];

      // Cast shadow: the bank above, the woods, and anything built. All three
      // fall to the south-east, so the whole zone reads as one hour of day.
      let dark = 0;
      if (tile !== T.HILL && tile !== T.HILLTOP && !WOODS.has(tile)) {
        const over = sample(bank, fx - 0.1, fy - 0.45) + sample(plateau, fx - 0.1, fy - 0.45) * 0.4;
        if (over > 0.5) dark = 2;
        else if (over > 0.25) dark = 1;
      }
      if (!WOODS.has(tile)) {
        const shade = sample(wood, fx - 0.14, fy - 0.42) + sample(built, fx - 0.14, fy - 0.4);
        if (shade > 0.46) dark = Math.max(dark, 2);
        else if (shade > 0.22) dark = Math.max(dark, 1);
      }
      if (dark) color = shadeOf(color, dark);
      ink(x, y, color);
    }

  // Tufts, clover and blossom. Sparse asymmetric clusters with quiet ground
  // between them: the lanes stay easy to read at a glance.
  for (let y = 5; y < height - 5; y += 6)
    for (let x = 5; x < width - 5; x += 8) {
      const seed = hash(x, y, 89) + 0.5;
      const cx = x + Math.floor(seed * 5),
        cy = y + Math.floor((hash(y, x, 23) + 0.5) * 4);
      const tile = map[cy >> 4][cx >> 4];
      if (tile !== T.GRASS && tile !== T.GRASS2 && tile !== T.FLOWERS && tile !== T.HILLTOP) continue;
      if (sample(lane, cx / 16 - 0.5, cy / 16 - 0.5) > 0.16) continue;
      const flower = tile === T.FLOWERS;
      if (!flower && seed > 0.22) continue;
      const blade = tile === T.HILLTOP ? TURF[2] : MEADOW[2];
      const tip = tile === T.HILLTOP ? TURF[6] : MEADOW[6];
      const marks = flower
        ? [[-2, 0, blade], [0, 0, blade], [2, 0, blade], [-2, -2, BLOSSOM[(cx + cy) % 4]],
          [0, -3, BLOSSOM[(cx * 3 + cy) % 4]], [2, -2, BLOSSOM[(cx + cy * 5) % 4]], [1, -1, tip]]
        : [[-2, 0, blade], [-1, -1, tip], [0, 0, blade], [1, -2, tip], [1, -1, tip], [2, 0, blade]];
      for (const [dx, dy, col] of marks) {
        const px = cx + dx,
          py = cy + dy;
        if (map[py >> 4]?.[px >> 4] === tile) ink(px, py, col);
      }
    }
  return { width, height, pixels };
}

// A shadow is a step down whichever ramp the pixel already belongs to, so the
// palette never grows and a shaded lane still reads as lane.
function shadeOf(color, amount) {
  for (const ramp of [MEADOW, TURF, EARTH, ROAD, MIRE]) {
    const i = ramp.indexOf(color);
    if (i >= 0) return ramp[step(i - amount, ramp.length - 1)];
  }
  return color;
}


/* ── the canopy layer ─────────────────────────────────────────────────────
   Woods are baked into one strip per tile row. A strip holds only the trees
   rooted in that row, so it can be drawn at that row's depth: a hobbit north
   of a tree is covered by its crown, one south of it walks in front. Crowns
   rise at most RISE pixels above their own cell — enough to read as canopy,
   never enough to look like a wall over the lane.                          */
const RISE = 32;
const STRIP_H = RISE + 16;

// One tree: a round crown over a short trunk, with a shadow pool at the foot
// so the cell it stands in never reads as open ground. Crowns of neighbouring
// cells swell towards each other, so a grove becomes one leaf mass while a
// tree standing alone keeps its own outline.
function tree(paint, map, tx, ty) {
  const leaves = map[ty][tx] === T.TREE2 ? AUTUMN : GREENWOOD;
  const seed = Math.abs(Math.round(hash(tx, ty, 5) * 1000));
  const cx = tx * 16 + 8;
  const base = ty * 16 + 16;
  const near = (dx, dy) => WOODS.has(map[ty + dy]?.[tx + dx]);
  const rx = 11 + (near(-1, 0) ? 2 : 0) + (near(1, 0) ? 2 : 0) + (seed % 2);
  const cy = base - 14 - (seed % 3);
  const ry = 11 + (seed % 3) + (near(0, -1) ? 4 : 0);

  // Roots and the shadow they sit in, filling the foot of the cell.
  paint(cx - 8, base - 5, 16, 4, leaves[0]);
  paint(cx - 6, base - 3, 12, 3, MEADOW[0]);
  const lean = (seed % 3) - 1;
  paint(cx - 3, base - 12, 6, 8, BARK[0]);
  paint(cx - 2 + lean, base - 15, 4, 8, BARK[2]);
  paint(cx - 1 + lean, base - 14, 2, 7, BARK[4]);

  // Stepped ellipse — a crown, never a smooth circle.
  for (let dy = -ry; dy <= ry; dy += 2) {
    const k = Math.sqrt(Math.max(0, 1 - (dy / ry) * (dy / ry)));
    const jog = Math.round(hash(dy, seed, 17) * 3);
    const w = Math.round(rx * k) + (k > 0.55 ? jog : 0);
    if (w < 2) continue;
    const t = (dy + ry) / (2 * ry); // 0 at the crown, 1 at the underside
    paint(cx - w, cy + dy, w * 2, 2, leaves[0]);
    paint(cx - w + 2, cy + dy, w * 2 - 4, 2, leaves[t > 0.6 ? 1 : t > 0.28 ? 2 : 3]);
  }
  // Lit leaf masses towards the north-west; flecks only at their edges.
  for (let n = 0; n < 5; n++) {
    const dx = Math.round(hash(seed, n, 3) * 12) - 3;
    const dy = Math.round(hash(n, seed, 9) * 12) - 4;
    if (dx * dx * 1.6 + dy * dy > ry * ry) continue;
    paint(cx + dx - 3, cy + dy, 3 + (n % 3), 2, leaves[4 + (n % 2)]);
    if (n % 3 === 0) paint(cx + dx - 2, cy + dy - 1, 2, 1, leaves[6]);
  }
}

/**
 * Pure bake of the woods, one strip per tile row that holds any.
 * @param {number[][]} map
 * @returns {{ row: number, y0: number, width: number, height: number,
 *             pixels: Uint8ClampedArray }[]}
 */
export function bakeShireCanopy(map) {
  const width = map[0].length * 16;
  const strips = [];
  for (let ty = 0; ty < map.length; ty++) {
    if (!map[ty].some((t) => WOODS.has(t))) continue;
    const y0 = ty * 16 - RISE;
    const pixels = new Uint8ClampedArray(width * STRIP_H * 4);
    // Ink is clipped to the strip, and sideways to the cell and its
    // neighbours, so no crown ever reaches across open ground.
    const paint = (x, y, w, h, color, tx) => {
      const left = Math.max(0, Math.round(x), tx * 16 - 13);
      const right = Math.min(width, Math.round(x + w), tx * 16 + 29);
      const top = Math.max(0, Math.round(y) - y0);
      const bottom = Math.min(STRIP_H, Math.round(y + h) - y0);
      for (let py = top; py < bottom; py++)
        for (let px = left; px < right; px++) {
          const i = (py * width + px) * 4;
          pixels[i] = color >> 16;
          pixels[i + 1] = (color >> 8) & 255;
          pixels[i + 2] = color & 255;
          pixels[i + 3] = 255;
        }
    };
    for (let tx = 0; tx < map[ty].length; tx++) {
      if (!WOODS.has(map[ty][tx])) continue;
      tree((x, y, w, h, color) => paint(x, y, w, h, color, tx), map, tx, ty);
    }
    strips.push({ row: ty, y0, width, height: STRIP_H, pixels });
  }
  return strips;
}

/* ── landmarks ────────────────────────────────────────────────────────────
   Drawn as graphics rather than baked, so the one tree in the Shire that is
   a landmark can be as tall as it deserves and still sort against a hobbit
   standing under it.                                                       */
function partyTree(scene, tx, ty) {
  // Rooted in the bottom row of the 2×3 composite; the crown covers the rest.
  const cx = tx * 16 + 16,
    base = (ty + 3) * 16;
  const g = scene.add.graphics().setDepth(base - 1);
  const r = (x, y, w, h, color, alpha = 1) =>
    g.fillStyle(color, alpha).fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  // Shadow pool and root flare fill the solid cells the crown cannot reach.
  r(cx - 17, base - 12, 34, 11, 0x2d5520);
  r(cx - 14, base - 15, 28, 6, 0x356328);
  r(cx - 11, base - 26, 22, 24, BARK[0]);
  r(cx - 9, base - 25, 13, 23, BARK[2]);
  r(cx - 7, base - 24, 5, 22, BARK[4]);
  r(cx + 5, base - 22, 4, 19, BARK[0]);
  for (let yy = base - 74; yy < base - 20; yy += 2) {
    const t = (yy - (base - 74)) / 54;
    const swell = t < 0.6 ? Math.sin(t * 2.6) : 1 - (t - 0.6) * 0.55;
    const w = Math.round(26 * swell) + Math.round(hash(yy, 7, 21) * 5);
    if (w <= 1) continue;
    r(cx - w, yy, w * 2, 2, GREENWOOD[t < 0.1 ? 1 : 0]);
    r(cx - w + 3, yy, w * 2 - 6, 2, GREENWOOD[t < 0.78 ? 3 : 2]);
  }
  for (let n = 0; n < 26; n++) {
    const dx = Math.round(hash(n, 41, 3) * 38);
    const dy = Math.round(hash(41, n, 9) * 40);
    r(cx + dx - 4, base - 52 + dy, 6 + (n % 3), 2, GREENWOOD[4 + (n % 3)]);
  }
  return g;
}

/* ── scene wiring ─────────────────────────────────────────────────────── */

function texture(scene, key, { width, height, pixels }) {
  if (scene.textures.exists(key)) return;
  const canvas = scene.textures.createCanvas(key, width, height);
  const ctx = canvas.getContext();
  const image = ctx.createImageData(width, height);
  image.data.set(pixels);
  ctx.putImageData(image, 0, 0);
  canvas.refresh();
}

/** Ground under everything; woods in row strips that sort against the party. */
export function drawShireScenery(scene) {
  if (!SHIRE_ZONES.has(scene.zoneKey)) return;
  const map = scene.zone.map;
  const groundKey = `shire-ground-${scene.zoneKey}`;
  texture(scene, groundKey, bakeShireGround(map));
  scene.add.image(0, 0, groundKey).setOrigin(0).setDepth(3);

  for (const strip of bakeShireCanopy(map)) {
    const key = `shire-canopy-${scene.zoneKey}-${strip.row}`;
    texture(scene, key, strip);
    scene.add
      .image(0, strip.y0, key)
      .setOrigin(0)
      // The bottom of the row the trees stand in: a hobbit one row further
      // south has a greater depth and walks in front.
      .setDepth(strip.row * 16 + 15);
  }

  for (let y = 0; y < map.length; y++)
    for (let x = 0; x < map[y].length; x++)
      if (map[y][x] === T.PARTY_NL) partyTree(scene, x, y);
}

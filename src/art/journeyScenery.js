// One-time, seeded scenery. All tree ink is clipped to existing solid tiles:
// broad crowns never cover a walkable path or imply a new invisible collider.
import { T } from '../data/tileTypes.js';

// The Barrow-downs have their own renderer in downsScenery.js.
const FORESTS = new Set(['forestgate', 'forestheart', 'withywindle']);
const WOOD = new Set([T.OLD_TREE, T.DEAD_TREE]);
const noise = (x, y) => ((Math.imul(x + 713, 374761393) ^ Math.imul(y + 91, 668265263)) >>> 0) / 4294967296;

export function drawJourneyScenery(scene) {
  const map = scene.zone.map;
  const rows = map.length, cols = map[0].length;
  const forest = FORESTS.has(scene.zoneKey);
  if (!forest) return;
  const textureKey = `journey-scenery-${scene.zoneKey}`;
  if (forest && scene.textures.exists(textureKey)) {
    scene.add.image(0, 0, textureKey).setOrigin(0).setDepth(2);
    return;
  }
  const g = scene.add.graphics().setDepth(2);
  const ink = (x, y, w, h, color) => {
    g.fillStyle(color).fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  // Intersect each brush mark with the tile mask. Canopy contours remain
  // irregular; no geometry ever spills over the centre of a trail.
  function woodInk(x, y, w, h, color) {
    x = Math.round(x); y = Math.round(y);
    for (let ty = Math.max(0, Math.floor(y / 16)); ty <= Math.min(rows - 1, Math.floor((y + h - 1) / 16)); ty++) {
      for (let tx = Math.max(0, Math.floor(x / 16)); tx <= Math.min(cols - 1, Math.floor((x + w - 1) / 16)); tx++) {
        if (!WOOD.has(map[ty][tx])) continue;
        const left = Math.max(x, tx * 16), top = Math.max(y, ty * 16);
        const right = Math.min(x + w, tx * 16 + 16), bottom = Math.min(y + h, ty * 16 + 16);
        ink(left, top, right - left, bottom - top, color);
      }
    }
  }
  // Horizontal stepped brush bands, deliberately not smooth circles.
  function crown(x, y, r, seed) {
    const palette = [0x182c25, 0x223a2b, 0x30472e, 0x425536, 0x56643c];
    for (let band = -r; band <= r; band += 4) {
      const edge = Math.floor((r - Math.abs(band) * 0.48) / 4) * 4;
      const jog = Math.floor(noise(seed, band) * 3) * 2;
      woodInk(x - edge + jog, y + band, edge * 2 - jog, 4, palette[0]);
      if (Math.abs(band) < r - 3) woodInk(x - edge + 3 + jog, y + band, edge * 2 - 7 - jog, 4, palette[1]);
    }
    // Large leaf masses form connected light, with tiny flecks only at edges.
    for (let n = 0; n < 15; n++) {
      const dx = Math.floor((noise(seed, n) - 0.5) * r * 1.4 / 2) * 2;
      const dy = Math.floor((noise(n, seed) - 0.65) * r * 1.25 / 2) * 2;
      woodInk(x + dx, y + dy, 6 + n % 3 * 2, 4, palette[2 + n % 3]);
      if (n % 3 === 0) woodInk(x + dx + 1, y + dy, 3, 1, 0x7b7d49);
    }
  }
  function trunk(x, base, tall, seed) {
    const width = 8 + seed % 5;
    woodInk(x - width, base - tall, width * 2, tall, 0x252c21);
    woodInk(x - width + 2, base - tall + 2, width - 1, tall - 3, 0x645d40);
    woodInk(x - width + 4, base - tall + 5, 3, tall - 8, 0x89774e);
    woodInk(x + 2, base - tall + 3, 3, tall - 2, 0x3d412c);
    // Root flare and crooked branches are stair-stepped into the same mask.
    for (let n = 0; n < 5; n++) {
      woodInk(x - width - n * 3, base - 8 + n, 6, 3, 0x5c573a);
      woodInk(x + width - 3 + n * 3, base - 9 + n, 5, 3, 0x393e2b);
      woodInk(x - width - n * 3, base - tall + 12 - n * 3, 5, 5, 0x5c573a);
      woodInk(x + width + n * 2, base - tall + 17 - n * 3, 4, 5, 0x393e2b);
    }
    for (let n = 0; n < 7; n++) {
      const y = base - 5 - Math.floor(noise(seed, n) * (tall - 9));
      woodInk(x - width + 1, y, 3 + n % 3, 3, n % 2 ? 0x637444 : 0x3f5936);
    }
    woodInk(x + 1, base - 17, 4, 7, 0x18271f);
  }
  if (forest) {
    // Erase the repeated orchard sprites; their original colliders are kept.
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (WOOD.has(map[y][x])) ink(x * 16, y * 16, 16, 16, 0x263b29);
    }
    // Offset the rows so neighboring broadleaf crowns interlock. Some long
    // trunks emerge between crowns, giving depth rather than a tiled orchard.
    for (let y = 0; y < rows + 4; y += 3) {
      for (let x = -2; x < cols + 3; x += 3) {
        const seed = Math.floor(noise(x, y) * 10000);
        const cx = x * 16 + 24 + (y % 2) * 19 + seed % 11;
        const base = y * 16 + 43 + seed % 13;
        const tall = 37 + seed % 19;
        trunk(cx, base, tall, seed);
        crown(cx - 6, base - tall - 3, 22 + seed % 7, seed);
        crown(cx + 15, base - tall + 2, 15 + seed % 5, seed + 5);
      }
    }
    // Dead trees retain their character when they border open ground.
    for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) {
      if (map[y][x] === T.DEAD_TREE && noise(x, y) > 0.65) trunk(x * 16 + 8, y * 16 + 15, 25, x + y);
      if (![T.FOREST_FLOOR, T.ROOTS].includes(map[y][x])) continue;
      const sides = [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dx, dy]) => WOOD.has(map[y + dy][x + dx]));
      if (!sides.length || noise(x, y) < 0.45) continue;
      const [dx, dy] = sides[0];
      const px = x * 16 + 7 + dx * 6, py = y * 16 + 7 + dy * 6;
      if (noise(y, x) > 0.75) {
        ink(px, py, 1, 3, 0xc4b995);
        ink(px - 1, py - 1, 3, 2, 0xbc884f);
        ink(px, py - 1, 1, 1, 0xe0bb79);
      } else {
        ink(px, py - 2, 1, 5, 0x657b43);
        ink(px - 2, py - 1, 5, 1, 0x748850);
        ink(px - 1, py + 1, 3, 1, 0x4d663b);
      }
    }
    if (scene.zoneKey === 'forestgate') {
      // Bonfire remains are low ground dressing; the interaction stays open.
      for (const [dx, dy] of [[-35, -25], [27, -28], [-24, 30], [39, 20]]) {
        const x = 16 * 16 + dx, y = 14 * 16 + dy;
        ink(x - 6, y + 3, 15, 3, 0x454832);
        ink(x - 3, y - 3, 8, 8, 0x302d24);
        ink(x - 2, y - 4, 7, 2, 0x85816a);
        ink(x, y - 3, 2, 5, 0x4c4433);
        ink(x - 7, y + 7, 3, 1, 0x8b8266);
        ink(x + 10, y + 4, 2, 1, 0xaaa084);
      }
    }
    if (scene.zoneKey === 'forestheart') mound(18 * 16 + 8, 18 * 16 + 8, 48, true);
  }
  function mound(cx, cy, size, green = false) {
    // Low relief contour strokes leave the top and all approach paths open.
    const colors = green ? [0x70835a, 0x8b9b6d, 0xa4ae7c] : [0x727f66, 0x94a084, 0xb0b599];
    for (let n = 0; n < 4; n++) {
      const half = Math.max(9, size - n * 8), y = cy + 18 - n * 7;
      ink(cx - half, y, 9, 2, colors[n % 3]);
      ink(cx + half - 9, y, 9, 2, colors[n % 3]);
      ink(cx - half + 7, y + 2, half * 2 - 14, 1, colors[0]);
    }
    for (let n = 0; n < 12; n++) {
      const x = cx - size + Math.floor(noise(n, cx) * size * 2);
      const y = cy + 19 + Math.floor(noise(cy, n) * 10);
      ink(x, y, 3, 1, colors[1]);
    }
  }
  if (forest) {
    g.generateTexture(textureKey, cols * 16, rows * 16);
    g.destroy();
    scene.add.image(0, 0, textureKey).setOrigin(0).setDepth(2);
  }

}

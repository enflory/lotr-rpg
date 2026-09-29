import { T } from '../data/tileTypes.js';

// Coordinate noise stays fixed across visits, with no repeating tile stamp.
const noise = (x, y, salt = 0) => {
  let n = Math.imul(x + salt * 23, 374761393) ^ Math.imul(y + salt, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
};
export function drawBreeGround(s) {
  const g = s.add.graphics().setDepth(1);
  const map = s.zone.map;
  const road = (x, y) => map[y]?.[x] === T.PATH;
  const grass = (x, y) => map[y]?.[x] === T.DOWN_GRASS;
  const town = s.zoneKey === 'bree';
  const r = (x, y, w, h, color) => g.fillStyle(color).fillRect(x, y, w, h);
  map.forEach((row, ty) =>
    row.forEach((tile, tx) => {
      const x = tx * 16,
        y = ty * 16;
      if (tile === T.DOWN_GRASS || tile === T.LANTERN) {
        r(x, y, 16, 16, 0x687451);
        // Short blades, moss and leaf litter sit in broad, quiet colour patches.
        for (let i = 0; i < 5; i++) {
          const n = noise(tx, ty, i),
            dx = n % 14,
            dy = (n >>> 8) % 14;
          const colors = [0x606d4b, 0x73805a, 0x78825b, 0x5b6b48];
          r(x + dx, y + dy, 2 + (n % 3), 1, colors[n % 4]);
          if (i === 0 && n % 3 === 0) r(x + dx + 1, y + dy - 1, 1, 2, 0x879064);
        }
      }
      if (tile !== T.PATH) return;
      r(x, y, 16, 16, town ? 0x95856a : 0xa0916c);
      // Irregular small setts in Bree, scattered pebbles on the open road.
      for (let i = 0; i < (town ? 4 : 2); i++) {
        const n = noise(tx, ty, i + 12),
          dx = n % 11,
          dy = (n >>> 8) % 12;
        const w = town ? 3 + (n % 5) : 2 + (n % 2),
          h = town ? 2 + ((n >>> 4) % 3) : 1;
        r(x + dx, y + dy + h, w, 1, town ? 0x8b7e67 : 0x8d805e);
        r(x + dx, y + dy, w, h, [0xa19880, 0x9d947e, 0x938b75, 0xa69b80][n % 4]);
        if (town) r(x + dx + 1, y + dy, w - 1, 1, 0xaaa087);
      }
      // Broken verges soften the grid while keeping all visual road inside
      // the walkable map. Adjacent path tiles never acquire interior seams.
      for (let offset = 0; offset < 16; offset += 2) {
        const d = 1 + (noise(x + offset, y, 8) % 4);
        if (grass(tx, ty - 1)) r(x + offset, y, 2, d, 0x687451);
        if (grass(tx, ty + 1)) r(x + offset, y + 16 - d, 2, d, 0x687451);
        if (grass(tx - 1, ty)) r(x, y + offset, d, 2, 0x687451);
        if (grass(tx + 1, ty)) r(x + 16 - d, y + offset, d, 2, 0x687451);
      }
      if (!town && road(tx - 1, ty) && road(tx + 1, ty)) {
        // Interrupted wheel wear, not a solid ruler-straight stripe.
        const n = noise(tx, ty, 27);
        r(x, y + 5 + (n % 2), 9 + (n % 6), 1, 0x968763);
        r(x + 3, y + 12, 10, 1, 0x968763);
      }
    }),
  );
}

function furniture(s) {
  const map = s.zone.map;
  map.forEach((row, ty) =>
    row.forEach((tile, tx) => {
      if (![T.TABLE, T.FIREPLACE].includes(tile) || row[tx - 1] === tile) return;
      let length = 1;
      while (row[tx + length] === tile) length++;
      const x = tx * 16,
        y = ty * 16,
        w = length * 16;
      const g = s.add.graphics().setDepth(y + 10);
      const r = (dx, dy, width, height, c) =>
        g.fillStyle(c).fillRect(x + dx, y + dy, width, height);
      if (tile === T.TABLE) {
        r(0, 0, w, 16, 0x64472d);
        r(0, 0, w, 2, 0xc09959);
        r(2, 2, w - 4, 9, 0x9a713f);
        r(2, 5, w - 4, 1, 0xb68a4c);
        r(1, 12, w - 2, 2, 0x4a3425);
        r(3, 14, 3, 2, 0x30281e);
        r(w - 6, 14, 3, 2, 0x30281e);
        // A small jug on the edge leaves the supper plates unobstructed.
        r(w - 9, 2, 4, 5, 0xc8b58a);
        r(w - 8, 1, 2, 1, 0xede0b8);
        r(w - 5, 3, 2, 3, 0x756042);
        return;
      }
      r(0, 0, w, 16, 0x817563);
      r(2, 1, w - 4, 3, 0xaca087);
      r(6, 4, w - 12, 11, 0x2e2925);
      r(0, 14, w, 2, 0x655947);
      r(9, 12, w - 18, 2, 0x5c3826);
      r(0, 0, w, 2, 0xc0a47c);
      const fire = s.add.graphics().setDepth(y + 11);
      for (let i = 0; i < 5; i++) {
        const dx = x + 10 + i * 6;
        fire.fillStyle(0xaf562e).fillRect(dx, y + 8, 5, 5);
        fire.fillStyle(0xe8983f).fillRect(dx + 1, y + 6 + (i % 3), 3, 6 - (i % 3));
        fire.fillStyle(0xf8d584).fillRect(dx + 2, y + 9, 1, 3);
      }
      s.tweens.add({ targets: fire, alpha: 0.65, duration: 750, yoyo: true, repeat: -1 });
    }),
  );
}

export function drawBreeInterior(s) {
  const g = s.add.graphics().setDepth(1);
  const r = (x, y, w, h, c, a = 1) => g.fillStyle(c, a).fillRect(x, y, w, h);
  s.zone.map.forEach((row, ty) =>
    row.forEach((tile, tx) => {
      const x = tx * 16,
        y = ty * 16;
      if (tile === T.FLOOR) {
        for (let i = 0; i < 4; i++) {
          const n = noise(tx, ty * 4 + i);
          r(x, y + i * 4, 16, 4, [0x806040, 0x886744, 0x795a3d, 0x8e6c46][n % 4]);
          r(x, y + i * 4 + 3, 16, 1, 0x60472f);
          if (n % 3 === 0) r(x + (n % 12), y + i * 4, 1, 3, 0x5c4530);
          if (n % 4 === 0) r(x + 3, y + i * 4 + 1, 7, 1, 0x99744b);
        }
        if (tx === 1 || tx === s.mapWidth - 2) r(x, y, 16, 16, 0x211e1a, 0.14);
      }
      if (tile === T.WINDOW_I) {
        r(x - 1, y + 17, 18, 24, 0xf6d997, 0.05);
      }
    }),
  );
  const trim = s.add.graphics().setDepth(22);
  trim.fillStyle(0x322219).fillRect(16, 28, (s.mapWidth - 2) * 16, 4);
  trim.fillStyle(0xa27b4f).fillRect(16, 28, (s.mapWidth - 2) * 16, 1);
  for (let x = 2; x < s.mapWidth - 2; x += 6) {
    trim.fillStyle(0x382a20).fillRect(x * 16, 16, 4, 14);
    trim.fillStyle(0x745536).fillRect(x * 16, 16, 1, 12);
  }
  // Hearthlight stays beneath actors and furniture; it does not wash out faces.
  for (let y = 0; y < s.mapHeight; y++)
    for (let x = 0; x < s.mapWidth; x++) {
      if (s.zone.map[y][x] !== T.FIREPLACE) continue;
      const glow = s.add.ellipse(x * 16 + 8, y * 16 + 24, 44, 30, 0xffc779, 0.09).setDepth(2);
      s.tweens.add({ targets: glow, alpha: 0.045, duration: 1800, yoyo: true, repeat: -1 });
    }
  furniture(s);
  if (s.zoneKey === 'ponyparlour') {
    // A woven hearth rug makes this a small, furnished sitting room.
    r(8 * 16, 4 * 16, 4 * 16, 2 * 16, 0x5d3931);
    r(8 * 16 + 3, 4 * 16 + 3, 58, 26, 0x94654c);
    r(8 * 16 + 5, 4 * 16 + 5, 54, 22, 0x69473a);
    for (let x = 132; x < 188; x += 8) r(x, 74, 3, 3, 0xb09567);
  }
}

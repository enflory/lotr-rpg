import { gameState } from '../state/GameState.js';
import { BREE_BUILDINGS } from '../data/zones/bree.js';
import { T } from '../data/tileTypes.js';

function building(s, b) {
  const x = b.x * 16,
    foot = (b.y + b.h) * 16,
    w = b.w * 16,
    height = b.floors * 23 + 17;
  const g = s.add.graphics().setDepth(foot - 10);
  const r = (dx, dy, ww, hh, c) => g.fillStyle(c).fillRect(x + dx, foot + dy, ww, hh);
  r(5, -4, w + 7, 9, 0x18212a);
  r(0, -height, w, height, 0x514d4b);
  for (let yy = -height + 4; yy < -6; yy += 8) {
    r(0, yy, w, 1, 0x373a3c);
    for (let xx = yy % 16 === 0 ? 0 : 8; xx < w; xx += 16) r(xx, yy - 7, 1, 7, 0x65605a);
  }
  r(0, -height, w, 17, 0x3d302a);
  for (let yy = 0; yy < 15; yy += 3)
    r(-3 + yy / 3, -height - 5 + yy, w + 6 - yy / 1.5, 2, yy % 2 ? 0x705e49 : 0x5a4939);
  for (let floor = 0; floor < b.floors; floor++) {
    const yy = -22 - floor * 23;
    r(0, yy + 15, w, 3, 0x292b2a);
    for (let xx = 14; xx < w - 10; xx += 28) {
      r(xx - 2, yy - 2, 14, 14, 0x25282c);
      r(xx, yy, 10, 10, 0xc19155);
      r(xx + 1, yy + 1, 8, 7, 0xf4ce7c);
      r(xx + 4, yy, 1, 10, 0x725236);
      r(xx, yy + 4, 10, 1, 0x725236);
    }
  }
  const door = b.pony ? 6 * 16 : w / 2 - 8;
  r(door - 3, -26, 22, 26, 0x282829);
  r(door, -22, 16, 22, b.pony ? 0x1e2429 : 0x503c29);
  r(door, -22, 16, 2, 0xc99b57);
  r(door + 12, -10, 2, 2, 0xb7a064);
  if (b.pony) {
    r(door + 23, -30, 3, 29, 0x282624);
    r(door + 23, -30, 31, 3, 0x282624);
    r(door + 31, -27, 20, 24, 0x1b322b);
    r(door + 32, -26, 18, 22, 0x415545);
    // White rearing pony, deliberately distinct from the travelling pack pony.
    r(door + 36, -18, 9, 5, 0xece5c6);
    r(door + 43, -23, 3, 9, 0xece5c6);
    r(door + 43, -24, 5, 3, 0xece5c6);
    r(door + 35, -14, 2, 7, 0xece5c6);
    r(door + 41, -13, 2, 5, 0xece5c6);
    r(door + 33, -21, 2, 8, 0xc4c1ae);
  }
}
function lamp(s, x, y) {
  const glow = s.add.ellipse(x * 16 + 8, y * 16 + 10, 48, 20, 0xf3ad52, 0.12).setDepth(6);
  s.tweens.add({ targets: glow, alpha: 0.06, duration: 1450, yoyo: true, repeat: -1 });
}
export function drawBreeScenery(s) {
  const f = gameState.flags;
  const outdoor = ['breegate', 'bree', 'breeroad'].includes(s.zoneKey);
  if (outdoor) {
    // A cool night ground wash leaves the warm windows and sprites legible.
    const ground = s.add.graphics().setDepth(2);
    s.zone.map.forEach((row, y) =>
      row.forEach((t, x) => {
        const seed = (x * 43 + y * 97 + x * y * 7) % 31;
        if (t === T.DOWN_GRASS) {
          ground
            .fillStyle(seed % 3 ? 0x637052 : 0x74805d, 0.55)
            .fillRect(x * 16 + (seed % 12), y * 16 + ((seed * 7) % 13), 3, 1);
          ground
            .fillStyle(0x465740, 0.35)
            .fillRect(x * 16 + ((seed * 3) % 14), y * 16 + ((seed * 11) % 13), 2, 2);
        }
        if (t === T.PATH && s.zoneKey === 'bree') {
          ground
            .fillStyle(seed % 2 ? 0x918876 : 0x7c7566, 0.65)
            .fillRect(x * 16 + 2, y * 16 + 2, 10, 5)
            .fillRect(x * 16 + 6, y * 16 + 10, 8, 4);
          ground.fillStyle(0x585a51, 0.3).fillRect(x * 16 + 2, y * 16 + 7, 10, 1);
        }
        if (t === T.LANTERN) lamp(s, x, y);
      }),
    );
    s.add
      .rectangle(0, 0, s.mapWidth * 16, s.mapHeight * 16, 0x101f38, f.breeMorning ? 0.08 : 0.52)
      .setOrigin(0)
      .setDepth(3);
    if (s.zoneKey === 'bree') {
      BREE_BUILDINGS.forEach((b) => building(s, b));
    }
    if (s.zoneKey === 'breeroad') building(s, { x: 7, y: 3, w: 8, h: 4, floors: 1 });
    if (s.zoneKey === 'breegate') {
      const g = s.add.graphics().setDepth(211);
      g.fillStyle(0x3d3027)
        .fillRect(18 * 16, 12 * 16, 4, 55)
        .fillRect(20 * 16 - 4, 12 * 16, 4, 55);
      g.fillStyle(0x817058).fillRect(18 * 16, 12 * 16, 32, 4);
    }
  } else {
    // Beams along the far wall frame the room without obscuring walking space.
    const g = s.add.graphics().setDepth(20);
    g.fillStyle(0x322219).fillRect(16, 25, (s.mapWidth - 2) * 16, 5);
    for (let x = 3; x < s.mapWidth - 2; x += 7) g.fillStyle(0x241d18).fillRect(x * 16, 16, 4, 17);
  }
  const props = s.add.graphics().setDepth(96);
  if (s.zoneKey === 'ponyrooms' && (f.breeDecoys || f.breeMorning)) {
    for (const x of [5, 10, 15, 20]) {
      props.fillStyle(0x796046).fillRect(x * 16 + 4, 5 * 16 + 2, 8, 6);
      props.fillStyle(f.breeMorning ? 0x322721 : 0xaaa080).fillRect(x * 16 + 3, 5 * 16 + 8, 10, 5);
      if (f.breeMorning) {
        props
          .fillStyle(0xe1d6b5)
          .fillRect(x * 16 - 5, 6 * 16 + 3, 11, 3)
          .fillRect(x * 16 + 8, 6 * 16 + 9, 9, 2);
        props.lineStyle(2, 0x332a27).lineBetween(x * 16 + 2, 5 * 16 + 3, x * 16 + 13, 5 * 16 + 14);
      }
    }
  }
  return props;
}

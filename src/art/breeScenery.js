import { gameState } from '../state/GameState.js';
import { BREE_BUILDINGS } from '../data/zones/bree.js';
import { T } from '../data/tileTypes.js';
import { drawBreeGround, drawBreeInterior } from './breeTerrain.js';

function building(s, b) {
  const x = b.x * 16,
    foot = (b.y + b.h) * 16,
    w = b.w * 16;
  const height = b.h * 16,
    facade = Math.min(height - 24, b.floors * 23 + 7);
  const roof = height - facade;
  const g = s.add.graphics().setDepth(foot - 10);
  const r = (dx, dy, ww, hh, c) => g.fillStyle(c).fillRect(x + dx, foot + dy, ww, hh);
  // Paint the entire solid footprint, including the roof: no generic barn
  // tiles should poke out from behind a shorter decorative facade.
  r(0, -height, w, height, 0x3a3029);
  r(0, -facade, w, facade, 0xb0a083);
  r(0, -15, w, 15, 0x716956);
  for (let yy = -13; yy < -2; yy += 5) {
    r(0, yy + 4, w, 1, 0x4c4b40);
    for (let xx = (yy % 2) * 5 + 5; xx < w; xx += 12) r(xx, yy, 1, 4, 0x4c4b40);
  }
  // Shingled pitched roof, deep eaves, and a narrow lit ridge.
  for (let yy = 0; yy < roof; yy += 4) {
    const inset = Math.max(0, Math.floor((roof - yy) / 5));
    r(inset, -height + yy, w - inset * 2, 4, yy % 8 ? 0x65503c : 0x725b42);
    r(inset, -height + yy + 3, w - inset * 2, 1, 0x41392d);
    for (let xx = inset + (yy % 8 ? 7 : 1); xx < w - inset; xx += 13)
      r(xx, -height + yy, 1, 3, 0x89704e);
  }
  r(5, -height, w - 10, 2, 0x9a8059);
  r(0, -facade - 2, w, 4, 0x342921);
  r(0, -facade + 2, w, 3, 0x74644e);
  for (const xx of [2, w - 5]) r(xx, -facade, 3, facade, 0x413329);
  for (let floor = 0; floor < b.floors; floor++) {
    const yy = -22 - floor * 23;
    if (yy < -facade + 3) continue;
    r(0, yy + 15, w, 3, 0x4d3a2b);
    for (let xx = 14; xx < w - 10; xx += 28) {
      r(xx - 5, yy - 3, 2, 19, 0x584431);
      r(xx - 2, yy - 2, 14, 14, 0x32302a);
      r(xx, yy, 10, 10, 0xc19155);
      r(xx + 1, yy + 1, 8, 7, 0xf4ce7c);
      r(xx + 4, yy, 1, 10, 0x725236);
      r(xx, yy + 4, 10, 1, 0x725236);
      r(xx - 2, yy + 11, 14, 2, 0x82694a);
    }
  }
  const door = b.pony ? 6 * 16 : Math.floor(w / 2) - 8;
  r(door - 4, -27, 24, 27, 0x3c3027);
  r(door, -23, 16, 23, b.pony ? 0x20231f : 0x655039);
  r(door, -23, 16, 2, 0xb89c68);
  if (!b.pony) for (let xx = 3; xx < 16; xx += 4) r(door + xx, -20, 1, 19, 0x46392b);
  r(door + 12, -10, 2, 2, 0xdbc387);
  r(door - 2, -2, 20, 2, 0xa1977b);
  // Small leaded window reflections on the ground, below passing characters.
  const light = s.add.graphics().setDepth(2);
  light.fillStyle(0xf6c976, 0.1).fillRect(x + door - 3, foot, 22, 12);
  if (b.pony) {
    r(door + 23, -32, 3, 31, 0x302820);
    r(door + 23, -32, 31, 3, 0x302820);
    r(door + 31, -28, 20, 24, 0xc7ab69);
    r(door + 32, -27, 18, 22, 0x344b3b);
    // White rearing pony on the painted inn sign.
    r(door + 36, -18, 9, 5, 0xf2ebce);
    r(door + 43, -23, 3, 9, 0xf2ebce);
    r(door + 43, -24, 5, 3, 0xf2ebce);
    r(door + 35, -14, 2, 7, 0xf2ebce);
    r(door + 41, -13, 2, 5, 0xf2ebce);
    r(door + 33, -21, 2, 8, 0xc4c1ae);
  }
}
function lamp(s, x, y) {
  const px = x * 16 + 8,
    foot = y * 16 + 14;
  const g = s.add.graphics().setDepth(foot);
  g.fillStyle(0x342d23)
    .fillRect(px - 1, foot - 24, 3, 25)
    .fillRect(px - 4, foot, 9, 2);
  g.fillStyle(0x8e734b).fillRect(px - 1, foot - 22, 1, 22);
  g.fillStyle(0x312b24).fillRect(px - 5, foot - 24, 10, 12);
  g.fillStyle(0xdca655).fillRect(px - 3, foot - 22, 6, 8);
  g.fillStyle(0xffdf8c).fillRect(px - 2, foot - 21, 4, 5);
  g.fillStyle(0x504130)
    .fillRect(px - 5, foot - 24, 10, 2)
    .fillRect(px, foot - 23, 1, 11);
  const glow = s.add.ellipse(px, foot, 42, 20, 0xf3ad52, 0.1).setDepth(2);
  s.tweens.add({ targets: glow, alpha: 0.045, duration: 1450, yoyo: true, repeat: -1 });
}
export function drawBreeDecoy(g, x, damaged = false) {
  g.fillStyle(0x765335).fillRect(x * 16 + 4, 82, 8, 5);
  g.fillStyle(0xaaa080).fillRect(x * 16 + 3, 88, 10, 6);
  if (damaged) {
    g.fillStyle(0xeee0bb)
      .fillRect(x * 16 - 7, 104, 12, 3)
      .fillRect(x * 16 + 8, 112, 8, 2);
    g.lineStyle(2, 0x292523).lineBetween(x * 16 + 3, 83, x * 16 + 12, 94);
  }
}
export function drawBreeScenery(s) {
  const f = gameState.flags;
  const outdoor = ['breegate', 'bree', 'breeroad'].includes(s.zoneKey);
  if (outdoor) {
    drawBreeGround(s);
    s.zone.map.forEach((row, y) =>
      row.forEach((t, x) => {
        if (t === T.LANTERN) lamp(s, x, y);
      }),
    );
    s.add
      .rectangle(0, 0, s.mapWidth * 16, s.mapHeight * 16, 0x101f38, f.breeMorning ? 0.04 : 0.38)
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
    drawBreeInterior(s);
  }
  const props = s.add.graphics().setDepth(96);
  if (s.zoneKey === 'ponyrooms' && (f.breeDecoys || f.breeMorning)) {
    for (const x of [5, 10, 15, 20]) {
      drawBreeDecoy(props, x, f.breeMorning);
    }
  }
  if (s.zoneKey === 'ponyrooms' && f.breeMorning) {
    const broken = s.add.graphics().setDepth(30);
    for (const x of [5, 10, 15, 20]) {
      broken.fillStyle(0x20252c).fillRect(x * 16 + 4, 19, 8, 9);
      broken
        .lineStyle(2, 0x947455)
        .lineBetween(x * 16 + 2, 17, x * 16 + 7, 22)
        .lineBetween(x * 16 + 10, 25, x * 16 + 15, 30);
      broken
        .fillStyle(0xc2ae83)
        .fillRect(x * 16 + 3, 34, 5, 2)
        .fillRect(x * 16 + 12, 39, 4, 2);
    }
  }
  return props;
}

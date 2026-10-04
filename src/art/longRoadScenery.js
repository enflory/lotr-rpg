// Atmosphere and landmarks for the long road. The ground is ordinary tilework;
// what is added here is weather, the flat stone, the trolls and the camp fire.
// Every object is given a depth when it is created (the baked ground sits at 3).
import { drawTroll, drawRuneStone } from './longRoadArt.js';

// A small integer hash, so the two axes of one scatter are independent.
export const rnd = (i, n) => {
  let h = Math.imul(i + 1, 374761393) ^ Math.imul(n + 7, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function drifters(s, count, { colors, w, h, dx, dy, alpha, depth, time }) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = rnd(i, 1) * s.mapWidth * 16,
      y = rnd(i, 2) * s.mapHeight * 16;
    const o = s.add
      .rectangle(x, y, w, h, colors[i % colors.length], alpha)
      .setDepth(depth);
    s.tweens.add({
      targets: o,
      x: x + dx,
      y: y + dy,
      alpha: 0,
      duration: time + i * 97,
      delay: i * 120,
      repeat: -1,
    });
    out.push(o);
  }
  return out;
}

/** @returns {Record<string, any>} handles the event module animates */
export function drawLongRoadScenery(s) {
  const fx = {};
  const key = s.zoneKey;
  if (key === 'midgewater') {
    for (let i = 0; i < 14; i++) {
      const x = rnd(i, 3) * s.mapWidth * 16,
        y = (2 + rnd(i, 4) * (s.mapHeight - 4)) * 16;
      const m = s.add.rectangle(x, y, 150, 14, 0xc4d2b4, 0.1).setDepth(820);
      s.tweens.add({ targets: m, x: x + 60, duration: 7000 + i * 400, yoyo: true, repeat: -1 });
    }
    // A cloud of midges: tiny specks that never settle.
    fx.midges = s.add.container(0, 0).setDepth(830).setAlpha(0.45);
    for (let i = 0; i < 44; i++) {
      const x = rnd(i, 5) * s.mapWidth * 16,
        y = rnd(i, 6) * s.mapHeight * 16;
      const dot = s.add.rectangle(x, y, 2, 1, 0x14120a);
      fx.midges.add(dot);
      s.tweens.add({
        targets: dot,
        x: x + (i % 2 ? 14 : -14),
        y: y + (i % 3 ? 9 : -9),
        duration: 500 + (i % 7) * 130,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
  if (key === 'weathertop') {
    const stone = s.add.graphics({ x: 26 * 16 + 8, y: 8 * 16 + 11 }).setDepth(8 * 16 + 12);
    drawRuneStone(stone);
    drifters(s, 22, {
      colors: [0xe2e4d0, 0xc8ccb4],
      w: 9,
      h: 1,
      dx: 70,
      dy: 6,
      alpha: 0.35,
      depth: 830,
      time: 2600,
    });
    const px = 39 * 16 + 8,
      py = 27 * 16 + 12;
    fx.glow = s.add
      .circle(px, py, 34, 0xff8c30, 0.16)
      .setDepth(27 * 16 + 30)
      .setBlendMode(1);
    s.tweens.add({ targets: fx.glow, alpha: 0.26, scale: 1.12, duration: 420, yoyo: true, repeat: -1 });
    fx.flames = s.add.graphics({ x: px, y: py + 2 }).setDepth(27 * 16 + 20);
    fx.flames.fillStyle(0xc83c1c).fillTriangle(-6, 0, 6, 0, 0, -15);
    fx.flames.fillStyle(0xf08a28).fillTriangle(-4, 0, 4, 0, 0, -12);
    fx.flames.fillStyle(0xfadc6c).fillTriangle(-2, 0, 2, 0, 0, -8);
    s.tweens.add({
      targets: fx.flames,
      scaleY: 1.25,
      scaleX: 0.9,
      duration: 160,
      yoyo: true,
      repeat: -1,
    });
    fx.fire = [fx.glow, fx.flames];
  }
  if (key === 'trollshaws') {
    drifters(s, 34, {
      colors: [0xc8782a, 0xe0a83a, 0x9a4a24, 0xf0c850],
      w: 3,
      h: 2,
      dx: 40,
      dy: 70,
      alpha: 0.75,
      depth: 830,
      time: 4200,
    });
    /** @type {[number, number, 'stooping'|'standing'|'seated'][]} */
    const trolls = [
      [27, 12, 'stooping'],
      [31, 11, 'standing'],
      [35, 13, 'seated'],
    ];
    for (const [tx, ty, kind] of trolls) {
      const g = s.add.graphics({ x: tx * 16, y: ty * 16 }).setDepth(ty * 16 + 6);
      drawTroll(g, kind);
    }
  }
  if (key === 'bruinen') {
    for (let i = 0; i < 16; i++) {
      const x = (28 + rnd(i, 7) * 6) * 16,
        y = (9 + rnd(i, 8) * 5) * 16;
      const d = s.add.rectangle(x, y, 6, 1, 0xf2fbff, 0.7).setDepth(9 * 16 + 4);
      s.tweens.add({
        targets: d,
        x: x + 22,
        alpha: 0.05,
        duration: 1200 + i * 90,
        delay: i * 130,
        repeat: -1,
      });
    }
    for (let i = 0; i < 8; i++) {
      const y = (2 + i * 2.6) * 16;
      const m = s.add.rectangle(30 * 16 + 48, y, 130, 8, 0xe6f2f4, 0.07).setDepth(820);
      s.tweens.add({ targets: m, x: m.x + 26, duration: 4200 + i * 300, yoyo: true, repeat: -1 });
    }
  }
  return fx;
}

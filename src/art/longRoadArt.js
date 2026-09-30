// Figures for the long road: Asfaloth (with Frodo or Glorfindel up), the Nine
// in the two ways Frodo sees them, three stone trolls and the flat stone on
// Weathertop. Sheets are canvas; the rest are Phaser graphics drawn at a
// feet-origin so the caller only chooses a position and depth.
import { px, rc } from './helpers.js';

const FW = 32;
export const STEED_FRAMES = 5; // 0-1 Frodo up, 2-3 Glorfindel up, 4 riderless

function horse(c, x, pose) {
  const K = '#56607a', W = '#f2f4f8', S = '#c6ccd8', M = '#e6e2cc';
  rc(c, x + 6, 14, 18, 8, K);
  rc(c, x + 7, 15, 16, 6, W);
  rc(c, x + 9, 18, 12, 3, S);
  rc(c, x + 23, 15, 3, 5, W);
  rc(c, x + 22, 9, 4, 7, K);
  rc(c, x + 23, 10, 2, 6, W);
  rc(c, x + 24, 7, 5, 4, K);
  rc(c, x + 25, 8, 4, 2, W);
  px(c, x + 28, 9, S);
  px(c, x + 26, 8, '#28304a');
  px(c, x + 24, 6, K); px(c, x + 26, 6, K);
  rc(c, x + 21, 8, 2, 7, M);
  rc(c, x + 4, 14, 3, 2, M);
  rc(c, x + 2, 15, 3, 2, M);
  px(c, x + 1, 17, M);
  const legs = [
    [[8, 22, 7], [12, 22, 6], [18, 22, 6], [22, 22, 7]],
    [[7, 22, 6], [11, 23, 6], [19, 23, 6], [23, 22, 6]],
    [[8, 22, 7], [12, 22, 7], [18, 22, 7], [22, 22, 7]],
  ][pose];
  for (const [lx, ly, lh] of legs) {
    rc(c, x + lx, ly, 2, lh, K);
    px(c, x + lx, ly + 1, S);
  }
}

function rider(c, x, who) {
  if (who === 'frodo') {
    // A small hobbit, bowed low along the neck, in a grey-green cloak.
    rc(c, x + 13, 7, 6, 8, '#2c3a30');
    rc(c, x + 14, 8, 4, 6, '#5a6e5a');
    rc(c, x + 15, 3, 5, 5, '#2c3a30');
    rc(c, x + 16, 4, 3, 3, '#e8c49c');
    rc(c, x + 15, 3, 4, 1, '#6a4a2a');
    px(c, x + 12, 9, '#5a6e5a');
    px(c, x + 19, 9, '#e8c49c');
    rc(c, x + 10, 8, 3, 6, '#5a6e5a');
  } else {
    // The Elf-lord: tall, pale-cloaked, gold hair streaming behind.
    rc(c, x + 12, 2, 6, 13, '#8a94a8');
    rc(c, x + 13, 3, 4, 11, '#f0f2f6');
    rc(c, x + 13, 0, 5, 4, '#f0d050');
    rc(c, x + 14, 1, 3, 3, '#f4dcc0');
    rc(c, x + 10, 1, 3, 6, '#e0b838');
    rc(c, x + 8, 3, 2, 6, '#e0b838');
    rc(c, x + 10, 8, 3, 7, '#d8dce4');
    px(c, x + 18, 8, '#f4dcc0'); px(c, x + 19, 9, '#f4dcc0');
  }
}

export function makeSteedSheet() {
  const canvas = document.createElement('canvas');
  canvas.width = FW * STEED_FRAMES;
  canvas.height = FW;
  const c = canvas.getContext('2d');
  /** @type {[number, number, 'frodo'|'elf'|null][]} */
  const frames = [[0, 0, 'frodo'], [1, 1, 'frodo'], [2, 0, 'elf'], [3, 1, 'elf'], [4, 2, null]];
  for (const [frame, pose, who] of frames) {
    horse(c, frame * FW, pose);
    if (who) rider(c, frame * FW, who);
  }
  return canvas.toDataURL();
}

/**
 * One of the Nine, feet at (0,0). Unseen they are black cloaks with nothing in
 * the hood; through the Ring they are tall, pale and crowned.
 * @param {import('phaser').GameObjects.Graphics} g @param {boolean} seen @param {boolean} [leader]
 */
export function drawWraith(g, seen, leader = false) {
  g.clear();
  // Shadow, then a robe that swells from hooded shoulders to a ragged hem.
  const robe = seen ? [0xd4d6de, 0xaeb0bc, 0xf0f2f6, 0x70727e] : [0x12121a, 0x08080e, 0x1e1e2a, 0x000004];
  const [body, shade, light, void_] = robe;
  g.fillStyle(0x000000, seen ? 0.2 : 0.4).fillEllipse(0, 1, 26, 6);
  g.fillStyle(shade).fillRect(-12, -5, 24, 5);
  for (const x of [-12, -6, 0, 6]) g.fillStyle(body).fillRect(x, -2, 4, 2).fillStyle(void_).fillRect(x + 4, -1, 2, 2);
  g.fillStyle(shade).fillRect(-10, -18, 20, 14);
  g.fillStyle(body).fillRect(-9, -20, 18, 16);
  g.fillStyle(light).fillRect(-6, -19, 3, 14);
  g.fillStyle(shade).fillRect(-9, -8, 2, 4).fillRect(7, -9, 2, 5);
  g.fillStyle(shade).fillRect(-8, -27, 16, 9);
  g.fillStyle(body).fillRect(-7, -27, 14, 8);
  g.fillStyle(shade).fillRect(-6, -35, 12, 10);
  g.fillStyle(body).fillRect(-5, -35, 10, 9);
  g.fillStyle(shade).fillRect(-3, -37, 6, 3);
  g.fillStyle(void_).fillRect(-3, -32, 6, 6);
  if (seen) {
    g.fillStyle(0xffffff).fillRect(-2, -30, 1, 1).fillRect(1, -30, 1, 1);
    g.fillStyle(0x9a9caa).fillRect(-2, -28, 4, 1);
  } else {
    g.fillStyle(0x3a1018).fillRect(-2, -30, 1, 1).fillRect(1, -30, 1, 1);
  }
  if (leader && seen)
    g.fillStyle(0xf4f0d8).fillRect(-5, -38, 10, 2).fillRect(-5, -41, 2, 3).fillRect(-1, -42, 2, 4).fillRect(3, -41, 2, 3);
}

/**
 * A stone troll, feet-origin at bottom centre of a two-tile footprint.
 * @param {import('phaser').GameObjects.Graphics} g @param {'stooping'|'standing'|'seated'} kind
 */
export function drawTroll(g, kind) {
  const D = 0x4a4c52, M = 0x6f7279, L = 0x9a9da4, Y = 0x5a7a3a;
  g.fillStyle(0x000000, 0.25).fillEllipse(0, 0, 40, 8);
  if (kind === 'seated') {
    g.fillStyle(D).fillRect(-17, -14, 34, 14).fillRect(-12, -36, 24, 24);
    g.fillStyle(M).fillRect(-15, -13, 30, 12).fillRect(-10, -34, 20, 22);
    g.fillStyle(L).fillRect(-10, -34, 20, 3).fillRect(-15, -13, 30, 2);
    g.fillStyle(D).fillRect(-7, -46, 14, 12);
    g.fillStyle(M).fillRect(-6, -45, 12, 10);
    g.fillStyle(L).fillRect(-6, -45, 12, 2);
    g.fillStyle(D).fillRect(-4, -41, 3, 2).fillRect(2, -41, 3, 2).fillRect(-3, -37, 6, 2);
    g.fillStyle(D).fillRect(10, -30, 12, 6).fillRect(18, -26, 6, 10);
    g.fillStyle(L).fillRect(12, -29, 8, 2);
  } else if (kind === 'stooping') {
    g.fillStyle(D).fillRect(-14, -14, 10, 14).fillRect(3, -14, 10, 14).fillRect(-16, -38, 32, 26);
    g.fillStyle(M).fillRect(-12, -14, 6, 13).fillRect(5, -14, 6, 13).fillRect(-14, -36, 28, 23);
    g.fillStyle(L).fillRect(-14, -36, 28, 3).fillRect(-12, -14, 6, 2);
    g.fillStyle(D).fillRect(6, -48, 14, 13);
    g.fillStyle(M).fillRect(7, -47, 12, 11);
    g.fillStyle(L).fillRect(7, -47, 12, 2);
    g.fillStyle(D).fillRect(9, -43, 3, 2).fillRect(15, -43, 3, 2).fillRect(10, -39, 7, 2);
    g.fillStyle(D).fillRect(-22, -30, 8, 18).fillRect(-26, -16, 12, 5);
  } else {
    g.fillStyle(D).fillRect(-12, -16, 10, 16).fillRect(2, -16, 10, 16).fillRect(-14, -44, 28, 32);
    g.fillStyle(M).fillRect(-10, -16, 6, 15).fillRect(4, -16, 6, 15).fillRect(-12, -42, 24, 29);
    g.fillStyle(L).fillRect(-12, -42, 24, 3).fillRect(-10, -16, 6, 2);
    g.fillStyle(D).fillRect(-6, -56, 14, 13);
    g.fillStyle(M).fillRect(-5, -55, 12, 11);
    g.fillStyle(L).fillRect(-5, -55, 12, 2);
    g.fillStyle(D).fillRect(-3, -51, 3, 2).fillRect(3, -51, 3, 2).fillRect(-2, -47, 7, 2);
    g.fillStyle(D).fillRect(-22, -42, 8, 22).fillRect(14, -42, 8, 22);
  }
  g.fillStyle(Y).fillRect(-8, -12, 3, 2).fillRect(6, -2, 4, 2).fillRect(-14, -30, 2, 3);
}

/** The flat stone with Gandalf's mark: a G and three strokes. */
export function drawRuneStone(g) {
  g.fillStyle(0x000000, 0.3).fillEllipse(0, 2, 20, 6);
  g.fillStyle(0x4c4f56).fillRect(-9, -6, 18, 9);
  g.fillStyle(0x8a8d94).fillRect(-8, -6, 16, 7);
  g.fillStyle(0xa8abb2).fillRect(-8, -6, 16, 1);
  g.fillStyle(0x3a3c42);
  g.fillRect(-6, -4, 4, 1).fillRect(-6, -3, 1, 3).fillRect(-6, -1, 4, 1).fillRect(-3, -2, 1, 1);
  g.fillRect(1, -4, 1, 3).fillRect(3, -4, 1, 3).fillRect(5, -4, 1, 3);
}

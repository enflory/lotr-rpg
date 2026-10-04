// Tiles for Rivendell: pale carved stone, silver-grey floors, the falls and the
// fir-clad valley walls. Drawn onto the shared strip by tiles.js.
import { px, rc, circle } from './helpers.js';

const STONE = '#cfc8b4';
const STONE_D = '#a79f8a';
const STONE_L = '#ece6d4';
const GOLD = '#d9b04a';

function paved(c, ox) {
  rc(c, ox, 0, 16, 16, STONE);
  for (const [x, y] of [[2, 3], [10, 2], [6, 9], [13, 12], [1, 13]]) px(c, ox + x, y, STONE_D);
  for (const [x, y] of [[5, 5], [12, 8], [3, 11]]) px(c, ox + x, y, STONE_L);
}

export function drawElfPillar(c, ox) {
  paved(c, ox);
  rc(c, ox + 3, 13, 10, 3, STONE_D);
  rc(c, ox + 4, 13, 8, 2, STONE_L);
  rc(c, ox + 5, 3, 6, 10, STONE_D);
  rc(c, ox + 6, 3, 4, 10, STONE_L);
  for (const x of [7, 9]) rc(c, ox + x, 4, 1, 8, '#b8b09a');
  rc(c, ox + 3, 1, 10, 3, STONE_D);
  rc(c, ox + 4, 1, 8, 2, STONE_L);
  rc(c, ox + 7, 2, 2, 1, GOLD);
  rc(c, ox + 5, 14, 6, 1, GOLD);
}

export function drawElfFloor(c, ox) {
  rc(c, ox, 0, 16, 16, '#c0b494');
  rc(c, ox, 0, 16, 1, '#a89c7c');
  rc(c, ox, 8, 16, 1, '#a89c7c');
  rc(c, ox + 7, 0, 1, 16, '#a89c7c');
  rc(c, ox + 15, 0, 1, 16, '#a89c7c');
  for (const [x, y] of [[3, 3], [11, 4], [3, 12], [11, 12]]) {
    px(c, ox + x, y, GOLD);
    px(c, ox + x + 1, y + 1, '#e8d890');
  }
  for (const [x, y] of [[5, 6], [13, 2], [9, 13]]) px(c, ox + x, y, '#d4c8a8');
}

export function drawFalls(c, ox) {
  rc(c, ox, 0, 16, 16, '#7fb2d8');
  rc(c, ox, 0, 2, 16, '#5a5648');
  rc(c, ox + 14, 0, 2, 16, '#5a5648');
  for (const [x, y, h] of [[3, 0, 9], [6, 3, 11], [9, 0, 7], [11, 6, 10], [4, 10, 6], [8, 9, 7]]) {
    rc(c, ox + x, y, 1, h, '#eef8ff');
    rc(c, ox + x + 1, y + 1, 1, h - 2, '#a8d4ee');
  }
  rc(c, ox + 2, 14, 12, 2, '#dff0fa');
  for (const x of [3, 7, 11]) px(c, ox + x, 13, '#ffffff');
}

export function drawBalustrade(c, ox) {
  paved(c, ox);
  rc(c, ox, 5, 16, 3, STONE_D);
  rc(c, ox, 5, 16, 1, STONE_L);
  for (const x of [1, 6, 11]) rc(c, ox + x, 8, 3, 7, STONE_L);
  for (const x of [1, 6, 11]) rc(c, ox + x + 2, 8, 1, 7, STONE_D);
  rc(c, ox, 15, 16, 1, STONE_D);
  px(c, ox + 7, 6, GOLD);
}

export function drawElfWall(c, ox) {
  rc(c, ox, 0, 16, 16, '#8b7d66');
  rc(c, ox, 0, 16, 2, GOLD);
  rc(c, ox, 2, 16, 1, '#6a5e4a');
  for (const x of [0, 5, 10]) {
    rc(c, ox + x, 3, 5, 12, '#9a8c74');
    rc(c, ox + x + 1, 4, 3, 10, '#a89a80');
    // a slender carved leaf in every panel
    px(c, ox + x + 2, 5, '#6f8a4a');
    rc(c, ox + x + 2, 6, 1, 6, '#6f8a4a');
    px(c, ox + x + 1, 8, '#6f8a4a');
    px(c, ox + x + 3, 10, '#6f8a4a');
  }
  rc(c, ox, 15, 16, 1, '#5a4e3c');
}

export function drawGreatHearth(c, ox) {
  rc(c, ox, 0, 16, 16, STONE_D);
  rc(c, ox, 0, 16, 3, STONE);
  rc(c, ox + 1, 3, 14, 13, '#4a4234');
  rc(c, ox + 2, 4, 12, 12, '#211812');
  rc(c, ox + 3, 8, 10, 8, '#e8782a');
  rc(c, ox + 4, 7, 8, 5, '#f4a43a');
  rc(c, ox + 5, 5, 6, 5, '#f8d060');
  rc(c, ox + 7, 3, 2, 4, '#fff0a0');
  for (const x of [4, 8, 11]) px(c, ox + x, 13, '#c8481c');
  rc(c, ox, 15, 16, 1, '#2a2218');
}

export function drawFir(c, ox) {
  rc(c, ox, 0, 16, 16, '#3f7a2c');
  rc(c, ox + 7, 12, 2, 4, '#4a2e18');
  for (const [w, y, col] of [[12, 9, '#1a3a24'], [10, 6, '#1f4a2c'], [7, 3, '#255a34'], [3, 0, '#2c6a3c']]) {
    rc(c, ox + 8 - w / 2, y, w, 4, col);
    rc(c, ox + 8 - w / 2 + 1, y, w - 2, 1, '#3e8a4c');
  }
  px(c, ox + 6, 8, '#6ab07a');
  px(c, ox + 10, 11, '#143020');
}

export function drawSteps(c, ox) {
  rc(c, ox, 0, 16, 16, STONE);
  for (const y of [0, 4, 8, 12]) {
    rc(c, ox, y, 16, 1, STONE_L);
    rc(c, ox, y + 3, 16, 1, STONE_D);
  }
  px(c, ox + 3, 6, STONE_D);
  px(c, ox + 12, 10, STONE_D);
}

export function drawElfLamp(c, ox) {
  paved(c, ox);
  rc(c, ox + 7, 5, 2, 10, STONE_D);
  rc(c, ox + 5, 14, 6, 2, STONE_D);
  circle(c, ox + 8, 4, 3, '#fff0b0');
  circle(c, ox + 8, 4, 2, '#fffbe0');
  rc(c, ox + 5, 6, 6, 1, GOLD);
  rc(c, ox + 6, 0, 4, 1, GOLD);
}

export function drawElfRoof(c, ox) {
  // Slates of pale copper-green laid in overlapping courses, with a gilt ridge line.
  rc(c, ox, 0, 16, 16, '#6f8a78');
  for (const y of [0, 4, 8, 12]) {
    const shift = (y / 4) % 2 ? 4 : 0;
    rc(c, ox, y + 3, 16, 1, '#3e5648');
    for (let x = -shift; x < 16; x += 8) {
      rc(c, ox + Math.max(0, x), y, Math.min(8, 16 - Math.max(0, x)), 3, y % 8 ? '#86a08c' : '#7a9684');
      px(c, ox + Math.max(0, x), y, '#a8c0a8');
    }
  }
  for (const [x, y] of [[3, 2], [11, 6], [6, 10], [13, 14]]) px(c, ox + x, y, '#c9b068');
}

export function drawElfTable(c, ox) {
  // A long board under a white cloth, a candle and a silver cup.
  paved(c, ox);
  rc(c, ox, 3, 16, 11, '#6a4a2c');
  rc(c, ox, 3, 16, 9, '#f0ece0');
  rc(c, ox, 11, 16, 1, '#c8c0a8');
  rc(c, ox, 12, 16, 2, '#4c3420');
  rc(c, ox + 3, 5, 2, 4, '#fff6d0');
  px(c, ox + 4, 4, '#ffd060');
  rc(c, ox + 10, 6, 2, 3, '#c9d2dc');
  px(c, ox + 10, 6, '#ffffff');
  px(c, ox + 7, 9, '#d9b04a');
}

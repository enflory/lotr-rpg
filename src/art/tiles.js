// Tileset — 19 16×16 tiles drawn onto one horizontal strip canvas.
// Order must match the T constants in src/data/map.js.

import { px, rc, circle } from './helpers.js';

const TS = 16;
export const TILE_COUNT = 19;

function drawGrass(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  for (const [dx, dy, col] of [[3,4,'#4a8630'],[10,2,'#4a8630'],[7,9,'#4a8630'],[1,12,'#6eb848'],[13,7,'#6eb848'],[5,14,'#4a8630'],[12,11,'#6eb848'],[8,1,'#4a8630']])
    px(c, ox + dx, dy, col);
}

function drawGrass2(c, ox) {
  rc(c, ox, 0, 16, 16, '#4e9235');
  for (const [dx, dy, col] of [[5,3,'#3d7a2a'],[11,6,'#3d7a2a'],[2,10,'#5ea840'],[8,13,'#3d7a2a'],[14,1,'#5ea840'],[6,8,'#3d7a2a'],[0,5,'#5ea840']])
    px(c, ox + dx, dy, col);
}

function drawPath(c, ox) {
  rc(c, ox, 0, 16, 16, '#c4a265');
  for (const [dx, dy, col] of [[2,3,'#b09050'],[9,7,'#b09050'],[5,12,'#d4b278'],[13,5,'#b09050'],[7,1,'#d4b278'],[11,14,'#b09050'],[3,9,'#d4b278'],[14,11,'#b09050']])
    px(c, ox + dx, dy, col);
}

function drawWater(c, ox) {
  rc(c, ox, 0, 16, 16, '#3b7dd8');
  // Wave dashes (2px) in a staggered pattern
  for (const [dx, dy] of [[1,2],[9,2],[5,5],[13,5],[2,9],[10,9],[6,12],[14,12],[0,15],[8,15]]) {
    px(c, ox + dx, dy, '#6bb8e0');
    px(c, ox + (dx + 1) % 16, dy, '#8ed0ee');
  }
  for (const [dx, dy] of [[4,3],[12,7],[7,10],[2,13],[14,1]])
    px(c, ox + dx, dy, '#2a5ca8');
}

function drawTree(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  // Shadow pool under canopy
  circle(c, ox + 8, 12, 5, '#4a8630');
  rc(c, ox + 6, 11, 4, 5, '#5a3a1c');
  rc(c, ox + 7, 12, 2, 4, '#7a5530');
  // Dark outline ring then layered canopy
  circle(c, ox + 8, 6, 7, '#1e3c14');
  circle(c, ox + 8, 6, 6, '#2d5a1e');
  circle(c, ox + 7, 5, 4, '#3a6e28');
  // Leaf cluster highlights
  rc(c, ox + 4, 3, 2, 2, '#4a8630');
  rc(c, ox + 8, 2, 3, 2, '#4a8630');
  rc(c, ox + 6, 6, 2, 1, '#4a8630');
  px(c, ox + 5, 4, '#5f9e40');
  px(c, ox + 9, 3, '#5f9e40');
  px(c, ox + 11, 7, '#3a6e28');
}

function drawHill(c, ox) {
  // Grass-topped earth embankment; scattered speckle instead of stripes
  rc(c, ox, 0, 16, 4, '#3d7a2a');
  px(c, ox + 3, 1, '#2d5a1e');
  px(c, ox + 11, 2, '#4e8e35');
  px(c, ox + 7, 0, '#4e8e35');
  // Grass fringe hanging over the edge
  for (let x = 0; x < 16; x++)
    if (x % 3 !== 1) px(c, ox + x, 4, '#3d7a2a');
  rc(c, ox, 5, 16, 11, '#8a6b3d');
  rc(c, ox, 5, 16, 1, '#5a4020');
  for (const [dx, dy] of [[2,7],[6,9],[11,7],[14,10],[4,12],[9,13],[13,14],[1,14],[7,6],[12,11]])
    px(c, ox + dx, dy, '#7a5d30');
  for (const [dx, dy] of [[5,7],[10,10],[3,10],[8,15],[14,7]])
    px(c, ox + dx, dy, '#9a7b4d');
  // Embedded stones
  rc(c, ox + 3, 8, 2, 1, '#a09080');
  rc(c, ox + 10, 12, 2, 1, '#a09080');
}

function drawHillTop(c, ox) {
  rc(c, ox, 0, 16, 16, '#3d7a2a');
  for (const [dx, dy, col] of [[4,3,'#2d5a1e'],[10,7,'#2d5a1e'],[7,12,'#4e8e35'],[2,8,'#4e8e35'],[13,2,'#2d5a1e'],[6,5,'#4e8e35']])
    px(c, ox + dx, dy, col);
}

function drawDoor(c, ox) {
  rc(c, ox, 0, 16, 3, '#3d7a2a');
  rc(c, ox, 3, 16, 13, '#8a6b3d');
  rc(c, ox, 3, 16, 1, '#5a4020');
  circle(c, ox + 8, 9, 6, '#2d5a1e');
  circle(c, ox + 8, 9, 5, '#3d7a2a');
  circle(c, ox + 8, 9, 4, '#4a8630');
  rc(c, ox + 4, 7, 8, 1, '#3d7a2a');
  rc(c, ox + 4, 11, 8, 1, '#3d7a2a');
  rc(c, ox + 8, 5, 1, 9, '#3d7a2a');
  rc(c, ox + 10, 8, 2, 2, '#e8c840');
  px(c, ox + 10, 9, '#ffd700');
  px(c, ox + 6, 6, '#5a9e3a');
  px(c, ox + 7, 6, '#5a9e3a');
}

function drawBridge(c, ox) {
  rc(c, ox, 0, 2, 16, '#3b7dd8');
  rc(c, ox + 14, 0, 2, 16, '#3b7dd8');
  rc(c, ox + 2, 0, 12, 16, '#8a6b3d');
  for (let y = 0; y < 16; y += 4)
    rc(c, ox + 2, y, 12, 1, '#6b4423');
  rc(c, ox + 2, 0, 1, 16, '#6b4423');
  rc(c, ox + 13, 0, 1, 16, '#6b4423');
  for (let y = 2; y < 16; y += 4) {
    px(c, ox + 3, y, '#4a3015');
    px(c, ox + 12, y, '#4a3015');
  }
}

function drawFence(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  rc(c, ox + 2, 3, 2, 12, '#8a6b3d');
  rc(c, ox + 12, 3, 2, 12, '#8a6b3d');
  rc(c, ox + 1, 2, 4, 2, '#6b4423');
  rc(c, ox + 11, 2, 4, 2, '#6b4423');
  rc(c, ox + 2, 6, 12, 2, '#a0703c');
  rc(c, ox + 2, 11, 12, 2, '#a0703c');
}

function drawBush(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  circle(c, ox + 8, 9, 5, '#2d5a1e');
  circle(c, ox + 8, 8, 4, '#3a6e28');
  px(c, ox + 6, 6, '#4a8630');
  px(c, ox + 10, 7, '#4a8630');
  px(c, ox + 7, 10, '#2d5a1e');
}

function drawStone(c, ox) {
  rc(c, ox, 0, 16, 16, '#9a9a9a');
  rc(c, ox, 0, 16, 1, '#707070');
  rc(c, ox, 8, 16, 1, '#707070');
  rc(c, ox + 8, 0, 1, 8, '#707070');
  rc(c, ox + 5, 8, 1, 8, '#707070');
  rc(c, ox + 11, 8, 1, 8, '#707070');
  rc(c, ox + 1, 1, 7, 7, '#a8a8a8');
  rc(c, ox + 6, 9, 5, 7, '#8a8a8a');
}

function drawFlowers(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  for (const [dx, dy, col] of [[3,3,'#4a8630'],[10,9,'#4a8630'],[7,14,'#6eb848']])
    px(c, ox + dx, dy, col);
  px(c, ox + 4, 6, '#e83030'); px(c, ox + 3, 5, '#e83030');
  px(c, ox + 10, 3, '#e8e040'); px(c, ox + 11, 4, '#e8e040');
  px(c, ox + 7, 11, '#d060d0'); px(c, ox + 6, 10, '#d060d0');
  px(c, ox + 13, 8, '#f0f0f0'); px(c, ox + 14, 9, '#e83030');
  px(c, ox + 4, 7, '#3d7a2a'); px(c, ox + 10, 4, '#3d7a2a');
  px(c, ox + 7, 12, '#3d7a2a'); px(c, ox + 13, 9, '#3d7a2a');
}

function drawGarden(c, ox) {
  // Tilled vegetable plot: warm soil furrows with leafy sprout rows
  rc(c, ox, 0, 16, 16, '#8a6840');
  for (let y = 3; y < 16; y += 4)
    rc(c, ox, y, 16, 1, '#6a4c28');
  for (const [dx, dy] of [[2,1],[9,5],[5,9],[12,13],[14,2],[7,14]])
    px(c, ox + dx, dy, '#9a7850');
  // Sprouts along each furrow row
  for (let x = 1; x < 16; x += 3) {
    const wob = (x % 2);
    px(c, ox + x, 1 + wob, '#4a8630');
    px(c, ox + x + 1, 1 + wob, '#6eb848');
    px(c, ox + x, 5 + wob, '#6eb848');
    px(c, ox + x + 1, 5 + wob, '#4a8630');
    px(c, ox + x, 9 + wob, '#4a8630');
    px(c, ox + x + 1, 9 + wob, '#6eb848');
    px(c, ox + x, 13 + wob, '#6eb848');
    px(c, ox + x + 1, 13 + wob, '#4a8630');
  }
}

function drawRoof(c, ox) {
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  for (let x = 0; x < 16; x++) {
    const h = Math.round(10 - ((x - 8) * (x - 8)) / 8);
    if (h > 0) rc(c, ox + x, 0, 1, h, '#3d7a2a');
  }
  for (const [dx, dy] of [[3,2],[6,1],[10,1],[13,2],[5,3],[9,2]])
    px(c, ox + dx, dy, '#4e8e35');
  for (let x = 1; x < 15; x++) {
    const h = Math.round(10 - ((x - 8) * (x - 8)) / 8);
    if (h > 0) px(c, ox + x, h, '#5a4020');
  }
  for (const [dx, dy] of [[3,12],[10,11],[7,14],[12,13]])
    px(c, ox + dx, dy, '#7a5d30');
  circle(c, ox + 8, 12, 2, '#4a3015');
  px(c, ox + 8, 12, '#6b8cc0');
  rc(c, ox + 12, 0, 2, 5, '#6b4423');
  px(c, ox + 12, 0, '#c0c0c0');
  px(c, ox + 13, 0, '#d0d0d0');
}

function drawDoorL(c, ox) {
  rc(c, ox, 0, 16, 3, '#3d7a2a');
  rc(c, ox, 3, 16, 13, '#8a6b3d');
  rc(c, ox, 3, 16, 1, '#5a4020');
  rc(c, ox + 13, 4, 3, 12, '#6b5a3d');
  rc(c, ox + 14, 3, 2, 2, '#6b5a3d');
  rc(c, ox + 15, 2, 1, 1, '#6b5a3d');
  circle(c, ox + 6, 9, 2, '#4a3015');
  circle(c, ox + 6, 9, 1, '#6b8cc0');
  rc(c, ox + 11, 6, 1, 4, '#6b4423');
  px(c, ox + 11, 5, '#e8c840');
  px(c, ox + 11, 6, '#e8c840');
}

function drawDoorR(c, ox) {
  rc(c, ox, 0, 16, 3, '#3d7a2a');
  rc(c, ox, 3, 16, 13, '#8a6b3d');
  rc(c, ox, 3, 16, 1, '#5a4020');
  rc(c, ox, 4, 3, 12, '#6b5a3d');
  rc(c, ox, 3, 2, 2, '#6b5a3d');
  px(c, ox, 2, '#6b5a3d');
  circle(c, ox + 10, 9, 2, '#4a3015');
  circle(c, ox + 10, 9, 1, '#6b8cc0');
  rc(c, ox + 4, 6, 1, 4, '#6b4423');
  px(c, ox + 4, 5, '#e8c840');
  px(c, ox + 4, 6, '#e8c840');
}

function drawRoofL(c, ox) {
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  for (let x = 0; x < 16; x++) {
    const h = Math.round(2 + (x * x) / 20);
    if (h > 0) rc(c, ox + x, 0, 1, Math.min(h, 16), '#3d7a2a');
  }
  for (const [dx, dy] of [[10,2],[13,1],[8,3],[14,3],[6,4]])
    px(c, ox + dx, dy, '#4e8e35');
  for (let x = 3; x < 16; x++) {
    const h = Math.round(2 + (x * x) / 20);
    if (h > 0 && h < 16) px(c, ox + x, h, '#5a4020');
  }
  for (const [dx, dy] of [[2,10],[4,13],[1,7]])
    px(c, ox + dx, dy, '#7a5d30');
}

function drawRoofR(c, ox) {
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  for (let x = 0; x < 16; x++) {
    const rx = 15 - x;
    const h = Math.round(2 + (rx * rx) / 20);
    if (h > 0) rc(c, ox + x, 0, 1, Math.min(h, 16), '#3d7a2a');
  }
  for (const [dx, dy] of [[2,1],[5,2],[3,3],[7,4],[1,3]])
    px(c, ox + dx, dy, '#4e8e35');
  for (let x = 0; x < 13; x++) {
    const rx = 15 - x;
    const h = Math.round(2 + (rx * rx) / 20);
    if (h > 0 && h < 16) px(c, ox + x, h, '#5a4020');
  }
  for (const [dx, dy] of [[12,8],[14,11],[10,13]])
    px(c, ox + dx, dy, '#7a5d30');
}

const TILE_FNS = [
  drawGrass, drawGrass2, drawPath, drawWater, drawTree,
  drawHill, drawHillTop, drawDoor, drawBridge, drawFence,
  drawBush, drawStone, drawFlowers, drawGarden, drawRoof,
  drawDoorL, drawDoorR, drawRoofL, drawRoofR,
];

export function makeTilesetDataURL() {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_COUNT * TS;
  canvas.height = TS;
  const c = canvas.getContext('2d');
  TILE_FNS.forEach((fn, i) => fn(c, i * TS));
  return canvas.toDataURL();
}

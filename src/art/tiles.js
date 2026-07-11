// Tileset — 16×16 tiles drawn onto one horizontal strip canvas.
// Order must match the T constants in src/data/tileTypes.js.

import { px, rc, circle } from './helpers.js';

const TS = 16;

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

/* ── interior tiles ─────────────────────────────────────── */

function drawFloor(c, ox) {
  // Warm wood planks, horizontal, staggered seams
  rc(c, ox, 0, 16, 16, '#a8804e');
  for (let y = 0; y < 16; y += 4)
    rc(c, ox, y + 3, 16, 1, '#8a6238');
  px(c, ox + 4, 1, '#8a6238'); px(c, ox + 12, 5, '#8a6238');
  px(c, ox + 7, 9, '#8a6238'); px(c, ox + 2, 13, '#8a6238');
  px(c, ox + 10, 1, '#c09a64'); px(c, ox + 3, 5, '#c09a64');
  px(c, ox + 13, 9, '#c09a64'); px(c, ox + 8, 13, '#c09a64');
}

function drawWall(c, ox) {
  // Hobbit-hole interior wall: warm plaster above wood wainscot
  rc(c, ox, 0, 16, 10, '#d8c4a0');
  for (const [dx, dy] of [[3,2],[9,5],[13,3],[6,7],[1,6]])
    px(c, ox + dx, dy, '#c8b48e');
  rc(c, ox, 10, 16, 1, '#6a4a26');
  rc(c, ox, 11, 16, 5, '#8a6238');
  rc(c, ox + 5, 11, 1, 5, '#6a4a26');
  rc(c, ox + 11, 11, 1, 5, '#6a4a26');
}

function drawRug(c, ox) {
  // Seamless woven rug — tiles side by side read as one carpet
  rc(c, ox, 0, 16, 16, '#a84040');
  for (let y = 0; y < 16; y += 4)
    for (let x = 0; x < 16; x += 4)
      rc(c, ox + x + ((y / 4) % 2) * 2, y, 2, 2, '#983838');
  for (const [dx, dy] of [[2,6],[10,2],[6,12],[14,9],[1,13],[13,14]])
    px(c, ox + dx, dy, '#c8a040');
}

function drawTable(c, ox) {
  rc(c, ox, 0, 16, 16, '#a8804e'); // floor
  rc(c, ox, 3, 16, 1, '#8a6238');
  rc(c, ox, 7, 16, 1, '#8a6238');
  rc(c, ox, 11, 16, 1, '#8a6238');
  // Shadow, then dark walnut round table — must contrast with the floor
  circle(c, ox + 8, 9, 7, '#7a5c34');
  circle(c, ox + 8, 8, 7, '#2e1c0c');
  circle(c, ox + 8, 8, 6, '#4a2f14');
  circle(c, ox + 8, 7, 5, '#5f3d1c');
  // Rim highlight
  rc(c, ox + 5, 2, 6, 1, '#7a5228');
  // Cream doily + frothy tankard
  rc(c, ox + 5, 6, 3, 3, '#e8dcc0');
  rc(c, ox + 9, 8, 3, 3, '#c8a050');
  rc(c, ox + 9, 7, 3, 1, '#f0ead6');
  px(c, ox + 12, 9, '#c8a050');
}

function drawFireplace(c, ox) {
  // Stone surround with glowing hearth (draw on wall row)
  rc(c, ox, 0, 16, 16, '#787068');
  rc(c, ox, 0, 16, 2, '#605850');
  rc(c, ox + 1, 3, 3, 2, '#8a8078'); rc(c, ox + 6, 2, 4, 2, '#8a8078');
  rc(c, ox + 12, 3, 3, 2, '#8a8078');
  // Hearth opening
  rc(c, ox + 3, 6, 10, 9, '#201410');
  rc(c, ox + 4, 8, 8, 7, '#38201a');
  // Fire
  rc(c, ox + 6, 10, 4, 4, '#c84818');
  rc(c, ox + 7, 9, 2, 4, '#e87828');
  px(c, ox + 7, 8, '#f8b848'); px(c, ox + 8, 10, '#f8d868');
  px(c, ox + 6, 11, '#f8b848'); px(c, ox + 9, 12, '#f8b848');
  // Logs
  rc(c, ox + 5, 14, 6, 1, '#4a2c14');
}

function drawShelf(c, ox) {
  rc(c, ox, 0, 16, 16, '#6a4a26');
  rc(c, ox, 0, 16, 1, '#8a6238');
  // Two shelf rows of book spines
  const spines = ['#a84040', '#4a70a0', '#4a8848', '#c8a040', '#8a5599', '#b06830'];
  for (let row = 0; row < 2; row++) {
    const y = 2 + row * 7;
    rc(c, ox + 1, y + 5, 14, 1, '#8a6238'); // shelf board
    for (let i = 0; i < 6; i++) {
      const bx = 2 + i * 2;
      rc(c, ox + bx, y + (i % 2), 2, 5 - (i % 2), spines[(i + row * 3) % 6]);
      px(c, ox + bx, y + (i % 2), '#00000030');
    }
  }
  rc(c, ox, 15, 16, 1, '#4a3015');
}

function drawCounter(c, ox) {
  // Inn bar counter (front face + top)
  rc(c, ox, 0, 16, 5, '#b08850');
  rc(c, ox, 0, 16, 1, '#c8a068');
  rc(c, ox, 5, 16, 1, '#5a3a1c');
  rc(c, ox, 6, 16, 10, '#8a6238');
  rc(c, ox + 3, 8, 1, 6, '#6a4a26');
  rc(c, ox + 8, 8, 1, 6, '#6a4a26');
  rc(c, ox + 13, 8, 1, 6, '#6a4a26');
  // Tankard on top
  rc(c, ox + 10, 1, 3, 3, '#c8b090');
  px(c, ox + 13, 2, '#c8b090');
  px(c, ox + 11, 0, '#f0e8d0'); // foam
}

function drawBed(c, ox) {
  rc(c, ox, 0, 16, 16, '#a8804e');
  // Frame
  rc(c, ox + 1, 0, 14, 16, '#6a4a26');
  // Pillow
  rc(c, ox + 3, 1, 10, 4, '#e8e0d0');
  rc(c, ox + 3, 4, 10, 1, '#c8c0b0');
  // Quilt — patchwork
  rc(c, ox + 2, 5, 12, 10, '#7a4a8a');
  rc(c, ox + 2, 5, 6, 5, '#8a5a9a');
  rc(c, ox + 8, 10, 6, 5, '#8a5a9a');
  rc(c, ox + 2, 9, 12, 1, '#5a3a68');
  rc(c, ox + 8, 5, 1, 10, '#5a3a68');
}

function drawWindowInt(c, ox) {
  // Wall tile with a round window looking out on green
  drawWall(c, ox);
  circle(c, ox + 8, 5, 4, '#5a3a1c');
  circle(c, ox + 8, 5, 3, '#8ab8d8');
  rc(c, ox + 5, 6, 7, 2, '#6aa848'); // green hills through glass
  rc(c, ox + 8, 2, 1, 7, '#5a3a1c');
  rc(c, ox + 5, 5, 7, 1, '#5a3a1c');
}

/* ── forest tiles ───────────────────────────────────────── */

function drawFern(c, ox) {
  // Lush fern brake — must read clearly as a hiding spot
  rc(c, ox, 0, 16, 16, '#4e9235');
  // Shadowed base
  circle(c, ox + 8, 9, 6, '#26541c');
  // Radiating fronds
  const fronds = [
    [8, 9, 3, 2], [8, 9, 13, 2], [8, 9, 8, 0],
    [8, 9, 4, 13], [8, 9, 12, 13], [8, 9, 1, 7], [8, 9, 15, 7],
  ];
  for (const [cx, cy, tx, ty] of fronds) {
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(cx + ((tx - cx) * i) / steps);
      const y = Math.round(cy + ((ty - cy) * i) / steps);
      px(c, ox + x, y, i > 3 ? '#5fae44' : '#3a8030');
    }
  }
  // Frond barbs
  for (const [dx, dy] of [[6,4],[10,4],[4,7],[12,7],[6,11],[10,11],[8,6]])
    px(c, ox + dx, dy, '#4a9c3a');
  px(c, ox + 8, 9, '#26541c');
}

function drawTree2(c, ox) {
  // Autumn-tinged tree for the Woody End
  rc(c, ox, 0, 16, 16, '#4e9235');
  circle(c, ox + 8, 12, 5, '#3d7a2a');
  rc(c, ox + 6, 11, 4, 5, '#4a2c14');
  rc(c, ox + 7, 12, 2, 4, '#6a4528');
  circle(c, ox + 8, 6, 7, '#3c3410');
  circle(c, ox + 8, 6, 6, '#6a6018');
  circle(c, ox + 7, 5, 4, '#8a7c24');
  rc(c, ox + 4, 3, 2, 2, '#a89230');
  rc(c, ox + 8, 2, 3, 2, '#a89230');
  rc(c, ox + 6, 6, 2, 1, '#a89230');
  px(c, ox + 10, 4, '#c8a838');
  px(c, ox + 11, 7, '#8a7c24');
}

function drawVoid(c, ox) {
  // Dark earthen mass outside interior rooms
  rc(c, ox, 0, 16, 16, '#171210');
  for (const [dx, dy] of [[3,4],[11,2],[7,9],[13,12],[1,14],[9,6],[5,13],[15,8]])
    px(c, ox + dx, dy, '#211a15');
}

function drawSign(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  px(c, ox + 2, 13, '#4a8630'); px(c, ox + 12, 14, '#4a8630');
  // Post
  rc(c, ox + 7, 6, 2, 9, '#6b4423');
  px(c, ox + 7, 14, '#4a3015');
  // Board with grain lines
  rc(c, ox + 1, 1, 14, 6, '#4a3015');
  rc(c, ox + 2, 2, 12, 4, '#a0703c');
  rc(c, ox + 3, 3, 10, 1, '#7a5028');
  rc(c, ox + 3, 5, 8, 1, '#7a5028');
}

function drawDock(c, ox) {
  // Pier, north half: water above, deck running to the tile's bottom
  // so it joins DOCK_S seamlessly
  rc(c, ox, 0, 16, 3, '#3b7dd8');
  px(c, ox + 3, 0, '#6bb8e0'); px(c, ox + 11, 1, '#6bb8e0');
  rc(c, ox, 3, 16, 13, '#8a6b3d');
  rc(c, ox, 3, 16, 1, '#a0805a');
  for (let x = 3; x < 16; x += 4)
    rc(c, ox + x, 3, 1, 13, '#6b4423');
  px(c, ox + 5, 6, '#4a3015'); px(c, ox + 13, 9, '#4a3015');
  px(c, ox + 9, 13, '#7a5d30');
}

function drawDockS(c, ox) {
  // Pier, south half: deck continues from above, water edge and
  // support posts below
  rc(c, ox, 0, 16, 12, '#8a6b3d');
  for (let x = 3; x < 16; x += 4)
    rc(c, ox + x, 0, 1, 12, '#6b4423');
  rc(c, ox, 11, 16, 1, '#5a4020');
  rc(c, ox, 12, 16, 4, '#3b7dd8');
  px(c, ox + 6, 15, '#6bb8e0'); px(c, ox + 13, 14, '#6bb8e0');
  rc(c, ox + 1, 12, 2, 3, '#4a3015');
  rc(c, ox + 12, 12, 2, 3, '#4a3015');
  px(c, ox + 7, 4, '#4a3015'); px(c, ox + 11, 8, '#7a5d30');
}

/* ── Party Field ────────────────────────────────────────── */

// The Party Tree spans a 2×2 tile block. Each quarter draws its share
// of one big canopy centred on the block's middle; pixels are clipped
// to the 16px tile so nothing bleeds into neighbours on the strip.
function clippedCircle(c, ox, cx, cy, r, col) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const x = cx + dx, y = cy + dy;
      if (x < 0 || x > 15 || y < 0 || y > 15) continue;
      c.fillRect(ox + x, y, 1, 1);
    }
}

// Canopy layers shared by all four quarters, in block coordinates
// (0..31 square, centre 16,16). Each tile passes its own offset.
function partyCanopy(c, ox, bx, by) {
  const layer = (cx, cy, r, col) => clippedCircle(c, ox, cx - bx, cy - by, r, col);
  layer(16, 14, 14, '#1e4a16'); // dark rim
  layer(16, 14, 12, '#2e6a20'); // body
  layer(13, 11, 8, '#3d8a2c'); // lit side
  layer(11, 9, 4, '#4a9c3a'); // highlight crown
  // Festival lamps strung through the boughs
  for (const [lx, ly, col] of [
    [7, 10, '#e8c840'], [24, 8, '#e05050'], [16, 5, '#e8c840'],
    [10, 20, '#e05050'], [22, 21, '#e8c840'], [27, 15, '#f8e880'],
    [5, 16, '#f8e880'],
  ]) {
    const x = lx - bx, y = ly - by;
    if (x >= 0 && x <= 15 && y >= 0 && y <= 15) px(c, ox + x, y, col);
  }
}

function drawPartyTL(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  px(c, ox + 2, 2, '#4a8630'); px(c, ox + 5, 13, '#6aae4a');
  partyCanopy(c, ox, 0, 0);
}

function drawPartyTR(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  px(c, ox + 13, 3, '#4a8630'); px(c, ox + 11, 12, '#6aae4a');
  partyCanopy(c, ox, 16, 0);
}

function drawPartyBL(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  px(c, ox + 3, 13, '#4a8630');
  // Trunk (left half, hugging the block seam) with root flare
  rc(c, ox + 11, 4, 5, 9, '#4a2c14');
  rc(c, ox + 13, 4, 3, 9, '#6a4528');
  rc(c, ox + 10, 12, 6, 2, '#4a2c14');
  px(c, ox + 9, 13, '#4a2c14');
  px(c, ox + 14, 6, '#8a6038'); px(c, ox + 13, 9, '#8a6038');
  partyCanopy(c, ox, 0, 16);
  // Grass shadow under the boughs
  rc(c, ox + 4, 14, 10, 1, '#4a8630');
}

function drawPartyBR(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  px(c, ox + 12, 14, '#4a8630');
  rc(c, ox, 4, 5, 9, '#4a2c14');
  rc(c, ox, 4, 3, 9, '#6a4528');
  rc(c, ox, 12, 6, 2, '#4a2c14');
  px(c, ox + 6, 13, '#4a2c14');
  px(c, ox + 1, 7, '#8a6038'); px(c, ox + 2, 10, '#8a6038');
  partyCanopy(c, ox, 16, 16);
  rc(c, ox + 2, 14, 10, 1, '#4a8630');
}

function drawTent(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  px(c, ox + 1, 14, '#4a8630'); px(c, ox + 14, 15, '#4a8630');
  // Peaked pavilion, cream and red stripes widening to the ground
  for (let y = 0; y < 10; y++) {
    const hw = 1 + Math.round((y * 6) / 9);
    rc(c, ox + 8 - hw, 3 + y, hw * 2, 1, y % 4 < 2 ? '#e8e0c8' : '#c04848');
  }
  // Canvas shading down the right slope
  for (let y = 3; y < 13; y++) px(c, ox + 8 + Math.round(((y - 3) * 6) / 9), y, '#b0a888');
  // Ground skirt + entrance flap
  rc(c, ox + 1, 12, 14, 1, '#c04848');
  rc(c, ox + 6, 9, 4, 4, '#3a2618');
  px(c, ox + 7, 9, '#241608'); px(c, ox + 8, 10, '#241608');
  // Pole pennant
  px(c, ox + 8, 1, '#e8c840'); px(c, ox + 9, 2, '#e05050'); px(c, ox + 8, 2, '#e05050');
}

function drawLantern(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  px(c, ox + 3, 12, '#4a8630'); px(c, ox + 12, 13, '#4a8630');
  // Post
  rc(c, ox + 7, 6, 2, 8, '#6b4423');
  rc(c, ox + 6, 13, 4, 1, '#4a3015');
  px(c, ox + 7, 8, '#4a3015');
  // Lamp box with a warm pane
  rc(c, ox + 5, 1, 6, 6, '#3a2a1a');
  rc(c, ox + 6, 2, 4, 4, '#f8e880');
  px(c, ox + 7, 3, '#fff8d0'); px(c, ox + 8, 4, '#f0d860');
  px(c, ox + 7, 0, '#3a2a1a'); px(c, ox + 8, 0, '#3a2a1a');
  // Glow motes
  px(c, ox + 3, 3, '#e8c840'); px(c, ox + 12, 4, '#e8c840');
  px(c, ox + 4, 6, '#c8a838'); px(c, ox + 11, 7, '#c8a838');
}

export const TILE_FNS = [
  drawGrass, drawGrass2, drawPath, drawWater, drawTree,
  drawHill, drawHillTop, drawDoor, drawBridge, drawFence,
  drawBush, drawStone, drawFlowers, drawGarden, drawRoof,
  drawDoorL, drawDoorR, drawRoofL, drawRoofR,
  drawFloor, drawWall, drawRug, drawTable, drawFireplace,
  drawShelf, drawCounter, drawBed, drawWindowInt,
  drawFern, drawTree2, drawSign, drawVoid, drawDock, drawDockS,
  drawPartyTL, drawPartyTR, drawPartyBL, drawPartyBR, drawTent, drawLantern,
];

export function makeTilesetDataURL() {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_FNS.length * TS;
  canvas.height = TS;
  const c = canvas.getContext('2d');
  TILE_FNS.forEach((fn, i) => fn(c, i * TS));
  return canvas.toDataURL();
}

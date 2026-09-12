// Tileset — 16×16 tiles drawn onto one horizontal strip canvas.
// Order must match the T constants in src/data/tileTypes.js.

import { px, rc, circle } from './helpers.js';

import { drawForestFloor, drawOldTree, drawRoots, drawDeadTree, drawDarkWater, drawLilies, drawDownGrass, drawStandingStone, drawBarrowWall, drawBarrowFloor, drawChalk, drawHedge, drawDownSlope, drawGreatStone, drawDownHeather } from './forestTiles.js';

const TS = 16;

function drawGrass(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  for (const [dx, dy, col] of [[3,4,'#4a8630'],[10,2,'#4a8630'],[7,9,'#4a8630'],[1,12,'#6eb848'],[13,7,'#6eb848'],[5,14,'#4a8630'],[12,11,'#6eb848'],[8,1,'#4a8630']])
    px(c, ox + dx, dy, col);
}

function drawGrass2(c, ox) {
  rc(c, ox, 0, 16, 16, '#447f2c');
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
  rc(c, ox, 0, 16, 16, '#4a8a31');
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
  // Bare earth face top to bottom — the mound curve lives in the
  // ROOF_L/ROOF/ROOF_R row above, so this row must not restart it
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  px(c, ox + 2, 2, '#7a5d30');
  px(c, ox + 13, 1, '#9a7b4d');
  // Round wooden frame set into the earth, then the big green door —
  // flat panels with plank seams so it doesn't read as a bush
  circle(c, ox + 8, 9, 7, '#4a3015');
  circle(c, ox + 8, 9, 6, '#6b4423');
  circle(c, ox + 8, 9, 5, '#2d5a1e');
  circle(c, ox + 8, 9, 4, '#3d7a2a');
  rc(c, ox + 6, 5, 1, 9, '#2d5a1e');
  rc(c, ox + 10, 6, 1, 7, '#2d5a1e');
  // Brass knob in the exact middle, as is proper
  rc(c, ox + 7, 8, 2, 2, '#e8c840');
  px(c, ox + 8, 8, '#ffd700');
  // Stone step at the threshold
  rc(c, ox + 5, 15, 6, 1, '#a09080');
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
  rc(c, ox, 0, 16, 16, '#4a8a31');
  rc(c, ox + 2, 3, 2, 12, '#8a6b3d');
  rc(c, ox + 12, 3, 2, 12, '#8a6b3d');
  rc(c, ox + 1, 2, 4, 2, '#6b4423');
  rc(c, ox + 11, 2, 4, 2, '#6b4423');
  rc(c, ox + 2, 6, 12, 2, '#a0703c');
  rc(c, ox + 2, 11, 12, 2, '#a0703c');
}

function drawBush(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
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
  rc(c, ox, 0, 16, 16, '#4a8a31');
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

// The smial facades tile K O…O N: ROOF_L and ROOF_R carry the mound's
// rounded shoulders down to the grass, ROOF fills the crest between them,
// so any span reads as ONE smooth grass-topped mound (not a bump per tile).
function drawEarthFace(c, ox) {
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  for (const [dx, dy] of [[2,7],[6,9],[11,7],[14,10],[4,12],[9,13],[13,14],[1,14],[7,6],[12,11]])
    px(c, ox + dx, dy, '#7a5d30');
  for (const [dx, dy] of [[5,7],[10,10],[3,10],[8,15],[14,7]])
    px(c, ox + dx, dy, '#9a7b4d');
}

function drawRoof(c, ox) {
  // Crest of the mound: a level grass cap over the earth face
  drawEarthFace(c, ox);
  rc(c, ox, 0, 16, 3, '#3d7a2a');
  rc(c, ox, 3, 16, 1, '#5a4020');
  for (const [dx, dy, col] of [[3,1,'#2d5a1e'],[11,0,'#4e8e35'],[7,2,'#4e8e35'],[13,1,'#2d5a1e']])
    px(c, ox + dx, dy, col);
  // Round attic window under the crest
  circle(c, ox + 8, 10, 2, '#4a3015');
  px(c, ox + 8, 10, '#6b8cc0');
}

// Green depth per column of the left shoulder — a quarter-dome falling
// from the crest cap (3px, matching drawRoof) to the grass at the edge.
const SHOULDER = [15, 13, 12, 11, 9, 8, 7, 6, 6, 5, 4, 4, 3, 3, 3, 3];

function drawShoulder(c, ox, flip) {
  rc(c, ox, 0, 16, 16, '#3d7a2a');
  for (const [dx, dy, col] of [[2,2,'#2d5a1e'],[5,4,'#4e8e35'],[1,8,'#4e8e35'],[3,12,'#2d5a1e']])
    px(c, ox + (flip ? 15 - dx : dx), dy, col);
  for (let x = 0; x < 16; x++) {
    const top = SHOULDER[flip ? 15 - x : x];
    px(c, ox + x, top, '#5a4020');
    if (top < 15) rc(c, ox + x, top + 1, 1, 15 - top, '#8a6b3d');
  }
  for (const [dx, dy] of [[13,7],[10,9],[14,12],[8,13],[11,14],[5,14]])
    if (SHOULDER[dx] < dy) px(c, ox + (flip ? 15 - dx : dx), dy, '#7a5d30');
}

function drawDoorL(c, ox) {
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  px(c, ox + 3, 2, '#7a5d30');
  px(c, ox + 9, 1, '#9a7b4d');
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
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  px(c, ox + 12, 2, '#7a5d30');
  px(c, ox + 6, 1, '#9a7b4d');
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
  drawShoulder(c, ox, false);
}

function drawRoofR(c, ox) {
  drawShoulder(c, ox, true);
  // One chimney per smial, poking through the turf on this shoulder
  rc(c, ox + 2, 0, 2, 4, '#6b4423');
  px(c, ox + 2, 0, '#c0c0c0');
  px(c, ox + 3, 0, '#d0d0d0');
}

// Two-row smial dome. One quarter-ellipse gives the earth-top y per
// column over the full 32px facade height, so MOUND_* (upper row) and
// BASE_* (lower row) join into a single smooth grass-to-grass curve —
// no eaves, no wall jutting out below the shoulder.
const DOME = [31, 21, 17, 14, 12, 10, 9, 7, 6, 5, 5, 4, 4, 3, 3, 3];

function drawMoundUpper(c, ox, flip) {
  rc(c, ox, 0, 16, 16, '#3d7a2a');
  for (const [dx, dy, col] of [[2,2,'#2d5a1e'],[5,4,'#4e8e35'],[1,8,'#4e8e35'],[3,12,'#2d5a1e']])
    px(c, ox + (flip ? 15 - dx : dx), dy, col);
  for (let x = 0; x < 16; x++) {
    const top = DOME[flip ? 15 - x : x];
    if (top > 15) continue; // curve passes through the BASE row here
    px(c, ox + x, top, '#5a4020');
    if (top < 15) rc(c, ox + x, top + 1, 1, 15 - top, '#8a6b3d');
  }
  for (const [dx, dy] of [[13, 7], [10, 9], [14, 12], [8, 13], [11, 14], [6, 12]])
    if (DOME[dx] < dy) px(c, ox + (flip ? 15 - dx : dx), dy, '#7a5d30');
}

function drawBaseCorner(c, ox, flip) {
  rc(c, ox, 0, 16, 16, '#3d7a2a'); // grass outside the dome's foot
  for (const [dx, dy, col] of [[1, 3, '#2d5a1e'], [2, 12, '#4e8e35']])
    px(c, ox + (flip ? 15 - dx : dx), dy, col);
  for (let x = 0; x < 16; x++) {
    const top = DOME[flip ? 15 - x : x] - 16; // continue the upper curve
    if (top >= 0 && top <= 15) px(c, ox + x, top, '#5a4020');
    const from = top < 0 ? 0 : top + 1;
    if (from <= 15) rc(c, ox + x, from, 1, 16 - from, '#8a6b3d');
  }
  for (const [dx, dy] of [[6, 6], [11, 9], [8, 12], [13, 4], [4, 13], [10, 14]])
    if (DOME[dx] - 16 < dy) px(c, ox + (flip ? 15 - dx : dx), dy, '#7a5d30');
  for (const [dx, dy] of [[9, 7], [5, 10], [12, 13]])
    if (DOME[dx] - 16 < dy) px(c, ox + (flip ? 15 - dx : dx), dy, '#9a7b4d');
}

function drawMoundL(c, ox) {
  drawMoundUpper(c, ox, false);
}

function drawMoundR(c, ox) {
  drawMoundUpper(c, ox, true);
  // The smial's chimney pokes through the turf near the crest
  rc(c, ox + 2, 0, 2, 4, '#6b4423');
  px(c, ox + 2, 0, '#c0c0c0');
  px(c, ox + 3, 0, '#d0d0d0');
}

function drawBaseL(c, ox) {
  drawBaseCorner(c, ox, false);
}

function drawBaseR(c, ox) {
  drawBaseCorner(c, ox, true);
}

function drawWindowF(c, ox) {
  // Exterior earth face with a round window — fills facade width now
  // that each dwelling keeps a single green door
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  px(c, ox + 3, 2, '#7a5d30');
  px(c, ox + 12, 1, '#9a7b4d');
  px(c, ox + 2, 13, '#9a7b4d');
  circle(c, ox + 8, 9, 4, '#4a3015');
  circle(c, ox + 8, 9, 3, '#6b8cc0');
  rc(c, ox + 8, 6, 1, 7, '#4a3015');
  rc(c, ox + 5, 9, 7, 1, '#4a3015');
  px(c, ox + 6, 7, '#9ab8d8');
  // Window sill
  rc(c, ox + 5, 13, 7, 1, '#5a4020');
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
  circle(c, ox + 8, 8, 7, '#3a2410');
  circle(c, ox + 8, 8, 6, '#6b4622');
  circle(c, ox + 8, 7, 5, '#82592c');
  // Rim highlight
  rc(c, ox + 5, 2, 6, 1, '#7a5228');
  // Cream doily, a frothy tankard, and a lit candle
  rc(c, ox + 4, 8, 3, 3, '#e8dcc0');
  rc(c, ox + 9, 9, 3, 3, '#c8a050');
  rc(c, ox + 9, 8, 3, 1, '#f0ead6');
  px(c, ox + 12, 10, '#c8a050');
  rc(c, ox + 7, 4, 2, 4, '#f0ead6');
  px(c, ox + 7, 3, '#f8d868');
  px(c, ox + 8, 3, '#f8b848');
  px(c, ox + 7, 2, '#fff0b0');
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
  // Lush fern brake — must read clearly as a hiding spot, and must not tile
  // into wallpaper, so the fronds are asymmetric and the shade is off-centre
  rc(c, ox, 0, 16, 16, '#3c7a2c');
  for (const [dx, dy] of [[1,2],[6,0],[12,3],[3,13],[14,10],[9,15]]) px(c, ox + dx, dy, '#33692a');
  // Two overlapping crowns rather than one radial star
  for (const [cx, cy, sc, tint] of [[5, 10, 1, '#26541c'], [11, 7, 0.8, '#2e6222']]) {
    circle(c, ox + cx, cy, Math.round(5 * sc), tint);
    const fronds = [[-4, 2], [-5, -2], [-2, -5], [2, -5], [5, -2], [4, 3], [0, 5]];
    for (const [tx, ty] of fronds) {
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        const x = Math.round(cx + (tx * sc * i) / steps);
        const y = Math.round(cy + (ty * sc * i) / steps);
        px(c, ox + x, y, i > 3 ? '#63b447' : '#3e8a32');
        if (i % 2 === 0) px(c, ox + x + (tx > 0 ? -1 : 1), y, '#4a9c3a');
      }
    }
  }
  px(c, ox + 5, 10, '#1e4416');
  px(c, ox + 11, 7, '#1e4416');
  px(c, ox + 13, 13, '#63b447');
  px(c, ox + 2, 5, '#63b447');
}

function drawTree2(c, ox) {
  // Autumn-tinged tree for the Woody End
  rc(c, ox, 0, 16, 16, '#447f2c');
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
  rc(c, ox, 0, 16, 16, '#4a8a31');
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

// The Party Tree spans a 2-wide × 3-tall tile block (crown, canopy,
// trunk rows). Each tile draws its share of one big canopy centred in
// block coordinates; pixels are clipped to the 16px tile so nothing
// bleeds into neighbours on the strip.
function clippedCircle(c, ox, cx, cy, r, col) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const x = cx + dx,
        y = cy + dy;
      if (x < 0 || x > 15 || y < 0 || y > 15) continue;
      c.fillRect(ox + x, y, 1, 1);
    }
}

// Canopy layers shared by all six tiles, in block coordinates
// (32 wide × 48 tall, canopy centred at 16,18). Each tile passes its
// own offset.
function partyCanopy(c, ox, bx, by) {
  const layer = (cx, cy, r, col) => clippedCircle(c, ox, cx - bx, cy - by, r, col);
  layer(16, 18, 17, '#1e4a16'); // dark rim
  layer(16, 18, 15, '#2e6a20'); // body
  layer(12, 13, 9, '#3d8a2c'); // lit side
  layer(10, 10, 5, '#4a9c3a'); // highlight crown
  // Festival lamps strung through the boughs
  for (const [lx, ly, col] of [
    [6, 12, '#e8c840'], [25, 10, '#e05050'], [16, 4, '#e8c840'],
    [9, 24, '#e05050'], [23, 26, '#e8c840'], [29, 17, '#f8e880'],
    [3, 19, '#f8e880'], [14, 31, '#e05050'], [20, 32, '#e8c840'],
  ]) {
    const x = lx - bx,
      y = ly - by;
    if (x >= 0 && x <= 15 && y >= 0 && y <= 15) px(c, ox + x, y, col);
  }
}

function drawPartyNL(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 2, 3, '#4a8630');
  partyCanopy(c, ox, 0, 0);
}

function drawPartyNR(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 13, 2, '#4a8630');
  partyCanopy(c, ox, 16, 0);
}

function drawPartyTL(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 2, 2, '#4a8630');
  partyCanopy(c, ox, 0, 16);
}

function drawPartyTR(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 13, 3, '#4a8630');
  partyCanopy(c, ox, 16, 16);
}

function drawPartyBL(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 3, 13, '#4a8630');
  // Trunk (left half, hugging the block seam) with root flare
  rc(c, ox + 11, 4, 5, 9, '#4a2c14');
  rc(c, ox + 13, 4, 3, 9, '#6a4528');
  rc(c, ox + 10, 12, 6, 2, '#4a2c14');
  px(c, ox + 9, 13, '#4a2c14');
  px(c, ox + 14, 6, '#8a6038');
  px(c, ox + 13, 9, '#8a6038');
  partyCanopy(c, ox, 0, 32);
  // Grass shadow under the boughs
  rc(c, ox + 4, 14, 10, 1, '#4a8630');
}

function drawPartyBR(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 12, 14, '#4a8630');
  rc(c, ox, 4, 5, 9, '#4a2c14');
  rc(c, ox, 4, 3, 9, '#6a4528');
  rc(c, ox, 12, 6, 2, '#4a2c14');
  px(c, ox + 6, 13, '#4a2c14');
  px(c, ox + 1, 7, '#8a6038');
  px(c, ox + 2, 10, '#8a6038');
  partyCanopy(c, ox, 16, 32);
  rc(c, ox + 2, 14, 10, 1, '#4a8630');
}

function drawPartyTable(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 1, 14, '#4a8630'); px(c, ox + 14, 15, '#4a8630');
  // Trestle table with a cream cloth
  rc(c, ox + 1, 5, 14, 5, '#a0703c');
  rc(c, ox + 1, 5, 14, 2, '#f0e6d0');
  rc(c, ox + 1, 7, 14, 1, '#d8c8a8');
  rc(c, ox + 1, 9, 14, 1, '#6b4423');
  // Legs and their shadow on the grass
  rc(c, ox + 2, 10, 2, 3, '#6b4423');
  rc(c, ox + 12, 10, 2, 3, '#6b4423');
  rc(c, ox + 2, 13, 12, 1, '#4a8630');
  // Party fare: two mugs of beer, a loaf, apples
  rc(c, ox + 2, 3, 2, 2, '#c08030');
  px(c, ox + 2, 2, '#f8f4e8'); px(c, ox + 3, 2, '#f8f4e8');
  px(c, ox + 4, 4, '#8a5a20');
  rc(c, ox + 12, 3, 2, 2, '#c08030');
  px(c, ox + 12, 2, '#f8f4e8'); px(c, ox + 13, 2, '#f8f4e8');
  px(c, ox + 11, 4, '#8a5a20');
  rc(c, ox + 6, 3, 4, 2, '#c89858');
  px(c, ox + 7, 3, '#e0b878'); px(c, ox + 8, 3, '#e0b878');
  px(c, ox + 5, 4, '#c03028');
  px(c, ox + 10, 4, '#c03028');
}

/* The specially large pavilion — a 2×2 (32×32) striped marquee, so big
   "that the tree that grew in the field was right inside it". One pixel
   function keeps the quadrant tiles in sync; x mirrors around the seam. */
function pavilionPixel(gx, gy) {
  const mx = gx < 16 ? gx : 31 - gx; // mirrored column; 15 = centre seam
  // Gold pennant above the peak
  if (gy === 0 && mx === 15) return '#e8c840';
  if (gy === 1 && mx >= 14) return '#c04038';
  // Canopy: peak at the seam, spreading to full width at the hem
  if (gy >= 2 && gy <= 18) {
    const edge = 15 - Math.round(((gy - 2) * 15) / 16);
    if (mx < edge) return null;
    if (mx === edge) return '#3a2418'; // slope outline
    if (gy === 18) return '#8a2828'; // hem shadow
    return Math.floor((15 - mx) / 3) % 2 ? '#c04038' : '#f0e6d0';
  }
  // Scalloped hem
  if (gy === 19) return mx % 4 === 1 ? null : '#8a2828';
  // Walls, with the entrance opening on the centre seam
  if (gy >= 20 && gy <= 28) {
    if (mx < 2) return null;
    if (mx === 2) return '#3a2418'; // wall edge
    if (mx >= 12 && gy >= 21) return mx === 12 ? '#3a2418' : '#241608'; // entrance
    return (15 - mx) % 6 < 2 ? '#c04038' : '#f0e6d0';
  }
  // Ground line
  if (gy === 29 && mx >= 2) return '#3a2418';
  return null;
}

function drawPavQuad(c, ox, qx, qy) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
  px(c, ox + 2, 13, '#4a8630'); px(c, ox + 13, 14, '#4a8630');
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const col = pavilionPixel(qx * 16 + x, qy * 16 + y);
      if (col) px(c, ox + x, y, col);
    }
}

function drawPavTL(c, ox) { drawPavQuad(c, ox, 0, 0); }
function drawPavTR(c, ox) { drawPavQuad(c, ox, 1, 0); }
function drawPavBL(c, ox) { drawPavQuad(c, ox, 0, 1); }
function drawPavBR(c, ox) { drawPavQuad(c, ox, 1, 1); }

function drawLantern(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a8a31');
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

/* ── The Marish ─────────────────────────────────────────── */

function drawBog(c, ox) {
  // Squelchy wet ground — darker, browner grass with standing water
  rc(c, ox, 0, 16, 16, '#587a34');
  for (const [dx, dy] of [[2,3],[9,1],[13,5],[5,8],[11,11],[1,13],[7,14],[14,9]])
    px(c, ox + dx, dy, '#4a6a2c');
  // Mud patches
  rc(c, ox + 3, 5, 4, 2, '#5e5430');
  rc(c, ox + 10, 12, 4, 2, '#5e5430');
  px(c, ox + 4, 6, '#6e6438'); px(c, ox + 11, 13, '#6e6438');
  // Puddle glints
  rc(c, ox + 8, 6, 3, 2, '#4a6a80');
  px(c, ox + 9, 6, '#7aa8b8');
  rc(c, ox + 2, 10, 2, 2, '#4a6a80');
  px(c, ox + 2, 10, '#7aa8b8');
}

function drawReeds(c, ox) {
  // Sedge tussocks standing in black water, with cattails over them.
  // Impassable, and dense enough that you cannot see through a brake of it.
  rc(c, ox, 0, 16, 16, '#2f4433');
  for (const [dx, dy, w, h] of [[0, 9, 7, 5], [8, 11, 8, 5], [4, 2, 9, 4]])
    rc(c, ox + dx, dy, w, h, '#3d5a3a');
  for (const [dx, dy] of [[2, 12], [11, 13], [6, 4]]) px(c, ox + dx, dy, '#587a50');
  // Blades, leaning as the wind left them
  for (const [bx, by, lean] of [[2, 15, 1], [5, 14, -1], [8, 16, 1], [11, 15, -1], [14, 14, 1]]) {
    for (let i = 0; i < 9; i++) {
      const x = bx + Math.round((i * lean) / 3);
      const y = by - i;
      if (y < 0 || x < 0 || x > 15) continue;
      px(c, ox + x, y, i > 5 ? '#7d9a55' : '#4c6d3e');
    }
  }
  // Cattail heads
  for (const [dx, dy] of [[4, 3], [12, 5]]) {
    rc(c, ox + dx, dy, 2, 4, '#6b4a24');
    px(c, ox + dx, dy, '#8a6434');
  }
}

/* ── Hobbiton village dressing ─────────────────────────────── */

function drawWheel(c, ox) {
  // Mill wheel over the Water — water base under a spoked brown ring
  rc(c, ox, 0, 16, 16, '#3b7dd8');
  circle(c, ox + 8, 8, 7, '#5a3a1c');
  circle(c, ox + 8, 8, 5, '#3b7dd8');
  rc(c, ox + 7, 1, 2, 14, '#8a6b3d');
  rc(c, ox + 1, 7, 14, 2, '#8a6b3d');
  circle(c, ox + 8, 8, 2, '#8a6b3d');
  circle(c, ox + 8, 8, 1, '#5a3a1c');
  for (const [dx, dy] of [[8,1],[15,8],[8,15],[1,8],[3,3],[13,3],[3,13],[13,13]])
    px(c, ox + dx, dy, '#e8f0f4');
}

function drawCrate(c, ox) {
  // Firework crate: planked box with rocket tips poking from the open top
  rc(c, ox, 0, 16, 16, '#4a8a31');
  rc(c, ox + 2, 5, 12, 10, '#a5823c');
  rc(c, ox + 2, 5, 12, 1, '#6e5228');
  rc(c, ox + 2, 9, 12, 1, '#6e5228');
  rc(c, ox + 2, 10, 12, 3, '#3a2a18');
  rc(c, ox + 4, 1, 2, 5, '#e04040');
  rc(c, ox + 10, 0, 2, 6, '#e04040');
  px(c, ox + 4, 0, '#e8d070'); px(c, ox + 11, 0, '#e8d070');
}

function drawWell(c, ox) {
  // Village well: stone ring with a dark hole, timber posts and crossbar
  rc(c, ox, 0, 16, 16, '#4a8a31');
  circle(c, ox + 8, 10, 6, '#7a7a88');
  circle(c, ox + 8, 10, 4, '#14141a');
  rc(c, ox + 1, 1, 2, 10, '#8a6b3d');
  rc(c, ox + 13, 1, 2, 10, '#8a6b3d');
  rc(c, ox + 1, 0, 14, 2, '#8a6b3d');
  rc(c, ox + 7, 2, 2, 6, '#5a3a1c');
}

function drawBarn(c, ox) {
  // Timber wall face (analogous to drawStone, but planked with a cross-brace)
  rc(c, ox, 0, 16, 16, '#7a5530');
  for (let y = 4; y < 16; y += 4) rc(c, ox, y, 16, 1, '#5a3a1c');
  for (let i = 0; i < 16; i++) {
    px(c, ox + i, i, '#5a3a1c');
    px(c, ox + 15 - i, i, '#5a3a1c');
  }
  rc(c, ox + 1, 1, 4, 2, '#8a6540');
  rc(c, ox + 10, 6, 4, 2, '#8a6540');
  rc(c, ox + 3, 11, 4, 2, '#8a6540');
}

function drawFeast(c, ox) {
  // Feast table cloth with bread and fruit dabs
  rc(c, ox, 0, 16, 16, '#4a8a31');
  rc(c, ox + 1, 3, 14, 11, '#f0ece4');
  rc(c, ox + 1, 3, 14, 1, '#d8d4c8');
  for (const [dx, dy, col] of [
    [3,6,'#e8d070'],[7,5,'#c04060'],[11,7,'#e8d070'],
    [5,10,'#f0e6c8'],[9,10,'#c04060'],[13,9,'#e8d070'],[3,10,'#c04060'],
  ])
    rc(c, ox + dx, dy, 2, 2, col);
}

function drawDitch(c, ox) {
  // Sunken drainage ditch: cut banks either side of standing black water.
  // It is a dike between wet fields, not a canal — so the water reads dark
  // and still, and does not lie across the causeway like a blue pipe.
  rc(c, ox, 0, 16, 5, '#46652a');
  rc(c, ox, 11, 16, 5, '#3f5c26');
  rc(c, ox, 4, 16, 1, '#2f4a1c');
  rc(c, ox, 11, 16, 1, '#2f4a1c');
  rc(c, ox, 5, 16, 6, '#26362f');
  rc(c, ox, 5, 16, 1, '#1a2722');
  for (const [dx, dy] of [[2, 7], [9, 9], [13, 6]]) px(c, ox + dx, dy, '#1a2722');
  for (const [dx, dy] of [[5, 6], [11, 8]]) px(c, ox + dx, dy, '#4a6a62');
  px(c, ox + 6, 12, '#547a33');
  px(c, ox + 12, 2, '#547a33');
}

function drawWaggon(c, ox) {
  // Side-on cart: bed, two wheels, and a hay load on top
  rc(c, ox, 0, 16, 16, '#4a8a31');
  rc(c, ox + 1, 5, 14, 6, '#8a6b3d');
  rc(c, ox + 1, 5, 14, 1, '#a5823c');
  rc(c, ox + 2, 0, 11, 5, '#e8d070');
  px(c, ox + 3, 1, '#c8b060'); px(c, ox + 9, 1, '#c8b060');
  circle(c, ox + 4, 12, 3, '#5a3a1c');
  circle(c, ox + 4, 12, 1, '#3a2410');
  circle(c, ox + 12, 12, 3, '#5a3a1c');
  circle(c, ox + 12, 12, 1, '#3a2410');
}


/* ── Hobbiton field furniture ─────────────────────────────────────────────
   The east of Hobbiton was one wide lawn; these are what divide it into
   fields worth walking across.                                           */
function drawHedgerow(c, ox) {
  // Hawthorn laid the old way: thick, dark, with berries and a bare stem row
  rc(c, ox, 0, 16, 16, '#3c7a2c');
  rc(c, ox, 3, 16, 11, '#1c3c16');
  rc(c, ox, 4, 16, 8, '#25501c');
  for (const [dx, dy] of [[1,5],[6,4],[11,6],[14,4],[3,9],[8,10],[13,10]])
    rc(c, ox + dx, dy, 3, 2, '#2f6423');
  for (const [dx, dy] of [[2,5],[7,4],[12,6],[9,9]]) px(c, ox + dx, dy, '#3f7a2e');
  for (const [dx, dy] of [[10, 5], [3, 10]]) px(c, ox + dx, dy, '#8a2f2b');
  rc(c, ox, 13, 16, 1, '#153113');
}

function drawStook(c, ox) {
  // A sheaf stood on end to dry, tied at the waist
  rc(c, ox, 0, 16, 16, '#7d9440');
  rc(c, ox + 3, 13, 11, 3, '#5f7431');
  for (let i = 0; i < 7; i++) {
    const x = 3 + i;
    rc(c, ox + x, 12 - i, 2, 4 + i, '#c8a24e');
    rc(c, ox + 15 - x, 12 - i, 2, 4 + i, '#b08c3e');
  }
  rc(c, ox + 4, 2, 8, 4, '#dcbb63');
  rc(c, ox + 6, 1, 4, 2, '#eed27e');
  rc(c, ox + 3, 8, 10, 2, '#8a6c2c');
  px(c, ox + 7, 8, '#6b5220');
}

function drawSkep(c, ox) {
  // A straw bee skep on a plank stand
  rc(c, ox, 0, 16, 16, '#447f2c');
  rc(c, ox + 2, 13, 12, 2, '#6b4423');
  circle(c, ox + 8, 9, 6, '#8a6a26');
  circle(c, ox + 8, 9, 5, '#c49a3c');
  for (let y = 5; y <= 13; y += 2) rc(c, ox + 3, y, 10, 1, '#8a6a26');
  rc(c, ox + 6, 12, 4, 2, '#3a2a12');
  px(c, ox + 12, 4, '#e8d24a');
  px(c, ox + 13, 6, '#2a2410');
}

function drawBench(c, ox) {
  // A plank bench facing the lane
  rc(c, ox, 0, 16, 16, '#447f2c');
  rc(c, ox + 1, 6, 14, 3, '#8a6b3d');
  rc(c, ox + 1, 6, 14, 1, '#a07c48');
  rc(c, ox + 1, 3, 14, 2, '#6b4423');
  rc(c, ox + 2, 9, 2, 4, '#5a3a1c');
  rc(c, ox + 12, 9, 2, 4, '#5a3a1c');
  rc(c, ox + 1, 12, 14, 1, '#3d7a2a');
}

function drawMilestone(c, ox) {
  // A weathered waymark, leaning where the lane has worn round it
  rc(c, ox, 0, 16, 16, '#447f2c');
  rc(c, ox + 4, 12, 9, 3, '#3d7a2a');
  rc(c, ox + 5, 4, 7, 10, '#6f7264');
  rc(c, ox + 6, 3, 5, 11, '#9aa08c');
  rc(c, ox + 7, 4, 2, 9, '#bcc0ac');
  rc(c, ox + 10, 6, 1, 7, '#54574b');
  rc(c, ox + 6, 7, 5, 1, '#54574b');
  rc(c, ox + 6, 10, 4, 1, '#54574b');
}

function drawCorn(c, ox) {
  // Standing corn, shoulder-high to a hobbit and impossible to see through
  rc(c, ox, 0, 16, 16, '#8a9a42');
  for (let x = 0; x < 16; x += 3) {
    const wob = (x * 5) % 3;
    rc(c, ox + x, 2 + wob, 2, 14 - wob, '#b9a84e');
    rc(c, ox + x + 1, 3 + wob, 1, 12, '#d6c266');
    rc(c, ox + x, wob, 2, 3, '#e8d67e');
    px(c, ox + x + 1, wob, '#f4e8a0');
  }
  for (const [dx, dy] of [[2,9],[8,12],[13,6]]) px(c, ox + dx, dy, '#7d6c2c');
}

function drawHay(c, ox) {
  // Cut hay lying in swathes, walkable
  rc(c, ox, 0, 16, 16, '#a89a52');
  for (const [dx, dy, w] of [[0,2,9],[7,5,9],[2,8,11],[9,11,7],[0,14,12]]) {
    rc(c, ox + dx, dy, w, 2, '#c4b262');
    rc(c, ox + dx + 1, dy, w - 3, 1, '#dccb82');
  }
  for (const [dx, dy] of [[4,4],[12,9],[6,13],[14,2]]) px(c, ox + dx, dy, '#8a7c3c');
}


/* ── Smial interiors ──────────────────────────────────────────────────────
   Bag End is panelled, not plastered: "a very comfortable tunnel without
   smoke, with panelled walls, and floors tiled and carpeted, provided with
   polished chairs, and lots and lots of pegs for hats and coats".         */
function panelling(c, ox) {
  // Dark oak panelling. It has to read as a vertical surface against the lit
  // plank floor, or a smial is one flat sheet of brown.
  rc(c, ox, 0, 16, 16, '#3d2a17');
  rc(c, ox, 0, 16, 3, '#644627'); // the moulding catches the light
  rc(c, ox, 3, 16, 1, '#24170c');
  for (const x of [0, 5, 10, 15]) rc(c, ox + x, 4, 1, 12, '#24170c');
  for (const x of [1, 6, 11]) rc(c, ox + x, 5, 3, 9, '#4a3320');
  for (const x of [1, 6, 11]) rc(c, ox + x, 5, 3, 1, '#573c24');
  for (const [dx, dy] of [[2, 8], [7, 11], [12, 7]]) px(c, ox + dx, dy, '#5d4128');
  rc(c, ox, 15, 16, 1, '#1b1109');
}

function drawPanel(c, ox) {
  panelling(c, ox);
}

function drawPegs(c, ox) {
  panelling(c, ox);
  rc(c, ox, 4, 16, 1, '#4d3520');
  for (const x of [2, 7, 12]) {
    rc(c, ox + x, 5, 1, 2, '#3a2817');
    px(c, ox + x, 6, '#2a1c10');
  }
  // A cloak on one peg and a hat on another
  rc(c, ox + 6, 6, 4, 7, '#3f5a38');
  rc(c, ox + 7, 7, 2, 5, '#4e6f43');
  rc(c, ox + 11, 6, 4, 2, '#6a5330');
  rc(c, ox + 12, 5, 2, 2, '#7d6239');
}

function drawMapWall(c, ox) {
  panelling(c, ox);
  rc(c, ox + 2, 2, 12, 11, '#3a2817');
  rc(c, ox + 3, 3, 10, 9, '#d8caa2');
  // Coastline, mountains, and a small red mark in the east
  for (const [dx, dy, w] of [[4, 5, 3], [7, 4, 2], [9, 6, 3], [5, 9, 4]])
    rc(c, ox + dx, dy, w, 1, '#8a9a6a');
  for (const dx of [6, 8, 10]) {
    px(c, ox + dx, 7, '#7a6a52');
    px(c, ox + dx, 6, '#9a8a70');
  }
  px(c, ox + 11, 8, '#b03028');
  rc(c, ox + 3, 11, 10, 1, '#b8a982');
}

function drawSettle(c, ox) {
  // High-backed bench: keeps the draught off and the gossip in
  rc(c, ox, 0, 16, 16, '#a8804e');
  rc(c, ox, 3, 16, 1, '#8a6238');
  rc(c, ox, 11, 16, 1, '#8a6238');
  rc(c, ox + 1, 1, 14, 6, '#3d2a17');
  rc(c, ox + 2, 2, 12, 4, '#5a3f24');
  for (const x of [4, 8, 12]) rc(c, ox + x, 2, 1, 4, '#3d2a17');
  rc(c, ox + 1, 7, 14, 3, '#6b4a28');
  rc(c, ox + 1, 7, 14, 1, '#8a6238');
  rc(c, ox + 2, 10, 2, 4, '#3d2a17');
  rc(c, ox + 12, 10, 2, 4, '#3d2a17');
  rc(c, ox + 1, 13, 14, 1, '#7a5c34');
}

function drawChest(c, ox) {
  rc(c, ox, 0, 16, 16, '#8a6238');
  rc(c, ox + 1, 3, 14, 11, '#5a3a1c');
  rc(c, ox + 1, 3, 14, 4, '#7a5330');
  rc(c, ox + 2, 4, 12, 2, '#8d6238');
  rc(c, ox + 1, 7, 14, 1, '#3d2712');
  for (const x of [3, 12]) rc(c, ox + x, 3, 1, 11, '#c8a84e');
  rc(c, ox + 7, 7, 3, 3, '#c8a84e');
  px(c, ox + 8, 8, '#4a3a10');
  rc(c, ox + 1, 13, 14, 1, '#32200f');
}

export const TILE_FNS = [
  drawGrass, drawGrass2, drawPath, drawWater, drawTree,
  drawHill, drawHillTop, drawDoor, drawBridge, drawFence,
  drawBush, drawStone, drawFlowers, drawGarden, drawRoof,
  drawDoorL, drawDoorR, drawRoofL, drawRoofR,
  drawFloor, drawWall, drawRug, drawTable, drawFireplace,
  drawShelf, drawCounter, drawBed, drawWindowInt,
  drawFern, drawTree2, drawSign, drawVoid, drawDock, drawDockS,
  drawPartyTL, drawPartyTR, drawPartyBL, drawPartyBR, drawPartyTable, drawLantern,
  drawPartyNL, drawPartyNR, drawBog, drawReeds,
  drawWheel, drawCrate, drawWell, drawBarn, drawFeast, drawDitch, drawWaggon,
  drawPavTL, drawPavTR, drawPavBL, drawPavBR,
  drawMoundL, drawMoundR, drawBaseL, drawBaseR, drawWindowF,
  drawForestFloor, drawOldTree, drawRoots, drawDeadTree, drawDarkWater, drawLilies, drawDownGrass, drawStandingStone, drawBarrowWall, drawBarrowFloor, drawChalk, drawHedge,
  drawDownSlope, drawGreatStone, drawDownHeather,
  drawHedgerow, drawStook, drawSkep, drawBench, drawMilestone, drawCorn, drawHay,
  drawPegs, drawChest, drawMapWall, drawPanel, drawSettle,
];

export function makeTilesetDataURL() {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_FNS.length * TS;
  canvas.height = TS;
  const c = canvas.getContext('2d');
  TILE_FNS.forEach((fn, i) => fn(c, i * TS));
  return canvas.toDataURL();
}

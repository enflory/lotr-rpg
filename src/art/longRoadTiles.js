// Tiles for the long road: the ruined tower of Amon Sul, autumn woods and the
// shallows of the Bruinen. Drawn onto the shared strip by tiles.js.
import { px, rc, circle } from './helpers.js';

const dry = (c, ox) => {
  rc(c, ox, 0, 16, 16, '#7d8a4a');
  for (const [dx, dy, col] of [[2,3,'#6f7c40'],[9,2,'#8d9a56'],[6,9,'#6f7c40'],[12,12,'#8d9a56'],[1,13,'#6f7c40'],[13,6,'#6f7c40']])
    px(c, ox + dx, dy, col);
};

export function drawRuin(c, ox) {
  // Broken masonry: mortared courses, a jagged top edge, moss in the joints.
  dry(c, ox);
  rc(c, ox, 3, 16, 13, '#3c3e44');
  rc(c, ox + 1, 4, 14, 11, '#6f7279');
  for (const [x, y, w] of [[1,4,6],[8,4,7],[1,8,4],[6,8,5],[12,8,3],[1,12,7],[9,12,6]]) rc(c, ox + x, y, w, 3, '#8a8d94');
  for (const y of [7, 11]) rc(c, ox + 1, y, 14, 1, '#4c4f56');
  for (const [x, y] of [[7,4],[5,8],[11,8],[8,12]]) rc(c, ox + x, y, 1, 3, '#4c4f56');
  rc(c, ox + 2, 2, 4, 2, '#6f7279');
  rc(c, ox + 10, 1, 3, 3, '#6f7279');
  px(c, ox + 3, 1, '#8a8d94');
  for (const [x, y] of [[2,10],[10,6],[13,13],[4,5]]) px(c, ox + x, y, '#5a7a3a');
  rc(c, ox, 15, 16, 1, '#2a2c31');
}

export function drawRubble(c, ox) {
  dry(c, ox);
  for (const [x, y, w, h] of [[2,3,3,2],[9,6,4,3],[4,11,3,2],[12,1,2,2],[1,8,2,2]]) {
    rc(c, ox + x, y, w, h, '#7a7d84');
    rc(c, ox + x, y, w, 1, '#a0a3aa');
    rc(c, ox + x, y + h, w, 1, '#4c4f56');
  }
}

export function drawLeaves(c, ox) {
  rc(c, ox, 0, 16, 16, '#7c5a30');
  for (const [dx, dy, col] of [[2,2,'#b8742c'],[8,1,'#c8902c'],[12,4,'#9a4a24'],[5,6,'#c8902c'],[1,9,'#9a4a24'],[10,9,'#b8742c'],[7,13,'#c8902c'],[14,12,'#9a4a24'],[3,14,'#6a4a28'],[11,7,'#6a4a28']]) {
    rc(c, ox + dx, dy, 2, 1, col);
    px(c, ox + dx + 1, dy + 1, col);
  }
}

export function drawAutumnTree(c, ox) {
  rc(c, ox, 0, 16, 16, '#7c5a30');
  circle(c, ox + 8, 12, 5, '#5c4224');
  rc(c, ox + 6, 11, 4, 5, '#3c2a16');
  rc(c, ox + 7, 12, 2, 4, '#5a4026');
  circle(c, ox + 8, 6, 7, '#5a2a14');
  circle(c, ox + 8, 6, 6, '#a04a20');
  circle(c, ox + 7, 5, 4, '#c8782a');
  rc(c, ox + 4, 3, 2, 2, '#e0a83a');
  rc(c, ox + 8, 2, 3, 2, '#e0a83a');
  rc(c, ox + 6, 6, 2, 1, '#e0a83a');
  px(c, ox + 10, 4, '#f0c850');
  px(c, ox + 11, 7, '#8a3a1c');
}

export function drawFord(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9ec4');
  for (const [dx, dy] of [[1,2],[9,3],[5,8],[12,10],[3,13]]) {
    px(c, ox + dx, dy, '#a8dcee');
    px(c, ox + dx + 1, dy, '#d6f0f6');
  }
  for (const [dx, dy, col] of [[2,5,'#8a8a78'],[7,2,'#a09a84'],[11,6,'#8a8a78'],[4,10,'#a09a84'],[13,13,'#8a8a78'],[9,11,'#7a7a6c']]) rc(c, ox + dx, dy, 2, 2, col);
}

export function drawFirePit(c, ox) {
  dry(c, ox);
  circle(c, ox + 8, 8, 6, '#3c3e44');
  circle(c, ox + 8, 8, 5, '#23201c');
  circle(c, ox + 8, 8, 3, '#4a2a1a');
  px(c, ox + 8, 8, '#c8482a');
  for (const [x, y] of [[3,6],[5,3],[10,2],[13,6],[13,10],[10,13],[5,13],[2,10]]) rc(c, ox + x, y, 2, 2, '#8a8d94');
}
